import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useMaintenance } from '../context/MaintenanceContext'
import { isAtLeast } from '../lib/rbac'
import Maintenance from '../pages/Maintenance'

function MaintenanceGate({ children }: { children: ReactNode }) {
  const { maintenanceMode, loading: maintenanceLoading } = useMaintenance()
  const { user, loading: authLoading } = useAuth()

  if (maintenanceLoading || authLoading) {
    return null
  }

  if (maintenanceMode && !isAtLeast(user?.role, 'ADMINISTRADOR')) {
    return <Maintenance />
  }

  return <>{children}</>
}

export default MaintenanceGate
