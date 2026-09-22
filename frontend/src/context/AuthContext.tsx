import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

export type Role = 'SOCIO' | 'COLABORADOR_EXTERNO' | 'JUNTA_DIRECTIVA' | 'ADMINISTRADOR'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  photoUrl: string | null
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  loginWithGoogle: (credential: string) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ user: User }>('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await api.post<{ user: User }>('/auth/login', { email, password })
    setUser(res.data.user)
    return res.data.user
  }

  async function loginWithGoogle(credential: string) {
    const res = await api.post<{ user: User }>('/auth/google', { credential })
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    await api.post('/auth/logout')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.')
  }
  return context
}
