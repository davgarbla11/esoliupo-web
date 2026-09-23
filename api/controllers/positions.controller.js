import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

function toPublicPosition(position) {
  return {
    id: position.id,
    name: position.name,
    user: position.user
      ? { id: position.user.id, name: position.user.name, email: position.user.email }
      : null,
  }
}

export async function listPositions(req, res) {
  const positions = await prisma.position.findMany({
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ positions: positions.map(toPublicPosition) })
}

export async function createPosition(req, res) {
  const { name, userId } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ error: 'El cargo necesita un nombre.' })
  }

  const existing = await prisma.position.findUnique({ where: { name: name.trim() } })
  if (existing) {
    return res.status(409).json({ error: 'Ya existe un cargo con ese nombre.' })
  }

  if (userId) {
    const alreadyAssigned = await prisma.position.findUnique({ where: { userId } })
    if (alreadyAssigned) {
      return res.status(409).json({ error: 'Ese usuario ya ocupa otro cargo.' })
    }
  }

  const position = await prisma.position.create({
    data: { name: name.trim(), userId: userId || null },
    include: { user: true },
  })

  if (userId) {
    await promoteIfNeeded(userId)
  }

  res.status(201).json({ position: toPublicPosition(position) })
}

export async function updatePosition(req, res) {
  const { id } = req.params
  const { name, userId } = req.body

  const position = await prisma.position.findUnique({ where: { id } })
  if (!position) {
    return res.status(404).json({ error: 'Cargo no encontrado.' })
  }

  const data = {}

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ error: 'El cargo necesita un nombre.' })
    }
    data.name = name.trim()
  }

  if (userId !== undefined) {
    if (userId) {
      const alreadyAssigned = await prisma.position.findUnique({ where: { userId } })
      if (alreadyAssigned && alreadyAssigned.id !== id) {
        return res.status(409).json({ error: 'Ese usuario ya ocupa otro cargo.' })
      }
    }
    data.userId = userId || null
  }

  const updated = await prisma.position.update({
    where: { id },
    data,
    include: { user: true },
  })

  if (userId) {
    await promoteIfNeeded(userId)
  }

  res.json({ position: toPublicPosition(updated) })
}

export async function deletePosition(req, res) {
  const { id } = req.params

  const position = await prisma.position.findUnique({ where: { id } })
  if (!position) {
    return res.status(404).json({ error: 'Cargo no encontrado.' })
  }

  await prisma.position.delete({ where: { id } })
  res.status(204).end()
}

async function promoteIfNeeded(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (user && user.role !== ROLES.ADMINISTRADOR && user.role !== ROLES.JUNTA_DIRECTIVA) {
    await prisma.user.update({ where: { id: userId }, data: { role: ROLES.JUNTA_DIRECTIVA } })
  }
}
