import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, CircleAlert, Loader2, Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import logoIcon from '../assets/icon-mark.png'
import HeroBackground from '../components/HeroBackground'
import api from '../lib/api'

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!email.trim()) {
      setError('Introduce tu correo.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSubmitted(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido procesar la solicitud.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <HeroBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <Link
          to="/login"
          className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al inicio de sesión
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
              Recuperar contraseña
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Te enviaremos un enlace para restablecerla.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={32} className="text-gold-400" />
              <p className="text-white">Revisa tu correo.</p>
              <p className="text-sm text-white/60">
                Si ese correo existe en nuestro sistema, recibirás un enlace para
                restablecer tu contraseña. Es válido durante 1 hora.
              </p>
            </div>
          ) : (
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
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Enviar enlace
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ForgotPassword
