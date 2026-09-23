import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CheckCircle2, CircleAlert, Loader2, Send } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import api from '../lib/api'

function JoinRequest() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isUpoStudent, setIsUpoStudent] = useState('')
  const [motivation, setMotivation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!name.trim() || !email.trim() || !motivation.trim() || !isUpoStudent) {
      setError('Rellena todos los campos.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.post('/membership-requests', {
        name: name.trim(),
        email: email.trim(),
        motivation: motivation.trim(),
        isUpoStudent: isUpoStudent === 'si',
      })
      setSubmitted(true)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido enviar la solicitud. Inténtalo de nuevo.')
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
        Únete a la asociación
      </h1>
      <p className="mt-4 text-white/60">
        Cuéntanos un poco sobre ti. La Junta Directiva revisará tu solicitud y se
        pondrá en contacto contigo.
      </p>

      {submitted ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <CheckCircle2 size={32} className="text-gold-400" />
          <p className="text-white">Tu solicitud ha sido enviada.</p>
          <p className="text-sm text-white/60">
            La Junta Directiva la revisará y te contactará por correo.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Nombre completo
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre y apellidos"
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
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              ¿Estudias en la Universidad Pablo de Olavide?
            </label>
            <select
              value={isUpoStudent}
              onChange={(event) => setIsUpoStudent(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white focus:border-gold-400 focus:outline-none"
            >
              <option value="" className="bg-black">
                Selecciona una opción
              </option>
              <option value="si" className="bg-black">
                Sí
              </option>
              <option value="no" className="bg-black">
                No
              </option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              ¿Por qué quieres unirte a ESOLIUPO?
            </label>
            <textarea
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              rows={4}
              placeholder="Cuéntanos brevemente tu motivación..."
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
            Enviar solicitud
          </button>
        </form>
      )}
    </motion.section>
  )
}

export default JoinRequest
