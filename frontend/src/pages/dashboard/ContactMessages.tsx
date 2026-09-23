import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CircleAlert, Loader2, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import ContactMessageDialog from '../../components/dashboard/ContactMessageDialog'
import api from '../../lib/api'
import type { ContactMessage } from '../../types/contact'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  async function loadMessages() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ messages: ContactMessage[] }>('/contact')
      setMessages(res.data.messages)
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se han podido cargar los mensajes.'))
    } finally {
      setLoading(false)
    }
  }

  function handleReplied(updated: ContactMessage) {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
  }

  const pendingCount = messages.filter((m) => m.status === 'PENDING').length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Mensajes</h1>
        <p className="mt-2 text-white/60">
          Consultas recibidas desde el formulario de contacto.
          {pendingCount > 0 && ` ${pendingCount} sin responder.`}
        </p>
      </motion.div>

      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      )}

      {!loading && loadError && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
          <CircleAlert size={18} />
          {loadError}
          <button
            type="button"
            onClick={loadMessages}
            className="ml-auto rounded-full border border-red-400/30 px-3 py-1 text-xs hover:bg-red-400/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 space-y-3"
        >
          {messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => setSelected(message)}
              className="flex w-full items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/[0.07]"
            >
              <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
                <MessageSquare size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{message.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      message.status === 'ANSWERED'
                        ? 'bg-green-400/10 text-green-400'
                        : 'bg-gold-400/10 text-gold-400'
                    }`}
                  >
                    {message.status === 'ANSWERED' ? 'Respondido' : 'Pendiente'}
                  </span>
                  <span className="text-xs text-white/40">
                    {DATE_LABEL.format(new Date(message.createdAt))}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">{message.email}</p>
                <p className="mt-1.5 truncate text-sm text-white/60">{message.message}</p>
              </div>
            </button>
          ))}

          {messages.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
              No hay mensajes todavía.
            </p>
          )}
        </motion.div>
      )}

      {selected && (
        <ContactMessageDialog
          message={selected}
          onClose={() => setSelected(null)}
          onReplied={handleReplied}
        />
      )}
    </div>
  )
}

export default ContactMessages
