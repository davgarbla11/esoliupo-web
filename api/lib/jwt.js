import jwt from 'jsonwebtoken'

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env

export function signAuthToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyAuthToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
