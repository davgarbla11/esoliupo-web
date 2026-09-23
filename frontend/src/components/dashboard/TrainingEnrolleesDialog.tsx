import { isAxiosError } from 'axios'
import { CircleAlert, Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../lib/api'
import type { EsoliupoTraining, TrainingEnrollee } from '../../types/training'

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function TrainingEnrolleesDialog({
  training,
  onClose,
}: {
  training: EsoliupoTraining
  onClose: () => void
}) {
  const [enrollees, setEnrollees] = useState<TrainingEnrollee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<{ enrollees: TrainingEnrollee[] }>(
          `/trainings/${training.id}`,
        )
        setEnrollees(res.data.enrollees)
      } catch (err) {
        setError(getErrorMessage(err, 'No se han podido cargar los inscritos.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [training.id])

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

        <h2 className="text-lg font-medium text-white">{training.title}</h2>
        <p className="text-sm text-white/50">
          {enrollees.length} inscrito{enrollees.length === 1 ? '' : 's'}
        </p>

        {loading && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="animate-spin text-gold-400" size={24} />
          </div>
        )}

        {!loading && error && (
          <p className="mt-4 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {enrollees.map((enrollee) => (
              <div
                key={enrollee.id}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2"
              >
                <p className="text-sm font-medium text-white">{enrollee.name}</p>
                <p className="text-xs text-white/50">{enrollee.email}</p>
              </div>
            ))}

            {enrollees.length === 0 && (
              <p className="py-6 text-center text-sm text-white/40">
                Todavía no hay nadie inscrito.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrainingEnrolleesDialog
