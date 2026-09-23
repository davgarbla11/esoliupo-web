import { isAxiosError } from 'axios'
import { CircleAlert, Loader2, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import type { EsoliupoTraining, UserDirectoryEntry } from '../../types/training'

const roleLabels: Record<string, string> = {
  SOCIO: 'Socio',
  COLABORADOR_EXTERNO: 'Colaborador externo',
  JUNTA_DIRECTIVA: 'Junta Directiva',
  ADMINISTRADOR: 'Administrador',
}

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function toInputDateTime(value: string) {
  const date = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

type TrainingFormDialogProps = {
  training: EsoliupoTraining | null
  onClose: () => void
  onSaved: (training: EsoliupoTraining) => void
}

function TrainingFormDialog({ training, onClose, onSaved }: TrainingFormDialogProps) {
  const isEditing = Boolean(training)

  const [title, setTitle] = useState(training?.title ?? '')
  const [description, setDescription] = useState(training?.description ?? '')
  const [place, setPlace] = useState(training?.place ?? '')
  const [date, setDate] = useState(training ? toInputDateTime(training.date) : '')
  const [instructorId, setInstructorId] = useState(training?.instructor.id ?? '')

  const [directory, setDirectory] = useState<UserDirectoryEntry[]>([])
  const [loadingDirectory, setLoadingDirectory] = useState(true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<{ users: UserDirectoryEntry[] }>('/users/directory')
        setDirectory(res.data.users)
      } catch {
        // ignore — the select just stays empty, save will fail with a clear error
      } finally {
        setLoadingDirectory(false)
      }
    })()
  }, [])

  async function handleSave() {
    if (!title.trim() || !description.trim() || !place.trim() || !date || !instructorId) {
      setError('Rellena nombre, descripción, lugar, fecha y quién la imparte.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const payload = {
        title,
        description,
        place,
        date: new Date(date).toISOString(),
        instructorId,
      }

      const res = isEditing
        ? await api.patch<{ training: EsoliupoTraining }>(`/trainings/${training!.id}`, payload)
        : await api.post<{ training: EsoliupoTraining }>('/trainings', payload)

      onSaved(res.data.training)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido guardar la formación.'))
    } finally {
      setSaving(false)
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

        <h2 className="text-lg font-medium text-white">
          {isEditing ? 'Editar formación' : 'Nueva formación'}
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">Nombre</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Taller de Git y GitHub"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="De qué va la formación..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-white/80">
              Quién la imparte
            </label>
            <select
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
              disabled={loadingDirectory}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-gold-400 focus:outline-none"
            >
              <option value="" className="bg-black">
                {loadingDirectory ? 'Cargando...' : 'Selecciona una persona'}
              </option>
              {directory.map((entry) => (
                <option key={entry.id} value={entry.id} className="bg-black">
                  {entry.name} · {roleLabels[entry.role]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">Lugar</label>
              <input
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Ej. Aula 1.03"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white/80">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-gold-400 focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <CircleAlert size={14} />
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TrainingFormDialog
