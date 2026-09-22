import { isAxiosError } from 'axios'
import { Check, CircleAlert, Copy, Loader2, UserPlus, X } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import type { Role } from '../../context/AuthContext'
import api from '../../lib/api'

type CreatedUser = {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  position: string | null
  studies: string | null
  photoUrl: string | null
  createdAt: string
}

const roleOptions: { value: Role; label: string }[] = [
  { value: 'SOCIO', label: 'Socio' },
  { value: 'COLABORADOR_EXTERNO', label: 'Colaborador externo' },
  { value: 'JUNTA_DIRECTIVA', label: 'Junta Directiva' },
  { value: 'ADMINISTRADOR', label: 'Administrador' },
]

type CreateUserDialogProps = {
  onClose: () => void
  onCreated: (user: CreatedUser) => void
}

function CreateUserDialog({ onClose, onCreated }: CreateUserDialogProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('SOCIO')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ user: CreatedUser; temporaryPassword: string } | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!name.trim() || !email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post<{ user: CreatedUser; temporaryPassword: string }>('/users', {
        name: name.trim(),
        email: email.trim(),
        role,
      })
      setResult(res.data)
      onCreated(res.data.user)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido crear el usuario.')
    } finally {
      setLoading(false)
    }
  }

  async function copyPassword() {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.temporaryPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
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

        {!result ? (
          <>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <UserPlus size={18} />
              Crear usuario
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Se generará una contraseña temporal para compartir con la persona.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Nombre</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nombre y apellidos"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Correo</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-white/80">Rol</label>
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-black">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm text-red-400">
                  <CircleAlert size={14} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-2.5 text-sm font-semibold text-neutral-900 disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Crear usuario
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white">Usuario creado</h2>
            <p className="mt-1 text-sm text-white/60">
              Comparte esta contraseña temporal con {result.user.name} de forma segura — no
              volverá a mostrarse.
            </p>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <code className="text-sm text-gold-400">{result.temporaryPassword}</code>
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
          </>
        )}
      </div>
    </div>
  )
}

export default CreateUserDialog
