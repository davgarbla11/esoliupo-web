import { isAxiosError } from 'axios'
import { CircleAlert, Loader2, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../lib/api'

type PositionUser = {
  id: string
  name: string
  email: string
}

type Position = {
  id: string
  name: string
  user: PositionUser | null
}

type AssignableUser = {
  id: string
  name: string
  email: string
}

type PositionsManagementDialogProps = {
  users: AssignableUser[]
  onClose: () => void
  onChanged: () => void
}

function PositionsManagementDialog({ users, onClose, onChanged }: PositionsManagementDialogProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [newUserId, setNewUserId] = useState('')
  const [creating, setCreating] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    loadPositions()
  }, [])

  async function loadPositions() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get<{ positions: Position[] }>('/positions')
      setPositions(res.data.positions)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se han podido cargar los cargos.')
    } finally {
      setLoading(false)
    }
  }

  function assignedElsewhere(userId: string, exceptPositionId?: string) {
    return positions.some((p) => p.user?.id === userId && p.id !== exceptPositionId)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setError('')
    try {
      const res = await api.post<{ position: Position }>('/positions', {
        name: newName.trim(),
        userId: newUserId || undefined,
      })
      setPositions((prev) => [...prev, res.data.position])
      setNewName('')
      setNewUserId('')
      onChanged()
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido crear el cargo.')
    } finally {
      setCreating(false)
    }
  }

  async function handleAssign(positionId: string, userId: string) {
    setBusyId(positionId)
    setError('')
    try {
      const res = await api.patch<{ position: Position }>(`/positions/${positionId}`, {
        userId: userId || null,
      })
      setPositions((prev) => prev.map((p) => (p.id === positionId ? res.data.position : p)))
      onChanged()
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido asignar el cargo.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(positionId: string) {
    setBusyId(positionId)
    setError('')
    try {
      await api.delete(`/positions/${positionId}`)
      setPositions((prev) => prev.filter((p) => p.id !== positionId))
      onChanged()
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setError(message ?? 'No se ha podido eliminar el cargo.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-white/10 bg-black p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-semibold text-white">Cargos de la Junta Directiva</h2>
        <p className="mt-1 text-sm text-white/60">
          Define los cargos según vayan haciendo falta (Presidencia, Tesorería...) y
          asigna a quién ocupa cada uno. Asignar un cargo a alguien lo convierte
          automáticamente en Junta Directiva.
        </p>

        {error && (
          <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <CircleAlert size={14} />
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 className="animate-spin text-gold-400" size={24} />
          </div>
        ) : (
          <div className="mt-5 space-y-2 overflow-y-auto">
            {positions.map((position) => (
              <div
                key={position.id}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <span className="flex-1 truncate text-sm font-medium text-white">
                  {position.name}
                </span>
                <select
                  value={position.user?.id ?? ''}
                  onChange={(event) => handleAssign(position.id, event.target.value)}
                  disabled={busyId === position.id}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-sm text-white disabled:opacity-40"
                >
                  <option value="" className="bg-black">
                    Vacante
                  </option>
                  {users
                    .filter((u) => !assignedElsewhere(u.id, position.id))
                    .map((u) => (
                      <option key={u.id} value={u.id} className="bg-black">
                        {u.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDelete(position.id)}
                  disabled={busyId === position.id}
                  className="rounded-lg p-1.5 text-white/40 hover:bg-red-400/10 hover:text-red-400 disabled:opacity-40"
                  aria-label={`Eliminar cargo ${position.name}`}
                >
                  {busyId === position.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            ))}

            {positions.length === 0 && (
              <p className="py-4 text-center text-sm text-white/40">
                Todavía no has definido ningún cargo.
              </p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="Nuevo cargo (ej. Vocalía de Eventos)"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
          <select
            value={newUserId}
            onChange={(event) => setNewUserId(event.target.value)}
            className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-sm text-white"
          >
            <option value="" className="bg-black">
              Sin asignar
            </option>
            {users
              .filter((u) => !assignedElsewhere(u.id))
              .map((u) => (
                <option key={u.id} value={u.id} className="bg-black">
                  {u.name}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-2 text-sm font-semibold text-neutral-900 disabled:opacity-60"
          >
            {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Crear cargo
          </button>
        </div>
      </div>
    </div>
  )
}

export default PositionsManagementDialog
