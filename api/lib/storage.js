import fs from 'fs'
import path from 'path'

export const STORAGE_DIR = path.resolve('storage')
export const AVATARS_DIR = path.join(STORAGE_DIR, 'avatars')

fs.mkdirSync(AVATARS_DIR, { recursive: true })

export function avatarPath(userId) {
  return path.join(AVATARS_DIR, `${userId}.webp`)
}

export function avatarUrl(req, userId) {
  const version = Date.now()
  return `${req.protocol}://${req.get('host')}/api/uploads/avatars/${userId}.webp?v=${version}`
}
