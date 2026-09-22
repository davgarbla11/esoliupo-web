import { motion } from 'framer-motion'
import { Calendar, LogOut, User, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import logoIcon from '../assets/icon-mark.png'
import { type Role, useAuth } from '../context/AuthContext'

const widgets = [
  {
    icon: User,
    title: 'Mi perfil',
    description: 'Tus datos de socio y estado de la cuota.',
  },
  {
    icon: Calendar,
    title: 'Mis eventos',
    description: 'Actividades a las que te has inscrito.',
  },
  {
    icon: Wrench,
    title: 'Recursos',
    description: 'Material y recursos exclusivos para socios.',
  },
]

const roleLabels: Record<Role, string> = {
  SOCIO: 'Socio',
  JUNTA_DIRECTIVA: 'Junta Directiva',
  ADMINISTRADOR: 'Administrador',
}

function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={logoIcon} alt="ESOLIUPO" className="h-8 w-auto" />
          <span className="text-lg font-semibold tracking-tight">ESOLIUPO</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
            Panel de socio · {user ? roleLabels[user.role] : ''}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Bienvenido/a, {user?.name}
          </h1>
          <p className="mt-3 max-w-xl text-white/60">
            Este es un panel de ejemplo. Cuando construyamos cada sección,
            aquí verás tu información real como socio.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-gold-400">
                <Icon size={20} />
              </div>
              <h2 className="mt-4 text-lg font-medium text-white">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                {description}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-white/30">
                Próximamente
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
