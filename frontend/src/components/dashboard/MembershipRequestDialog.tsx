import { isAxiosError } from 'axios'
import {
  Check,
  CircleAlert,
  Dices,
  GraduationCap,
  Loader2,
  Mail,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import api from '../../lib/api'

export type MembershipRequest = {
  id: string
  name: string
  email: string
  motivation: string
  isUpoStudent: boolean
  createdAt: string
}

type Step = 'details' | 'confirm-delete' | 'credentials' | 'approved'

type MembershipRequestDialogProps = {
  request: MembershipRequest
  onClose: () => void
  onApproved: (id: string) => void
  onDeleted: (id: string) => void
}

function generatePassword() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

function MembershipRequestDialog({
  request,
  onClose,
  onApproved,
  onDeleted,
}: MembershipRequestDialogProps) {
  const [step, setStep] = useState<Step>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(true)

  const [corporateEmail, setCorporateEmail] = useState('')
  const [password, setPassword] = useState(generatePassword())

  function getErrorMessage(err: unknown, fallback: string) {
    return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
  }

  async function handleApprove() {
    if (!corporateEmail.trim() || !password.trim()) {
      setError('Introduce la cuenta corporativa y la contraseña temporal.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ emailSent: boolean }>(
        `/membership-requests/${request.id}/approve`,
        { email: corporateEmail.trim(), password: password.trim() },
      )
      setEmailSent(res.data.emailSent)
      setStep('approved')
      onApproved(request.id)
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido aprobar la solicitud.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      await api.delete(`/membership-requests/${request.id}`)
      onDeleted(request.id)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido eliminar la solicitud.'))
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

        <p className="font-medium text-white">{request.name}</p>
        <p className="text-sm text-white/50">{request.email}</p>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            request.isUpoStudent
              ? 'bg-green-400/10 text-green-400'
              : 'bg-red-400/10 text-red-400'
          }`}
        >
          <GraduationCap size={12} />
          {request.isUpoStudent ? 'Estudia en la UPO' : 'No estudia en la UPO'}
        </span>

        {step === 'details' && (
          <>
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Por qué quiere unirse
              </p>
              <p className="mt-1 text-sm text-white/80">{request.motivation}</p>
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
                onClick={() => setStep('confirm-delete')}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
              <button
                type="button"
                onClick={() => setStep('credentials')}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
              >
                <Check size={14} />
                Aprobar solicitud
              </button>
            </div>
          </>
        )}

        {step === 'confirm-delete' && (
          <div className="mt-5">
            <p className="text-sm text-white/70">
              Se eliminará la solicitud de {request.name}. Esta acción no se puede deshacer.
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
                onClick={handleDelete}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Eliminar solicitud
              </button>
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <div className="mt-5">
            <p className="text-sm text-white/70">
              Crea la cuenta corporativa de {request.name} en Workspace y pega aquí sus
              accesos. Se enviarán por correo a <strong>{request.email}</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Cuenta corporativa
                </label>
                <input
                  type="email"
                  value={corporateEmail}
                  onChange={(event) => setCorporateEmail(event.target.value)}
                  placeholder="nombre.apellido@esoliupo.org"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">
                  Contraseña temporal
                </label>
                <div className="flex gap-2">
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-sm text-white focus:border-gold-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPassword(generatePassword())}
                    className="rounded-lg border border-white/10 px-3 text-white/60 hover:bg-white/5 hover:text-white"
                    aria-label="Generar otra contraseña"
                    title="Generar otra contraseña"
                  >
                    <Dices size={16} />
                  </button>
                </div>
              </div>
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
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Mail size={14} />
                )}
                Aprobar y enviar por correo
              </button>
            </div>
          </div>
        )}

        {step === 'approved' && (
          <div className="mt-5">
            {emailSent ? (
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Check size={14} className="text-green-400" />
                Cuenta creada y correo enviado a {request.email}.
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-red-300">
                <CircleAlert size={14} />
                Cuenta creada, pero no se ha podido enviar el correo. Comparte los accesos
                manualmente con {request.name}.
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:scale-[1.02]"
            >
              Hecho
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MembershipRequestDialog
