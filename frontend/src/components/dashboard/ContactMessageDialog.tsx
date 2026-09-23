import { isAxiosError } from 'axios'
import { Check, CircleAlert, Loader2, Send, X } from 'lucide-react'
import { useState } from 'react'
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

function ContactMessageDialog({
  message,
  onClose,
  onReplied,
}: {
  message: ContactMessage
  onClose: () => void
  onReplied: (message: ContactMessage) => void
}) {
  const [reply, setReply] = useState(message.reply ?? '')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSend() {
    if (!reply.trim()) {
      setError('Escribe una respuesta antes de enviarla.')
      return
    }

    setSending(true)
    setError('')
    try {
      const res = await api.post<{ message: ContactMessage }>(
        `/contact/${message.id}/reply`,
        { reply: reply.trim() },
      )
      onReplied(res.data.message)
      setSent(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido enviar la respuesta.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <p className="font-medium text-white">{message.name}</p>
        <p className="text-sm text-white/50">{message.email}</p>
        <p className="mt-1 text-xs text-white/40">{DATE_LABEL.format(new Date(message.createdAt))}</p>

        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs uppercase tracking-wide text-white/40">Mensaje</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{message.message}</p>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-white/80">
            {message.status === 'ANSWERED' ? 'Respuesta enviada' : 'Tu respuesta'}
          </label>
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={5}
            placeholder="Escribe la respuesta que se enviará por correo..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
          {message.status === 'ANSWERED' && (
            <p className="mt-1.5 text-xs text-white/40">
              Respondido por {message.repliedBy} el{' '}
              {message.repliedAt && DATE_LABEL.format(new Date(message.repliedAt))}. Si
              cambias el texto y envías de nuevo, se mandará otro correo.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </p>
        )}

        {sent ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-green-400">
            <Check size={14} />
            Respuesta enviada por correo a {message.email}.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-60"
          >
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Enviar respuesta por correo
          </button>
        )}
      </div>
    </div>
  )
}

export default ContactMessageDialog
