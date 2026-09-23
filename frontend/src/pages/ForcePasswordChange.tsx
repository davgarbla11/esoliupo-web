import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CircleAlert, Eye, EyeOff, KeyRound, Loader2, LogOut } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import logoIcon from '../assets/icon-mark.png'
import HeroBackground from '../components/HeroBackground'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function ForcePasswordChange() {
  const { refreshUser, logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!currentPassword || !newPassword) {
      setError('Rellena tu contraseña actual y la nueva.')
      return
    }
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las dos contraseñas nuevas no coinciden.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      await refreshUser()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido cambiar la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <HeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <button
          type="button"
          onClick={() => logout()}
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
        >
          <div className="flex flex-col items-center text-center">
            <img src={logoIcon} alt="ESOLIUPO" className="h-12 w-auto" />
            <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-gold-400/10 text-gold-400">
              <KeyRound size={20} />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Cambia tu contraseña
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Por seguridad, define tu propia contraseña antes de continuar. No podrás
              usar el panel hasta que la cambies.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Contraseña actual (la temporal)
              </label>
              <input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Al menos 8 caracteres"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-white/80"
              >
                Repite la nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showPasswords ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 pr-11 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white/50 hover:text-white"
                  aria-label={showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                >
                  {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Guardar y continuar
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default ForcePasswordChange
