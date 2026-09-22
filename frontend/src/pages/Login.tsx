import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoIcon from '../assets/icon-mark.png'
import HeroBackground from '../components/HeroBackground'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!email || !password) {
      setError('Rellena tu correo y contraseña.')
      return
    }

    setError('')
    setLoading(true)

    setTimeout(() => {
      navigate('/dashboard')
    }, 700)
  }

  return (
    <div className="relative min-h-screen">
      <HeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
        >
          <div className="flex flex-col items-center text-center">
            <img src={logoIcon} alt="ESOLIUPO" className="h-12 w-auto" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Área de Socio
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Inicia sesión para acceder a tu panel de ESOLIUPO.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Correo
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 pr-11 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/60">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black/30 accent-gold-400"
                />
                Recuérdame
              </label>
              <a href="#" className="text-white/60 hover:text-gold-400">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            ¿Todavía no eres socio?{' '}
            <Link to="/contacto" className="text-gold-400 hover:text-gold-300">
              Contacta con nosotros
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
