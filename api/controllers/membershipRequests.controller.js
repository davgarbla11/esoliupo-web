import bcrypt from 'bcryptjs'
import {
  renderMembershipApprovedEmail,
  renderMembershipRequestReceivedEmail,
} from '../lib/emailTemplates.js'
import { sendMail } from '../lib/mailer.js'
import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function createMembershipRequest(req, res) {
  const { name, email, motivation, isUpoStudent } = req.body

  if (!name?.trim() || !email?.trim() || !motivation?.trim()) {
    return res.status(400).json({ error: 'Nombre, correo y motivo son obligatorios.' })
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Introduce un correo válido.' })
  }

  if (typeof isUpoStudent !== 'boolean') {
    return res.status(400).json({ error: 'Indica si estudias en la UPO.' })
  }

  const request = await prisma.membershipRequest.create({
    data: { name: name.trim(), email: email.trim(), motivation: motivation.trim(), isUpoStudent },
  })

  try {
    await sendMail({
      to: request.email,
      subject: 'ESOLIUPO — hemos recibido tu solicitud',
      html: renderMembershipRequestReceivedEmail({ name: request.name }),
    })
  } catch (err) {
    console.error('[mail] no se ha podido confirmar la solicitud a', request.email, err)
  }

  res.status(201).json({ request })
}

export async function listMembershipRequests(req, res) {
  const requests = await prisma.membershipRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ requests })
}

export async function approveMembershipRequest(req, res) {
  const { id } = req.params
  const { email, password } = req.body

  if (!email?.trim() || !EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Introduce la cuenta corporativa (correo válido).' })
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña temporal debe tener al menos 8 caracteres.' })
  }

  const request = await prisma.membershipRequest.findUnique({ where: { id } })
  if (!request) {
    return res.status(404).json({ error: 'Solicitud no encontrada.' })
  }

  const corporateEmail = email.trim()
  const existingUser = await prisma.user.findUnique({ where: { email: corporateEmail } })
  if (existingUser) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: request.name,
      email: corporateEmail,
      passwordHash,
      role: ROLES.SOCIO,
    },
  })

  await prisma.membershipRequest.update({
    where: { id },
    data: { status: 'APPROVED' },
  })

  let emailSent = true
  try {
    await sendMail({
      to: request.email,
      subject: 'ESOLIUPO — ya eres socio',
      html: renderMembershipApprovedEmail({ name: request.name, email: corporateEmail, password }),
    })
  } catch (err) {
    emailSent = false
    console.error('[mail] no se ha podido enviar el alta a', request.email, err)
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    emailSent,
  })
}

export async function deleteMembershipRequest(req, res) {
  const { id } = req.params

  const request = await prisma.membershipRequest.findUnique({ where: { id } })
  if (!request) {
    return res.status(404).json({ error: 'Solicitud no encontrada.' })
  }

  await prisma.membershipRequest.delete({ where: { id } })
  res.status(204).end()
}
