import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

type MaintenanceContextValue = {
  maintenanceMode: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const MaintenanceContext = createContext<MaintenanceContextValue | undefined>(undefined)

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [])

  async function refresh() {
    try {
      const res = await api.get<{ maintenanceMode: boolean }>('/settings')
      setMaintenanceMode(res.data.maintenanceMode)
    } catch {
      setMaintenanceMode(false)
    }
  }

  return (
    <MaintenanceContext.Provider value={{ maintenanceMode, loading, refresh }}>
      {children}
    </MaintenanceContext.Provider>
  )
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext)
  if (!context) {
    throw new Error('useMaintenance debe usarse dentro de un MaintenanceProvider.')
  }
  return context
}
