import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

function toPublicMember(user) {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    position: user.position,
    studies: user.studies,
    photoUrl: user.photoUrl,
  }
}

export async function listPublicMembers(req, res) {
  const users = await prisma.user.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  })

  const board = users
    .filter((u) => u.role === ROLES.ADMINISTRADOR || u.role === ROLES.JUNTA_DIRECTIVA)
    .sort((a, b) => (a.role === b.role ? 0 : a.role === ROLES.ADMINISTRADOR ? -1 : 1))
    .map(toPublicMember)

  const collaborators = users
    .filter((u) => u.role === ROLES.COLABORADOR_EXTERNO)
    .map(toPublicMember)

  const members = users.filter((u) => u.role === ROLES.SOCIO).map(toPublicMember)

  res.json({ board, collaborators, members })
}
