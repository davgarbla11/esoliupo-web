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
    mustChangePassword: user.mustChangePassword,
  }
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

  const workspaceDomain = process.env.GOOGLE_WORKSPACE_DOMAIN
  if (workspaceDomain) {
    const emailDomain = payload.email.split('@')[1]?.toLowerCase()
    if (payload.hd !== workspaceDomain && emailDomain !== workspaceDomain) {
      return res.status(403).json({ error: 'Solo se permiten cuentas de Google del dominio de la asociación.' })
    }
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

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Introduce tu contraseña actual y la nueva.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!currentMatches) {
    return res.status(401).json({ error: 'La contraseña actual no es correcta.' })
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  })

  res.json({ user: toPublicUser(updated) })
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } })

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' })
  }

  res.json({ user: toPublicUser(user) })
}
