import { isAxiosError } from 'axios'
import { Briefcase, CircleAlert, GraduationCap, Image, Loader2, Save, X } from 'lucide-react'
import { useState } from 'react'
import { type Role } from '../../context/AuthContext'
import api from '../../lib/api'

export type BoardUser = {
  id: string
  name: string
  email: string
  role: Role
  position: string | null
  studies: string | null
  photoUrl: string | null
}

const positionSuggestions = [
  'Presidencia',
  'Vicepresidencia',
  'Secretaría',
  'Tesorería',
  'Vocalía de Comunicación',
  'Vocalía de Eventos',
]

function BoardMemberRow({
  member,
  onSaved,
}: {
  member: BoardUser
  onSaved: (user: BoardUser) => void
}) {
  const [position, setPosition] = useState(member.position ?? '')
  const [studies, setStudies] = useState(member.studies ?? '')
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const res = await api.patch<{ user: BoardUser }>(`/users/${member.id}/profile`, {
        position,
        studies,
        photoUrl,
      })
      onSaved(res.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <p className="font-medium text-white">{member.name}</p>
      <p className="text-sm text-white/50">{member.email}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="relative">
          <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            list="position-suggestions"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            placeholder="Cargo (ej. Presidencia)"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
        </div>
        <div className="relative">
          <GraduationCap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={studies}
            onChange={(event) => setStudies(event.target.value)}
            placeholder="Estudios / profesión"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
        </div>
        <div className="relative">
          <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="URL de la foto"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-8 pr-3 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-1.5 text-sm font-semibold text-neutral-900 disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Guardar
        </button>
        {saved && <span className="text-sm text-green-400">Guardado.</span>}
        {error && (
          <span className="flex items-center gap-1 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </span>
        )}
      </div>
    </div>
  )
}

type BoardManagementDialogProps = {
  boardUsers: BoardUser[]
  onClose: () => void
  onUserSaved: (user: BoardUser) => void
}

function BoardManagementDialog({ boardUsers, onClose, onUserSaved }: BoardManagementDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <datalist id="position-suggestions">
        {positionSuggestions.map((label) => (
          <option key={label} value={label} />
        ))}
      </datalist>

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-white">Junta Directiva</h2>
        <p className="mt-1 text-sm text-white/60">
          Define el cargo, los estudios/profesión y la foto que aparecerán en la
          web pública para cada miembro de la junta.
        </p>

        <div className="mt-5 space-y-3 overflow-y-auto">
          {boardUsers.length === 0 ? (
            <p className="text-sm text-white/50">
              Todavía no hay nadie con rol de Junta Directiva o Administrador.
              Asígnalo primero desde la tabla de usuarios.
            </p>
          ) : (
            boardUsers.map((member) => (
              <BoardMemberRow key={member.id} member={member} onSaved={onUserSaved} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardManagementDialog
