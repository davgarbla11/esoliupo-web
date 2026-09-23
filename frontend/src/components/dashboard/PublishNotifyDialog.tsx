import { CircleAlert, Loader2, Mail, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../lib/api'

type PublishNotifyDialogProps = {
  title: string
  notifiedAt: string | null
  onClose: () => void
  onPublishOnly: () => Promise<void>
  onPublishAndNotify: () => Promise<void>
}

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function PublishNotifyDialog({
  title,
  notifiedAt,
  onClose,
  onPublishOnly,
  onPublishAndNotify,
}: PublishNotifyDialogProps) {
  const [count, setCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)
  const [action, setAction] = useState<'only' | 'notify' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<{ count: number }>('/users/notifiable-count')
        setCount(res.data.count)
      } catch {
        setCount(null)
      } finally {
        setLoadingCount(false)
      }
    })()
  }, [])

  async function handlePublishOnly() {
    setAction('only')
    setError('')
    try {
      await onPublishOnly()
      onClose()
    } catch {
      setError('No se ha podido publicar. Inténtalo de nuevo.')
    } finally {
      setAction(null)
    }
  }

  async function handlePublishAndNotify() {
    setAction('notify')
    setError('')
    try {
      await onPublishAndNotify()
      onClose()
    } catch {
      setError('No se ha podido enviar el correo. Inténtalo de nuevo.')
    } finally {
      setAction(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <p className="font-medium text-white">Publicar «{title}»</p>
        <p className="mt-2 text-sm text-white/60">
          Se publicará en la web. También puedes avisar por correo a los socios que
          tienen las notificaciones activadas
          {loadingCount ? '...' : count !== null ? ` (${count} destinatarios)` : ''}.
        </p>

        {notifiedAt && (
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-gold-400/10 px-3 py-2 text-xs text-gold-400">
            <Mail size={13} />
            Ya se notificó el {DATE_LABEL.format(new Date(notifiedAt))}. Si continúas, se
            enviará otro aviso.
          </p>
        )}

        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePublishAndNotify}
            disabled={action !== null}
            className="flex items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-60"
          >
            {action === 'notify' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Mail size={14} />
            )}
            Publicar y avisar por correo
          </button>
          <button
            type="button"
            onClick={handlePublishOnly}
            disabled={action !== null}
            className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5 disabled:opacity-60"
          >
            {action === 'only' && <Loader2 size={14} className="animate-spin" />}
            Publicar sin avisar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishNotifyDialog
