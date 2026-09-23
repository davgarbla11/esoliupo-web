import prisma from '../lib/prisma.js'

function toPublicLeaveRequest(request) {
  return {
    id: request.id,
    userId: request.userId,
    userName: request.user.name,
    userEmail: request.user.email,
    reason: request.reason,
    createdAt: request.createdAt,
  }
}

export async function createLeaveRequest(req, res) {
  const { reason } = req.body
  const userId = req.user.sub

  const existing = await prisma.leaveRequest.findFirst({
    where: { userId, status: 'PENDING' },
  })
  if (existing) {
    return res.status(409).json({ error: 'Ya tienes una solicitud de baja pendiente.' })
  }

  await prisma.leaveRequest.create({
    data: { userId, reason: reason?.trim() || null },
  })

  res.status(201).json({})
}

export async function listLeaveRequests(req, res) {
  const requests = await prisma.leaveRequest.findMany({
    where: { status: 'PENDING' },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json({ requests: requests.map(toPublicLeaveRequest) })
}

export async function approveLeaveRequest(req, res) {
  const { id } = req.params

  const request = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!request) {
    return res.status(404).json({ error: 'Solicitud no encontrada.' })
  }

  await prisma.user.update({ where: { id: request.userId }, data: { active: false } })
  await prisma.leaveRequest.update({ where: { id }, data: { status: 'APPROVED' } })

  res.json({})
}

export async function deleteLeaveRequest(req, res) {
  const { id } = req.params

  const request = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!request) {
    return res.status(404).json({ error: 'Solicitud no encontrada.' })
  }

  await prisma.leaveRequest.delete({ where: { id } })
  res.status(204).end()
}
