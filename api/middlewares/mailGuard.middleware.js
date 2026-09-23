import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export function requireSameOrigin(req, res, next) {
  const origin = req.get('origin') ?? req.get('referer')

  if (origin && !origin.startsWith(process.env.CORS_ORIGIN)) {
    return res.status(403).json({ error: 'Origen no permitido.' })
  }

  next()
}

export const mailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.sub ?? ipKeyGenerator(req.ip),
  message: { error: 'Demasiados envíos de correo en poco tiempo. Inténtalo más tarde.' },
})
