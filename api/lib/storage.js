import fs from 'fs'
import path from 'path'

export const STORAGE_DIR = path.resolve('storage')
export const AVATARS_DIR = path.join(STORAGE_DIR, 'avatars')
export const EVENT_COVERS_DIR = path.join(STORAGE_DIR, 'events', 'covers')
export const EVENT_CONTENT_DIR = path.join(STORAGE_DIR, 'events', 'content')

fs.mkdirSync(AVATARS_DIR, { recursive: true })
fs.mkdirSync(EVENT_COVERS_DIR, { recursive: true })
fs.mkdirSync(EVENT_CONTENT_DIR, { recursive: true })

export function avatarPath(userId) {
  return path.join(AVATARS_DIR, `${userId}.webp`)
}

export function avatarUrl(req, userId) {
  const version = Date.now()
  return `${req.protocol}://${req.get('host')}/api/uploads/avatars/${userId}.webp?v=${version}`
}

export function eventCoverPath(eventId) {
  return path.join(EVENT_COVERS_DIR, `${eventId}.webp`)
}

export function eventCoverUrl(req, eventId) {
  const version = Date.now()
  return `${req.protocol}://${req.get('host')}/api/uploads/events/covers/${eventId}.webp?v=${version}`
}

export function eventContentImagePath(filename) {
  return path.join(EVENT_CONTENT_DIR, filename)
}

export function eventContentImageUrl(req, filename) {
  return `${req.protocol}://${req.get('host')}/api/uploads/events/content/${filename}`
}
