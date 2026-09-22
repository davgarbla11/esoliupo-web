import { Mail } from 'lucide-react'
import { useLocation } from 'react-router-dom'

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <footer
      className={`relative border-t ${
        isHome
          ? 'border-white/10 bg-transparent text-white/50'
          : 'border-neutral-200 bg-neutral-50 text-neutral-500'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm sm:flex-row">
        <p>
          © {new Date().getFullYear()} ESOLIUPO · Universidad Pablo de
          Olavide
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:esoliupo@upo.es"
            aria-label="Correo"
            className={isHome ? 'hover:text-gold-400' : 'hover:text-gold-600'}
          >
            <Mail size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className={isHome ? 'hover:text-gold-400' : 'hover:text-gold-600'}
          >
            <InstagramIcon size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
