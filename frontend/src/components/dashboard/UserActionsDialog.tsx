import { isAxiosError } from 'axios'
import {
  Camera,
  Check,
  CircleAlert,
  Copy,
  KeyRound,
  Loader2,
  ShieldOff,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import { useState } from 'react'
import api from '../../lib/api'
import AvatarEditorDialog from './AvatarEditorDialog'

export type DialogUser = {
  id: string
  name: string
  email: string
  active: boolean
  photoUrl?: string | null
}

type Step = 'menu' | 'confirm-status' | 'password-result'

type UserActionsDialogProps = {
  user: DialogUser
  onClose: () => void
  onStatusChange: (id: string, active: boolean) => void
  onAvatarChange: (id: string, photoUrl: string | null) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function UserActionsDialog({
  user,
  onClose,
  onStatusChange,
  onAvatarChange,
}: UserActionsDialogProps) {
  const [step, setStep] = useState<Step>('menu')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [emailSent, setEmailSent] = useState(true)
  const [copied, setCopied] = useState(false)
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl ?? null)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)

  function getErrorMessage(err: unknown, fallback: string) {
    return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
  }

  async function handleResetPassword() {
    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ temporaryPassword: string; emailSent: boolean }>(
        `/users/${user.id}/reset-password`,
      )
      setTemporaryPassword(res.data.temporaryPassword)
      setEmailSent(res.data.emailSent)
      setStep('password-result')
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido restablecer la contraseña.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmStatusChange() {
    setLoading(true)
    setError('')
    try {
      await api.patch(`/users/${user.id}/status`, { active: !user.active })
      onStatusChange(user.id, !user.active)
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido actualizar el estado.'))
      setLoading(false)
    }
  }

  function handleAvatarUpdated(newPhotoUrl: string | null) {
    setPhotoUrl(newPhotoUrl)
    onAvatarChange(user.id, newPhotoUrl)
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAvatarDialogOpen(true)}
            className="group relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-400 text-lg font-semibold text-neutral-900"
            aria-label="Cambiar foto"
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={user.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              getInitials(user.name)
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={18} className="text-white" />
            </span>
          </button>
          <div>
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-sm text-white/50">{user.email}</p>
          </div>
        </div>

        {step === 'menu' && (
          <div className="mt-5 space-y-1.5">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <KeyRound size={16} />
              )}
              Restablecer contraseña
            </button>

            <button
              type="button"
              onClick={() => setStep('confirm-status')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-400/10"
            >
              {user.active ? <UserX size={16} /> : <UserCheck size={16} />}
              {user.active ? 'Dar de baja' : 'Reactivar usuario'}
            </button>

            <div
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/30"
              title="Disponible cuando se implemente la autenticación en dos factores"
            >
              <ShieldOff size={16} />
              Restablecer 2FA
              <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-xs">
                Próximamente
              </span>
            </div>
          </div>
        )}

        {step === 'confirm-status' && (
          <div className="mt-5">
            <p className="text-sm text-white/70">
              {user.active
                ? `${user.name} no podrá iniciar sesión hasta que se le vuelva a dar de alta.`
                : `${user.name} podrá volver a iniciar sesión.`}
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
                onClick={() => setStep('menu')}
                disabled={loading}
                className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {user.active ? 'Dar de baja' : 'Reactivar'}
              </button>
            </div>
          </div>
        )}

        {step === 'password-result' && (
          <div className="mt-5">
            {emailSent ? (
              <p className="flex items-center gap-2 text-sm text-white/70">
                <Check size={14} className="text-green-400" />
                Se ha enviado la nueva contraseña por correo a {user.email}.
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-red-300">
                <CircleAlert size={14} />
                No se ha podido enviar el correo. Comparte esta contraseña con{' '}
                {user.name} de forma segura — no volverá a mostrarse.
              </p>
            )}
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <code className="text-sm text-gold-400">{temporaryPassword}</code>
              <button
                type="button"
                onClick={copyPassword}
                className="text-white/50 hover:text-white"
                aria-label="Copiar contraseña"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 hover:scale-[1.02]"
            >
              Hecho
            </button>
          </div>
        )}

        {step === 'menu' && error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </p>
        )}
      </div>
    </div>
    {avatarDialogOpen && (
      <AvatarEditorDialog
        userId={user.id}
        userName={user.name}
        photoUrl={photoUrl}
        onClose={() => setAvatarDialogOpen(false)}
        onUpdated={handleAvatarUpdated}
      />
    )}
    </>
  )
}

export default UserActionsDialog
