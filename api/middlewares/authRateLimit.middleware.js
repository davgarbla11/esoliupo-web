import rateLimit, { ipKeyGenerator } from 'express-rate-limit'

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  message: { error: 'Demasiados intentos. Inténtalo de nuevo más tarde.' },
})
