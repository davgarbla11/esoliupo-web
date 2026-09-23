import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import {
  Bell,
  Camera,
  Check,
  CircleAlert,
  Clock,
  GraduationCap,
  Loader2,
  MessageCircle,
  Save,
  UserX,
} from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import { type Role, useAuth } from '../../context/AuthContext'
import api from '../../lib/api'

const roleLabels: Record<Role, string> = {
  SOCIO: 'Socio',
  COLABORADOR_EXTERNO: 'Colaborador externo',
  JUNTA_DIRECTIVA: 'Junta Directiva',
  ADMINISTRADOR: 'Administrador',
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

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

function MyProfile() {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')

  const [studies, setStudies] = useState(user?.studies ?? '')
  const [studiesSaving, setStudiesSaving] = useState(false)
  const [studiesError, setStudiesError] = useState('')
  const [studiesSaved, setStudiesSaved] = useState(false)

  const [notifySaving, setNotifySaving] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  const [confirmingLeave, setConfirmingLeave] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [leaveError, setLeaveError] = useState('')
  const [leaveRequested, setLeaveRequested] = useState(false)

  if (!user) return null

  const userId = user.id

  async function handleAvatarSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setAvatarUploading(true)
    setAvatarError('')
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await api.post(`/users/${userId}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refreshUser()
    } catch (err) {
      setAvatarError(getErrorMessage(err, 'No se ha podido subir la foto.'))
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSaveStudies() {
    setStudiesSaving(true)
    setStudiesError('')
    try {
      await api.patch(`/users/${userId}/profile`, { studies })
      await refreshUser()
      setStudiesSaved(true)
      setTimeout(() => setStudiesSaved(false), 2000)
    } catch (err) {
      setStudiesError(getErrorMessage(err, 'No se ha podido guardar.'))
    } finally {
      setStudiesSaving(false)
    }
  }

  async function handleToggleNotifyEvents() {
    setNotifySaving(true)
    setNotifyError('')
    try {
      await api.patch(`/users/${userId}/profile`, { notifyEvents: !user.notifyEvents })
      await refreshUser()
    } catch (err) {
      setNotifyError(getErrorMessage(err, 'No se ha podido guardar la preferencia.'))
    } finally {
      setNotifySaving(false)
    }
  }

  async function handleLeaveAssociation() {
    setLeaving(true)
    setLeaveError('')
    try {
      await api.post('/leave-requests')
      setLeaveRequested(true)
      setConfirmingLeave(false)
    } catch (err) {
      setLeaveError(getErrorMessage(err, 'No se ha podido enviar la solicitud de baja.'))
    } finally {
      setLeaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Mi perfil</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="mt-8 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="group relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gold-400 text-2xl font-semibold text-neutral-900"
          aria-label="Cambiar foto de perfil"
        >
          {user.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            getInitials(user.name)
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
            {avatarUploading ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarSelected}
          className="hidden"
        />
        <div>
          <p className="text-lg font-medium text-white">{user.name}</p>
          <p className="text-sm text-white/50">{user.email}</p>
          <span className="mt-1 inline-flex items-center rounded-full bg-gold-400/15 px-2.5 py-0.5 text-xs font-medium text-gold-400">
            {roleLabels[user.role]}
          </span>
        </div>
      </motion.div>
      {avatarError && (
        <p className="mt-2 flex items-center gap-2 text-sm text-red-400">
          <CircleAlert size={14} />
          {avatarError}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-white/80">
          <GraduationCap size={16} />
          Estudios / profesión
        </label>
        <p className="mb-3 text-sm text-white/50">
          Esto es lo que aparecerá en la web pública si formas parte de la Junta Directiva.
        </p>
        <div className="flex gap-2">
          <input
            value={studies}
            onChange={(event) => setStudies(event.target.value)}
            placeholder="Ej. Grado en Ingeniería Informática, UPO"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSaveStudies}
            disabled={studiesSaving}
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
          >
            {studiesSaving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Guardar
          </button>
        </div>
        {studiesSaved && (
          <p className="mt-2 flex items-center gap-1 text-sm text-green-400">
            <Check size={14} />
            Guardado.
          </p>
        )}
        {studiesError && (
          <p className="mt-2 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {studiesError}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6"
      >
        <h2 className="text-sm font-medium text-white/80">Preferencias</h2>

        <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Bell size={16} className="text-white/60" />
          <span className="flex-1 text-sm text-white/80">
            Recibir un correo cuando se publiquen eventos y formaciones
          </span>
          <button
            type="button"
            onClick={handleToggleNotifyEvents}
            disabled={notifySaving}
            role="switch"
            aria-checked={user.notifyEvents}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
              user.notifyEvents ? 'bg-gold-400' : 'bg-white/10'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                user.notifyEvents ? 'translate-x-[22px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        {notifyError && (
          <p className="mt-1 flex items-center gap-2 px-3 text-sm text-red-400">
            <CircleAlert size={14} />
            {notifyError}
          </p>
        )}

        <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-white/40">
          <MessageCircle size={16} />
          <span className="flex-1 text-sm">Unirse al grupo de WhatsApp de socios</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Próximamente</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-6"
      >
        <h2 className="text-sm font-medium text-red-300">Darse de baja</h2>
        <p className="mt-1 text-sm text-white/50">
          Se enviará una solicitud a la Junta Directiva, que revisará tu baja como
          socio de ESOLIUPO.
        </p>

        {leaveError && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {leaveError}
          </p>
        )}

        {leaveRequested ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-white/60">
            <Clock size={14} />
            Solicitud enviada. La Junta Directiva la revisará próximamente.
          </p>
        ) : !confirmingLeave ? (
          <button
            type="button"
            onClick={() => setConfirmingLeave(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-400/10"
          >
            <UserX size={16} />
            Solicitar baja de la asociación
          </button>
        ) : (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingLeave(false)}
              disabled={leaving}
              className="flex-1 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleLeaveAssociation}
              disabled={leaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            >
              {leaving && <Loader2 size={14} className="animate-spin" />}
              Confirmar solicitud
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MyProfile
