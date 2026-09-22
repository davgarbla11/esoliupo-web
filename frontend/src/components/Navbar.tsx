import { Menu, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoIcon from '../assets/icon-mark.png'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/actividades', label: 'Actividades' },
  { to: '/contacto', label: 'Contacto' },
]

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const { user } = useAuth()
  const transparent = !scrolled && !open

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        transparent
          ? 'border-transparent bg-transparent'
          : 'border-white/10 bg-black/70 backdrop-blur-md'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="ESOLIUPO" className="h-8 w-auto" />
          <span className="text-lg font-semibold tracking-tight text-white">
            ESOLIUPO
          </span>
        </NavLink>

        <div className="hidden items-center gap-8 md:flex">
          <ul className="flex items-center gap-8">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `border-b-2 py-1 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-gold-400 text-white'
                        : 'border-transparent text-white/70 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {user ? (
            <NavLink to="/dashboard" aria-label="Ir a mi panel">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-gold-400/60 transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-400 text-sm font-semibold text-neutral-900 ring-2 ring-gold-400/60 transition-transform hover:scale-105">
                  {user.name[0]?.toUpperCase()}
                </div>
              )}
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-105"
            >
              <UserRound size={16} />
              Área de Socio
            </NavLink>
          )}
        </div>

        <button
          type="button"
          className="text-white transition-colors md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul className="flex flex-col gap-1 border-t border-white/10 bg-black px-6 py-4 text-white md:hidden">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="mt-2">
            {user ? (
              <NavLink
                to="/dashboard"
                className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-xs font-semibold text-neutral-900">
                    {user.name[0]?.toUpperCase()}
                  </div>
                )}
                {user.name}
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center justify-center gap-1.5 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-neutral-900"
              >
                <UserRound size={16} />
                Área de Socio
              </NavLink>
            )}
          </li>
        </ul>
      )}
    </header>
  )
}

export default Navbar
