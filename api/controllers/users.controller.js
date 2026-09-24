import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import fs from 'fs/promises'
import sharp from 'sharp'
import { renderPasswordResetEmail } from '../lib/emailTemplates.js'
import { sendMail } from '../lib/mailer.js'
import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'
import { avatarPath, avatarUrl } from '../lib/storage.js'

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    position: user.position?.name ?? null,
    studies: user.studies,
    photoUrl: user.photoUrl,
    notifyEvents: user.notifyEvents,
    createdAt: user.createdAt,
  }
}

function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12)
}

export async function getNotifiableCount(req, res) {
  const count = await prisma.user.count({ where: { active: true, notifyEvents: true } })
  res.json({ count })
}

export async function listUserDirectory(req, res) {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: 'asc' },
  })
  res.json({ users })
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({
    include: { position: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ users: users.map(toPublicUser) })
}

export async function createUser(req, res) {
  const { name, email, role } = req.body

  if (!name?.trim() || !email?.trim()) {
    return res.status(400).json({ error: 'Nombre y correo son obligatorios.' })
  }

  const finalRole = role || ROLES.SOCIO
  if (!Object.values(ROLES).includes(finalRole)) {
    return res.status(400).json({ error: 'Rol inválido.' })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.trim() } })
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 10)

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim(),
      passwordHash,
      role: finalRole,
      mustChangePassword: true,
    },
    include: { position: true },
  })

  res.status(201).json({ user: toPublicUser(user), temporaryPassword })
}

export async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ error: 'Rol inválido.' })
  }

  if (id === req.user.sub && role !== ROLES.ADMINISTRADOR) {
    return res.status(400).json({ error: 'No puedes quitarte a ti mismo el rol de Administrador.' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    include: { position: true },
  })
  res.json({ user: toPublicUser(updated) })
}

export async function updateUserStatus(req, res) {
  const { id } = req.params
  const { active } = req.body

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Estado inválido.' })
  }

  if (id === req.user.sub && !active && req.user.role === ROLES.ADMINISTRADOR) {
    return res
      .status(400)
      .json({ error: 'Un Administrador no puede darse de baja a sí mismo.' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { active },
    include: { position: true },
  })
  res.json({ user: toPublicUser(updated) })
}

export async function updateUserProfile(req, res) {
  const { id } = req.params
  const { studies, photoUrl, notifyEvents } = req.body

  const data = {}
  if (studies !== undefined) data.studies = studies?.trim() || null
  if (photoUrl !== undefined) data.photoUrl = photoUrl?.trim() || null
  if (notifyEvents !== undefined) {
    if (typeof notifyEvents !== 'boolean') {
      return res.status(400).json({ error: 'Preferencia inválida.' })
    }
    data.notifyEvents = notifyEvents
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    include: { position: true },
  })
  res.json({ user: toPublicUser(updated) })
}

export async function uploadUserAvatar(req, res) {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido ninguna imagen.' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const resized = await sharp(req.file.buffer)
    .resize(512, 512, { fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()

  await fs.writeFile(avatarPath(id), resized)

  const updated = await prisma.user.update({
    where: { id },
    data: { photoUrl: avatarUrl(req, id) },
    include: { position: true },
  })

  res.json({ user: toPublicUser(updated) })
}

export async function deleteUserAvatar(req, res) {
  const { id } = req.params

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  try {
    await fs.unlink(avatarPath(id))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { photoUrl: null },
    include: { position: true },
  })

  res.json({ user: toPublicUser(updated) })
}

export async function resetUserPassword(req, res) {
  const { id } = req.params

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 10)
  await prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } })

  let emailSent = true
  try {
    await sendMail({
      to: user.email,
      subject: 'ESOLIUPO — se ha restablecido tu contraseña',
      html: renderPasswordResetEmail({
        name: user.name,
        email: user.email,
        password: temporaryPassword,
      }),
    })
  } catch (err) {
    emailSent = false
    console.error('[mail] no se ha podido enviar el restablecimiento a', user.email, err)
  }

  res.json({ temporaryPassword, emailSent })
}
