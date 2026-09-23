import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardFooter from '../components/dashboard/DashboardFooter'
import Sidebar from '../components/dashboard/Sidebar'
import HeroBackground from '../components/HeroBackground'

const COLLAPSED_KEY = 'esoliupo-sidebar-collapsed'

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
    } catch {}
  }, [collapsed])

  return (
    <div className="min-h-screen text-white">
      <HeroBackground subtle />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />

        <div
          className={`flex min-w-0 flex-1 flex-col transition-[padding] duration-300 ${
            collapsed ? 'lg:pl-0' : 'lg:pl-64'
          }`}
        >
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
    </div>
  )
}

export default DashboardLayout
