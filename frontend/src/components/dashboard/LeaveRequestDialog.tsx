import { isAxiosError } from 'axios'
import { Check, CircleAlert, Loader2, UserX, X } from 'lucide-react'
import { useState } from 'react'
import api from '../../lib/api'

export type LeaveRequest = {
  id: string
  userId: string
  userName: string
  userEmail: string
  reason: string | null
  createdAt: string
}

type Step = 'details' | 'confirm-approve' | 'confirm-reject'

type LeaveRequestDialogProps = {
  request: LeaveRequest
  onClose: () => void
  onApproved: (id: string) => void
  onRejected: (id: string) => void
}

function LeaveRequestDialog({
  request,
  onClose,
  onApproved,
  onRejected,
}: LeaveRequestDialogProps) {
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function getErrorMessage(err: unknown, fallback: string) {
    return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
  }

  async function handleApprove() {
    setLoading(true)
    setError('')
    try {
      await api.post(`/leave-requests/${request.id}/approve`)
      onApproved(request.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido aprobar la baja.'))
      setLoading(false)
    }
  }

  async function handleReject() {
    setLoading(true)
    setError('')
    try {
      await api.delete(`/leave-requests/${request.id}`)
      onRejected(request.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido rechazar la solicitud.'))
      setLoading(false)
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

        <p className="font-medium text-white">{request.userName}</p>
        <p className="text-sm text-white/50">{request.userEmail}</p>

        {step === 'details' && (
          <>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/40">Motivo</p>
              <p className="mt-1 text-sm text-white/80">
                {request.reason || 'No se ha indicado un motivo.'}
              </p>
            </div>

            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('confirm-reject')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => setStep('confirm-approve')}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                <UserX size={14} />
                Aprobar baja
              </button>
            </div>
          </>
        )}

        {step === 'confirm-approve' && (
          <div className="mt-5">
            <p className="text-sm text-white/70">
              {request.userName} dejará de ser socio de ESOLIUPO y perderá el acceso al
              panel.
            </p>
            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Confirmar baja
              </button>
            </div>
          </div>
        )}

        {step === 'confirm-reject' && (
          <div className="mt-5">
            <p className="text-sm text-white/70">
              Se eliminará la solicitud de baja de {request.userName}. {request.userName}{' '}
              seguirá siendo socio.
            </p>
            {error && (
              <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
                <CircleAlert size={14} />
                {error}
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Rechazar solicitud
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveRequestDialog
