import prisma from '../lib/prisma.js'

const TITLE_MAX_LENGTH = 120
const MESSAGE_MAX_LENGTH = 500

function toPublicAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    createdAt: announcement.createdAt,
  }
}

function toAdminAnnouncement(announcement) {
  return {
    id: announcement.id,
    title: announcement.title,
    message: announcement.message,
    active: announcement.active,
    createdAt: announcement.createdAt,
    updatedAt: announcement.updatedAt,
  }
}

export async function listActiveAnnouncements(req, res) {
  const announcements = await prisma.announcement.findMany({
    where: { active: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ announcements: announcements.map(toPublicAnnouncement) })
}

export async function listAnnouncements(req, res) {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json({ announcements: announcements.map(toAdminAnnouncement) })
}

export async function createAnnouncement(req, res) {
  const { title, message } = req.body

  if (!title?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'El título y el mensaje son obligatorios.' })
  }
  if (title.trim().length > TITLE_MAX_LENGTH) {
    return res.status(400).json({ error: `El título no puede superar los ${TITLE_MAX_LENGTH} caracteres.` })
  }
  if (message.trim().length > MESSAGE_MAX_LENGTH) {
    return res.status(400).json({ error: `El mensaje no puede superar los ${MESSAGE_MAX_LENGTH} caracteres.` })
  }

  const announcement = await prisma.announcement.create({
    data: {
      title: title.trim(),
      message: message.trim(),
      authorId: req.user.sub,
    },
  })

  res.status(201).json({ announcement: toAdminAnnouncement(announcement) })
}

export async function updateAnnouncementStatus(req, res) {
  const { id } = req.params
  const { active } = req.body

  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'Estado inválido.' })
  }

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Anuncio no encontrado.' })
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: { active },
  })

  res.json({ announcement: toAdminAnnouncement(updated) })
}

export async function deleteAnnouncement(req, res) {
  const { id } = req.params

  const existing = await prisma.announcement.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ error: 'Anuncio no encontrado.' })
  }

  await prisma.announcement.delete({ where: { id } })
  res.status(204).end()
}
