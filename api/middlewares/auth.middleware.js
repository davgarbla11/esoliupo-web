import prisma from '../lib/prisma.js'
import { hasPermission, isAtLeast } from '../lib/rbac.js'
import { verifyAuthToken } from '../lib/jwt.js'

export async function requireAuth(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'No autenticado.' })
  }

  let payload
  try {
    payload = verifyAuthToken(token)
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o caducada.' })
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })

  if (!user || !user.active) {
    return res.status(401).json({ error: 'Sesión inválida o caducada.' })
  }

  req.user = { sub: user.id, role: user.role }
  next()
}

export function requireRole(minRole) {
  return (req, res, next) => {
    if (!req.user || !isAtLeast(req.user.role, minRole)) {
      return res.status(403).json({ error: 'No tienes permisos para esto.' })
    }
    next()
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user || !hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'No tienes permisos para esto.' })
    }
    next()
  }
}

export function requireSelfOrPermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' })
    }
    const isSelf = req.params.id === req.user.sub
    if (!isSelf && !hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: 'No tienes permisos para esto.' })
    }
    next()
  }
}
