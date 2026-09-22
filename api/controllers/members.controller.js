import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

function toPublicMember(user, position) {
  return {
    id: user.id,
    name: user.name,
    position: position ?? null,
    studies: user.studies,
    photoUrl: user.photoUrl,
  }
}

export async function listPublicMembers(req, res) {
  const positions = await prisma.position.findMany({
    where: { user: { active: true } },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })

  const board = positions.map((p) => toPublicMember(p.user, p.name))

  const boardUserIds = new Set(positions.map((p) => p.user.id))

  const otherUsers = await prisma.user.findMany({
    where: { active: true, id: { notIn: [...boardUserIds] } },
  })

  const collaborators = otherUsers
    .filter((u) => u.role === ROLES.COLABORADOR_EXTERNO)
    .map((u) => toPublicMember(u))

  const members = otherUsers
    .filter((u) => u.role === ROLES.SOCIO)
    .map((u) => toPublicMember(u))

  res.json({ board, collaborators, members })
}
