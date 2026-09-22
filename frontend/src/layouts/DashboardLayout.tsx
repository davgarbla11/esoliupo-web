import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardFooter from '../components/dashboard/DashboardFooter'
import Sidebar from '../components/dashboard/Sidebar'

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="text-white/70 hover:text-white"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-semibold tracking-tight">ESOLIUPO</span>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <DashboardFooter />
      </div>
    </div>
  )
}

export default DashboardLayout
