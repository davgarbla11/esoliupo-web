import { verifyAuthToken } from '../lib/jwt.js'

export function requireAuth(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ error: 'No autenticado.' })
  }

  try {
    req.user = verifyAuthToken(token)
    next()
  } catch {
    return res.status(401).json({ error: 'Sesión inválida o caducada.' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esto.' })
    }
    next()
  }
}
