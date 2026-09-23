import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import {
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublishNotifyDialog from '../../components/dashboard/PublishNotifyDialog'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { isAtLeast } from '../../lib/rbac'
import type { EsoliupoEvent } from '../../types/event'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

function EventsManagement() {
  const { user } = useAuth()
  const canManage = isAtLeast(user?.role, 'JUNTA_DIRECTIVA')

  const [events, setEvents] = useState<EsoliupoEvent[]>([])
  const [loading, setLoading] = useState(canManage)
  const [loadError, setLoadError] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [publishTarget, setPublishTarget] = useState<EsoliupoEvent | null>(null)

  useEffect(() => {
    if (!canManage) return
    loadEvents()
  }, [canManage])

  async function loadEvents() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ events: EsoliupoEvent[] }>('/events')
      setEvents(res.data.events)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setLoadError(message ?? 'No se han podido cargar los eventos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePublished(event: EsoliupoEvent) {
    if (!event.published) {
      setPublishTarget(event)
      return
    }

    setTogglingId(event.id)
    try {
      const res = await api.patch<{ event: EsoliupoEvent }>(`/events/${event.id}`, {
        published: false,
      })
      setEvents((prev) => prev.map((e) => (e.id === event.id ? res.data.event : e)))
    } catch {
      // ignore — row state stays as-is, user can retry
    } finally {
      setTogglingId(null)
    }
  }

  async function handlePublish(event: EsoliupoEvent) {
    const res = await api.patch<{ event: EsoliupoEvent }>(`/events/${event.id}`, {
      published: true,
    })
    setEvents((prev) => prev.map((e) => (e.id === event.id ? res.data.event : e)))
  }

  async function handlePublishAndNotify(event: EsoliupoEvent) {
    await handlePublish(event)
    await api.post(`/events/${event.id}/notify`)
    setEvents((prev) =>
      prev.map((e) => (e.id === event.id ? { ...e, notifiedAt: new Date().toISOString() } : e)),
    )
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await api.delete(`/events/${id}`)
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setConfirmDeleteId(null)
    } catch {
      setConfirmDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Eventos</h1>
        <p className="mt-4 max-w-xl text-white/60">
          Consulta los eventos publicados de la asociación en la página de{' '}
          <Link to="/actividades" className="text-gold-400 hover:underline">
            Actividades
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
            ESOLIUPO
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Eventos</h1>
          <p className="mt-2 text-white/60">
            Crea y gestiona los eventos que se publican en Actividades.
          </p>
        </div>
        <Link
          to="/dashboard/eventos/nuevo"
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
        >
          <Plus size={16} />
          Nuevo evento
        </Link>
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
            onClick={loadEvents}
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
          className="mt-8 overflow-x-auto rounded-2xl border border-white/10"
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Evento</th>
                <th className="px-5 py-3 font-medium">Lugar</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {events.map((event) => (
                <tr key={event.id} className="bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{event.title}</td>
                  <td className="px-5 py-4 text-white/60">{event.place}</td>
                  <td className="px-5 py-4 text-white/60">
                    {DATE_LABEL.format(new Date(event.date))}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.published
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {event.published ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {confirmDeleteId === event.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-xs text-white/50">¿Eliminar?</span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label="Cancelar"
                        >
                          <X size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(event.id)}
                          disabled={deleting}
                          className="rounded-lg p-1.5 text-red-300 hover:bg-red-400/10"
                          aria-label="Confirmar eliminar"
                        >
                          {deleting ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(event)}
                          disabled={togglingId === event.id}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={
                            event.published ? 'Ocultar de Actividades' : 'Publicar en Actividades'
                          }
                          title={
                            event.published ? 'Ocultar de Actividades' : 'Publicar en Actividades'
                          }
                        >
                          {togglingId === event.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : event.published ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <Link
                          to={`/dashboard/eventos/${event.id}`}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={`Editar ${event.title}`}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(event.id)}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-red-400/10 hover:text-red-300"
                          aria-label={`Eliminar ${event.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-white/40">
                    No hay eventos todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {publishTarget && (
        <PublishNotifyDialog
          title={publishTarget.title}
          notifiedAt={publishTarget.notifiedAt}
          onClose={() => setPublishTarget(null)}
          onPublishOnly={() => handlePublish(publishTarget)}
          onPublishAndNotify={() => handlePublishAndNotify(publishTarget)}
        />
      )}
    </div>
  )
}

export default EventsManagement
