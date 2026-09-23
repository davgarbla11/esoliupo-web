import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import {
  Check,
  CircleAlert,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import TrainingEnrolleesDialog from '../../components/dashboard/TrainingEnrolleesDialog'
import TrainingFormDialog from '../../components/dashboard/TrainingFormDialog'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import { isAtLeast } from '../../lib/rbac'
import type { EsoliupoTraining } from '../../types/training'

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

function ManagementView() {
  const [trainings, setTrainings] = useState<EsoliupoTraining[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<EsoliupoTraining | null | undefined>(undefined)
  const [viewingEnrollees, setViewingEnrollees] = useState<EsoliupoTraining | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  useEffect(() => {
    loadTrainings()
  }, [])

  async function loadTrainings() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ trainings: EsoliupoTraining[] }>('/trainings')
      setTrainings(res.data.trainings)
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se han podido cargar las formaciones.'))
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(training: EsoliupoTraining) {
    setTrainings((prev) => {
      const exists = prev.some((t) => t.id === training.id)
      return exists
        ? prev.map((t) => (t.id === training.id ? training : t))
        : [training, ...prev]
    })
  }

  async function handleTogglePublished(training: EsoliupoTraining) {
    setTogglingId(training.id)
    try {
      const res = await api.patch<{ training: EsoliupoTraining }>(
        `/trainings/${training.id}`,
        { published: !training.published },
      )
      setTrainings((prev) => prev.map((t) => (t.id === training.id ? res.data.training : t)))
    } catch {
      // ignore — row keeps its state, user can retry
    } finally {
      setTogglingId(null)
    }
  }

  async function handleToggleEnrollment(training: EsoliupoTraining) {
    setEnrollingId(training.id)
    try {
      if (training.enrolled) {
        await api.delete(`/trainings/${training.id}/enroll`)
      } else {
        await api.post(`/trainings/${training.id}/enroll`)
      }
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === training.id
            ? {
                ...t,
                enrolled: !t.enrolled,
                enrolledCount: t.enrolledCount + (t.enrolled ? -1 : 1),
              }
            : t,
        ),
      )
    } catch {
      // ignore — row keeps its state, user can retry
    } finally {
      setEnrollingId(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await api.delete(`/trainings/${id}`)
      setTrainings((prev) => prev.filter((t) => t.id !== id))
      setConfirmDeleteId(null)
    } catch {
      setConfirmDeleteId(null)
    } finally {
      setDeleting(false)
    }
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Formaciones
          </h1>
          <p className="mt-2 text-white/60">
            Crea formaciones y consulta quién se ha inscrito.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105"
        >
          <Plus size={16} />
          Nueva formación
        </button>
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
            onClick={loadTrainings}
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
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Formación</th>
                <th className="px-5 py-3 font-medium">Imparte</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Inscritos</th>
                <th className="px-5 py-3 font-medium">Tu inscripción</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trainings.map((training) => (
                <tr key={training.id} className="bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{training.title}</td>
                  <td className="px-5 py-4 text-white/60">{training.instructor.name}</td>
                  <td className="px-5 py-4 text-white/60">
                    {DATE_LABEL.format(new Date(training.date))}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        training.published
                          ? 'bg-green-400/10 text-green-400'
                          : 'bg-white/10 text-white/50'
                      }`}
                    >
                      {training.published ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setViewingEnrollees(training)}
                      className="inline-flex items-center gap-1.5 text-white/60 hover:text-white"
                    >
                      <Users size={14} />
                      {training.enrolledCount}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    {training.published ? (
                      <button
                        type="button"
                        onClick={() => handleToggleEnrollment(training)}
                        disabled={enrollingId === training.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60 ${
                          training.enrolled
                            ? 'border border-white/20 text-white/70 hover:bg-white/5'
                            : 'bg-gold-400 text-neutral-900 hover:scale-105'
                        }`}
                      >
                        {enrollingId === training.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : training.enrolled ? (
                          <UserCheck size={12} />
                        ) : (
                          <UserPlus size={12} />
                        )}
                        {training.enrolled ? 'Inscrito' : 'Inscribirme'}
                      </button>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {confirmDeleteId === training.id ? (
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
                          onClick={() => handleDelete(training.id)}
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
                          onClick={() => handleTogglePublished(training)}
                          disabled={togglingId === training.id}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={training.published ? 'Ocultar' : 'Publicar'}
                          title={training.published ? 'Ocultar' : 'Publicar'}
                        >
                          {togglingId === training.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : training.published ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(training)}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                          aria-label={`Editar ${training.title}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(training.id)}
                          className="rounded-lg p-1.5 text-white/50 hover:bg-red-400/10 hover:text-red-300"
                          aria-label={`Eliminar ${training.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {trainings.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-white/40">
                    No hay formaciones todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {editing !== undefined && (
        <TrainingFormDialog
          training={editing}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      {viewingEnrollees && (
        <TrainingEnrolleesDialog
          training={viewingEnrollees}
          onClose={() => setViewingEnrollees(null)}
        />
      )}
    </div>
  )
}

function EnrollmentView() {
  const [trainings, setTrainings] = useState<EsoliupoTraining[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  useEffect(() => {
    loadTrainings()
  }, [])

  async function loadTrainings() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ trainings: EsoliupoTraining[] }>('/trainings/public')
      setTrainings(res.data.trainings)
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se han podido cargar las formaciones.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleEnroll(training: EsoliupoTraining) {
    setPendingId(training.id)
    try {
      await api.post(`/trainings/${training.id}/enroll`)
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === training.id
            ? { ...t, enrolled: true, enrolledCount: t.enrolledCount + 1 }
            : t,
        ),
      )
    } catch {
      // ignore — button stays in its previous state, user can retry
    } finally {
      setPendingId(null)
    }
  }

  async function handleUnenroll(training: EsoliupoTraining) {
    setPendingId(training.id)
    try {
      await api.delete(`/trainings/${training.id}/enroll`)
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === training.id
            ? { ...t, enrolled: false, enrolledCount: Math.max(0, t.enrolledCount - 1) }
            : t,
        ),
      )
    } catch {
      // ignore
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Formaciones</h1>
        <p className="mt-2 text-white/60">
          Inscríbete en las formaciones que organiza la asociación.
        </p>
      </motion.div>

      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      )}

      {!loading && loadError && <p className="mt-8 text-white/50">{loadError}</p>}

      {!loading && !loadError && (
        <div className="mt-8 space-y-4">
          {trainings.map((training, index) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{training.title}</p>
                  <p className="mt-1 text-sm text-white/60">{training.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    training.enrolled ? handleUnenroll(training) : handleEnroll(training)
                  }
                  disabled={pendingId === training.id}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 ${
                    training.enrolled
                      ? 'border border-white/20 text-white/70 hover:bg-white/5'
                      : 'bg-gold-400 text-neutral-900 hover:scale-105'
                  }`}
                >
                  {pendingId === training.id && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {training.enrolled ? 'Cancelar inscripción' : 'Inscribirme'}
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {DATE_LABEL.format(new Date(training.date))}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {training.place}
                </span>
                <span>Imparte {training.instructor.name}</span>
              </div>
            </motion.div>
          ))}

          {trainings.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
              No hay formaciones publicadas todavía.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function FormacionesManagement() {
  const { user } = useAuth()
  const canManage = isAtLeast(user?.role, 'JUNTA_DIRECTIVA')

  return canManage ? <ManagementView /> : <EnrollmentView />
}

export default FormacionesManagement
