import type { Role } from '../context/AuthContext'

export type AuditLogEntry = {
  id: string
  userId: string | null
  userEmail: string
  role: Role
  ip: string
  method: string
  path: string
  statusCode: number
  createdAt: string
}
