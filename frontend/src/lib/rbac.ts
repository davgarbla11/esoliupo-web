import type { Role } from '../context/AuthContext'

const ROLE_RANK: Record<Role, number> = {
  SOCIO: 1,
  JUNTA_DIRECTIVA: 2,
  ADMINISTRADOR: 3,
}

export function isAtLeast(role: Role | undefined, minRole: Role) {
  if (!role) return false
  return ROLE_RANK[role] >= ROLE_RANK[minRole]
}
