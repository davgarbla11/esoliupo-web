import {
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
  UserCheck,
  Users2,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoIcon from '../../assets/icon-mark.png'
import { type Role, useAuth } from '../../context/AuthContext'
import { isAtLeast } from '../../lib/rbac'

const modules = [
  { to: '/dashboard', label: 'Inicio', icon: LayoutDashboard, minRole: 'SOCIO' as Role, end: true },
  { to: '/dashboard/eventos', label: 'Eventos', icon: Calendar, minRole: 'SOCIO' as Role },
  { to: '/dashboard/formaciones', label: 'Formaciones', icon: GraduationCap, minRole: 'SOCIO' as Role },
  { to: '/dashboard/perfil', label: 'Mi perfil', icon: User, minRole: 'SOCIO' as Role },
  { to: '/dashboard/comisiones', label: 'Comisiones', icon: Users2, minRole: 'JUNTA_DIRECTIVA' as Role },
  { to: '/dashboard/socios', label: 'Socios', icon: UserCheck, minRole: 'JUNTA_DIRECTIVA' as Role },
  { to: '/dashboard/usuarios', label: 'Usuarios y roles', icon: ShieldCheck, minRole: 'ADMINISTRADOR' as Role },
]

const roleLabels: Record<Role, string> = {
  SOCIO: 'Socio',
  JUNTA_DIRECTIVA: 'Junta Directiva',
  ADMINISTRADOR: 'Administrador',
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <img src={logoIcon} alt="ESOLIUPO" className="h-8 w-auto" />
        <span className="text-lg font-semibold tracking-tight text-white">
          ESOLIUPO
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {modules
          .filter((item) => isAtLeast(user?.role, item.minRole))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-400/10 text-gold-400'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-sm font-semibold text-neutral-900">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-white/50">
              {user ? roleLabels[user.role] : ''}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => logout()}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

type SidebarProps = {
  mobileOpen: boolean
  onClose: () => void
}

function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden w-64 flex-col border-r border-white/10 bg-black lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-black">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-5 text-white/60 hover:text-white"
              aria-label="Cerrar menú"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
