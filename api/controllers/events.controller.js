import crypto from 'crypto'
import fs from 'fs/promises'
import sharp from 'sharp'
import { renderEventPublishedEmail } from '../lib/emailTemplates.js'
import { sendMail } from '../lib/mailer.js'
import prisma from '../lib/prisma.js'
import {
  eventContentImagePath,
  eventContentImageUrl,
  eventCoverPath,
  eventCoverUrl,
} from '../lib/storage.js'

function toPublicEvent(event) {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    place: event.place,
    date: event.date,
    content: event.content,
    coverImageUrl: event.coverImageUrl,
    published: event.published,
    notifiedAt: event.notifiedAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

function validateEventFields(body) {
  const { title, description, place, date } = body

  if (!title?.trim() || !description?.trim() || !place?.trim()) {
    return 'Nombre, descripción y lugar son obligatorios.'
  }
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return 'La fecha no es válida.'
  }
  return null
}

export async function listPublicEvents(req, res) {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
  })
  res.json({ events: events.map(toPublicEvent) })
}

export async function listEvents(req, res) {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
  })
  res.json({ events: events.map(toPublicEvent) })
}

export async function getEvent(req, res) {
  const { id } = req.params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado.' })
  }

  res.json({ event: toPublicEvent(event) })
}

export async function createEvent(req, res) {
  const error = validateEventFields(req.body)
  if (error) {
    return res.status(400).json({ error })
  }

  const { title, description, place, date, content } = req.body

  const event = await prisma.event.create({
    data: {
      title: title.trim(),
      description: description.trim(),
      place: place.trim(),
      date: new Date(date),
      content: content ?? '',
    },
  })

  res.status(201).json({ event: toPublicEvent(event) })
}

export async function updateEvent(req, res) {
  const { id } = req.params
  const { title, description, place, date, content, published } = req.body

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Evento no encontrado.' })
  }

  const data = {}
  if (title !== undefined) data.title = title.trim()
  if (description !== undefined) data.description = description.trim()
  if (place !== undefined) data.place = place.trim()
  if (date !== undefined) {
    if (Number.isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: 'La fecha no es válida.' })
    }
    data.date = new Date(date)
  }
  if (content !== undefined) data.content = content
  if (published !== undefined) {
    if (typeof published !== 'boolean') {
      return res.status(400).json({ error: 'Estado de publicación inválido.' })
    }
    data.published = published
  }

  const event = await prisma.event.update({ where: { id }, data })
  res.json({ event: toPublicEvent(event) })
}

export async function notifyEventPublished(req, res) {
  const { id } = req.params

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    return res.status(404).json({ error: 'Evento no encontrado.' })
  }
  if (!event.published) {
    return res.status(400).json({ error: 'El evento no está publicado.' })
  }

  const recipients = await prisma.user.findMany({
    where: { active: true, notifyEvents: true },
    select: { email: true },
  })

  const html = renderEventPublishedEmail({
    title: event.title,
    date: event.date,
    place: event.place,
    description: event.description,
  })

  let sent = 0
  for (const recipient of recipients) {
    try {
      await sendMail({ to: recipient.email, subject: `Nuevo evento: ${event.title}`, html })
      sent += 1
    } catch (err) {
      console.error('[mail] no se ha podido notificar a', recipient.email, err)
    }
  }

  await prisma.event.update({ where: { id }, data: { notifiedAt: new Date() } })

  res.json({ sent, total: recipients.length })
}

export async function deleteEvent(req, res) {
  const { id } = req.params

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Evento no encontrado.' })
  }

  await prisma.event.delete({ where: { id } })
  res.status(204).end()
}

export async function uploadEventCover(req, res) {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido ninguna imagen.' })
  }

  const existing = await prisma.event.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Evento no encontrado.' })
  }

  const resized = await sharp(req.file.buffer)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 82 })
    .toBuffer()

  await fs.writeFile(eventCoverPath(id), resized)

  const event = await prisma.event.update({
    where: { id },
    data: { coverImageUrl: eventCoverUrl(req, id) },
  })

  res.json({ event: toPublicEvent(event) })
}

export async function uploadEventContentImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se ha recibido ninguna imagen.' })
  }

  const resized = await sharp(req.file.buffer)
    .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const filename = `${crypto.randomUUID()}.webp`
  await fs.writeFile(eventContentImagePath(filename), resized)

  res.status(201).json({ url: eventContentImageUrl(req, filename) })
}
