import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../context/AuthContext'
import { useAuth } from '../context/AuthContext'
import { isAtLeast } from '../lib/rbac'

function ProtectedRoute({
  children,
  minRole,
}: {
  children: ReactNode
  minRole?: Role
}) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="animate-spin text-gold-400" size={28} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (minRole && !isAtLeast(user.role, minRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
