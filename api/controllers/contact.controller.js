import { renderContactReplyEmail } from '../lib/emailTemplates.js'
import { sendMail } from '../lib/mailer.js'
import prisma from '../lib/prisma.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toPublicContactMessage(message) {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    message: message.message,
    status: message.status,
    reply: message.reply,
    repliedBy: message.repliedBy?.name ?? null,
    repliedAt: message.repliedAt,
    createdAt: message.createdAt,
  }
}

export async function createContactMessage(req, res) {
  const { name, email, message } = req.body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Nombre, correo y mensaje son obligatorios.' })
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: 'Introduce un correo válido.' })
  }

  const contactMessage = await prisma.contactMessage.create({
    data: { name: name.trim(), email: email.trim(), message: message.trim() },
  })

  res.status(201).json({ message: toPublicContactMessage(contactMessage) })
}

export async function listContactMessages(req, res) {
  const messages = await prisma.contactMessage.findMany({
    include: { repliedBy: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ messages: messages.map(toPublicContactMessage) })
}

export async function replyToContactMessage(req, res) {
  const { id } = req.params
  const { reply } = req.body

  if (!reply?.trim()) {
    return res.status(400).json({ error: 'Escribe una respuesta antes de enviarla.' })
  }

  const contactMessage = await prisma.contactMessage.findUnique({ where: { id } })
  if (!contactMessage) {
    return res.status(404).json({ error: 'Mensaje no encontrado.' })
  }

  await sendMail({
    to: contactMessage.email,
    subject: 'ESOLIUPO — respuesta a tu consulta',
    html: renderContactReplyEmail({
      name: contactMessage.name,
      message: contactMessage.message,
      reply: reply.trim(),
    }),
  })

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: {
      reply: reply.trim(),
      status: 'ANSWERED',
      repliedAt: new Date(),
      repliedById: req.user.sub,
    },
    include: { repliedBy: true },
  })

  res.json({ message: toPublicContactMessage(updated) })
}
