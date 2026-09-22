import { Menu, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import logoIcon from '../assets/icon-mark.png'

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
  const isHome = pathname === '/'
  const transparent = isHome && !scrolled && !open

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
          : isHome
            ? 'border-white/10 bg-black/70 backdrop-blur-md'
            : 'border-neutral-200 bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="ESOLIUPO" className="h-8 w-auto" />
          <span
            className={`text-lg font-semibold tracking-tight transition-colors ${
              isHome ? 'text-white' : 'text-neutral-900'
            }`}
          >
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
                        ? isHome
                          ? 'border-gold-400 text-white'
                          : 'border-gold-400 text-neutral-900'
                        : isHome
                          ? 'border-transparent text-white/70 hover:text-white'
                          : 'border-transparent text-neutral-500 hover:text-neutral-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <NavLink
            to="/area-socio"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] transition-transform hover:scale-105"
          >
            <UserRound size={16} />
            Área de Socio
          </NavLink>
        </div>

        <button
          type="button"
          className={`transition-colors md:hidden ${isHome ? 'text-white' : 'text-neutral-900'}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <ul
          className={`flex flex-col gap-1 border-t px-6 py-4 md:hidden ${
            isHome
              ? 'border-white/10 bg-black text-white'
              : 'border-neutral-200 bg-white'
          }`}
        >
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? isHome
                        ? 'bg-white/10 text-white'
                        : 'bg-gold-50 text-neutral-900'
                      : isHome
                        ? 'text-white/70'
                        : 'text-neutral-500'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li className="mt-2">
            <NavLink
              to="/area-socio"
              className="flex items-center justify-center gap-1.5 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-neutral-900"
            >
              <UserRound size={16} />
              Área de Socio
            </NavLink>
          </li>
        </ul>
      )}
    </header>
  )
}

export default Navbar
