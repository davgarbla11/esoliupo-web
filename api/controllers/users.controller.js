import prisma from '../lib/prisma.js'
import { ROLES } from '../lib/rbac.js'

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  }
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
