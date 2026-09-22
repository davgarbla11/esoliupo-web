import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  }
}

function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12)
}

export async function listUsers(req, res) {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
  res.json({ users: users.map(toPublicUser) })
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

  const updated = await prisma.user.update({ where: { id }, data: { role } })
  res.json({ user: toPublicUser(updated) })
}

export async function updateUserStatus(req, res) {
  const { id } = req.params
  const { active } = req.body

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Estado inválido.' })
  }

  if (id === req.user.sub && !active) {
    return res.status(400).json({ error: 'No puedes darte de baja a ti mismo.' })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const updated = await prisma.user.update({ where: { id }, data: { active } })
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
  await prisma.user.update({ where: { id }, data: { passwordHash } })

  res.json({ temporaryPassword })
}
