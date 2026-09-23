import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { verifyGoogleToken } from '../lib/googleAuth.js'
import prisma from '../lib/prisma.js'
import { signAuthToken } from '../lib/jwt.js'

const COOKIE_NAME = 'token'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  }
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    photoUrl: user.photoUrl,
    studies: user.studies,
    notifyEvents: user.notifyEvents,
  }
}

export async function register(req, res) {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  })

  const token = signAuthToken({ sub: user.id, role: user.role })
  res.cookie(COOKIE_NAME, token, cookieOptions())
  res.status(201).json({ user: toPublicUser(user) })
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false

  if (!user || !passwordMatches) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Tu cuenta ha sido dada de baja. Contacta con la asociación.' })
  }

  const token = signAuthToken({ sub: user.id, role: user.role })
  res.cookie(COOKIE_NAME, token, cookieOptions())
  res.json({ user: toPublicUser(user) })
}

export async function googleLogin(req, res) {
  const { credential } = req.body

  if (!credential) {
    return res.status(400).json({ error: 'Falta el token de Google.' })
  }

  let payload
  try {
    payload = await verifyGoogleToken(credential)
  } catch {
    return res.status(401).json({ error: 'No se ha podido verificar la cuenta de Google.' })
  }

  if (!payload?.email || !payload.email_verified) {
    return res.status(401).json({ error: 'Tu cuenta de Google no tiene el correo verificado.' })
  }

  let user = await prisma.user.findUnique({ where: { email: payload.email } })

  if (!user) {
    const randomPasswordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10)
    user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name || payload.email,
        passwordHash: randomPasswordHash,
        photoUrl: payload.picture || null,
      },
    })
  }

  if (!user.active) {
    return res.status(403).json({ error: 'Tu cuenta ha sido dada de baja. Contacta con la asociación.' })
  }

  const token = signAuthToken({ sub: user.id, role: user.role })
  res.cookie(COOKIE_NAME, token, cookieOptions())
  res.json({ user: toPublicUser(user) })
}

export async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  res.status(204).end()
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } })

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  res.json({ user: toPublicUser(user) })
}
