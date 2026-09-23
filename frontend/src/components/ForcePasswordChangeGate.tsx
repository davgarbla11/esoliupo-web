import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import ForcePasswordChange from '../pages/ForcePasswordChange'

function ForcePasswordChangeGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (!loading && user?.mustChangePassword) {
    return <ForcePasswordChange />
  }

  return <>{children}</>
}

export default ForcePasswordChangeGate
