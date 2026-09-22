import { Instagram, Mail } from 'lucide-react'

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} ESOLIUPO · Universidad Pablo de
          Olavide
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:esoliupo@upo.es"
            aria-label="Correo"
            className="hover:text-slate-900"
          >
            <Mail size={18} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-slate-900"
          >
            <Instagram size={18} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
