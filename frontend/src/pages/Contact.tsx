import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, CircleAlert, Loader2, Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'

function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Rellena todos los campos.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/contact', { name: name.trim(), email: email.trim(), message: message.trim() })
      setSubmitted(true)
    } catch (err) {
      const errorMessage = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(errorMessage ?? 'No se ha podido enviar el mensaje. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl px-6 py-32"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
        ESOLIUPO
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Contacto
      </h1>
      <p className="mt-4 max-w-2xl text-white/60">
        ¿Tienes alguna pregunta? Escríbenos y la Junta Directiva te responderá por
        correo.
      </p>

      {submitted ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CheckCircle2 size={32} className="text-gold-400" />
          <p className="text-white">Tu mensaje ha sido enviado.</p>
          <p className="text-sm text-white/60">
            La Junta Directiva lo revisará y te responderá por correo.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Nombre</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Correo</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Mensaje</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Cuéntanos en qué podemos ayudarte..."
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Enviar mensaje
          </button>
        </form>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-lg font-medium text-white">¿Quieres ser socio?</h2>
        <p className="mt-2 max-w-xl text-white/60">
          Si eres estudiante de la Universidad Pablo de Olavide y quieres unirte a
          ESOLIUPO, rellena el formulario de solicitud y la Junta Directiva se pondrá
          en contacto contigo.
        </p>
        <Link
          to="/unete"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
        >
          Solicitar ingreso
          <ArrowRight size={16} />
        </Link>
      </div>
    </motion.section>
  )
}

export default Contact
