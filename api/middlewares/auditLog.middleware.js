import prisma from '../lib/prisma.js'
import { ROLES, isAtLeast } from '../lib/rbac.js'

export function auditLog(req, res, next) {
  res.on('finish', () => {
    const user = req.user
    if (!user || !isAtLeast(user.role, ROLES.JUNTA_DIRECTIVA)) {
      return
    }

    prisma.auditLog
      .create({
        data: {
          userId: user.sub,
          userEmail: user.email,
          role: user.role,
          ip: req.ip,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
        },
      })
      .catch((err) => console.error('[audit] no se ha podido guardar el registro', err))
  })

  next()
}
