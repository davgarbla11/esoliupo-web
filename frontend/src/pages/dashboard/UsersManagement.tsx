import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CircleAlert, EllipsisVertical, Loader2, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { type Role, useAuth } from '../../context/AuthContext'
import UserActionsDialog from '../../components/dashboard/UserActionsDialog'
import api from '../../lib/api'

type ManagedUser = {
  id: string
  email: string
  name: string
  role: Role
  active: boolean
  createdAt: string
}

const roleLabels: Record<Role, string> = {
  SOCIO: 'Socio',
  JUNTA_DIRECTIVA: 'Junta Directiva',
  ADMINISTRADOR: 'Administrador',
}

const roleBadgeStyles: Record<Role, string> = {
  SOCIO: 'bg-white/5 text-white/60',
  JUNTA_DIRECTIVA: 'bg-white/10 text-white',
  ADMINISTRADOR: 'bg-gold-400/15 text-gold-400',
}

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleBadgeStyles[role]}`}
    >
      {roleLabels[role]}
    </span>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        active ? 'text-white/60' : 'text-red-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`}
      />
      {active ? 'Activo' : 'De baja'}
    </span>
  )
}

function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [dialogUser, setDialogUser] = useState<ManagedUser | null>(null)
  const [rowMessages, setRowMessages] = useState<
    Record<string, { type: 'success' | 'error'; text: string }>
  >({})

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ users: ManagedUser[] }>('/users')
      setUsers(res.data.users)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setLoadError(message ?? 'No se han podido cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  function showRowMessage(id: string, message: { type: 'success' | 'error'; text: string }) {
    setRowMessages((prev) => ({ ...prev, [id]: message }))
    setTimeout(() => {
      setRowMessages((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }, 3500)
  }

  async function handleRoleChange(id: string, role: Role) {
    setUpdatingId(id)
    try {
      const res = await api.patch<{ user: ManagedUser }>(`/users/${id}/role`, { role })
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.user : u)))
      showRowMessage(id, { type: 'success', text: 'Rol actualizado.' })
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      showRowMessage(id, { type: 'error', text: message ?? 'No se ha podido actualizar.' })
    } finally {
      setUpdatingId(null)
    }
  }

  function handleStatusChange(id: string, active: boolean) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active } : u)))
    showRowMessage(id, {
      type: 'success',
      text: active ? 'Usuario reactivado.' : 'Usuario dado de baja.',
    })
  }

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term),
    )
  }, [users, search])

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
      >
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
            ESOLIUPO
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            Usuarios y roles
          </h1>
          <p className="mt-2 text-white/60">
            Gestiona los usuarios registrados y otorga roles.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o correo"
            className="w-full rounded-lg border border-white/10 bg-black/30 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
          />
        </div>
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
            onClick={loadUsers}
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
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 overflow-x-auto rounded-2xl border border-white/10"
        >
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Socio</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Rol actual</th>
                <th className="px-5 py-3 font-medium">Otorgar rol</th>
                <th className="px-5 py-3 font-medium">Miembro desde</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id
                const isUpdating = updatingId === u.id
                const rowMessage = rowMessages[u.id]

                return (
                  <tr key={u.id} className="bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {u.name}
                        {isSelf && <span className="ml-2 text-xs text-white/40">(tú)</span>}
                      </p>
                      <p className="text-white/50">{u.email}</p>
                      {rowMessage && (
                        <p
                          className={`mt-1 flex items-center gap-1 text-xs ${
                            rowMessage.type === 'success' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {rowMessage.type === 'success' ? (
                            <ShieldCheck size={12} />
                          ) : (
                            <CircleAlert size={12} />
                          )}
                          {rowMessage.text}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge active={u.active} />
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          disabled={isSelf || isUpdating}
                          onChange={(event) =>
                            handleRoleChange(u.id, event.target.value as Role)
                          }
                          className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white disabled:opacity-40"
                        >
                          {Object.entries(roleLabels).map(([value, label]) => (
                            <option key={value} value={value} className="bg-black">
                              {label}
                            </option>
                          ))}
                        </select>
                        {isUpdating && (
                          <Loader2 size={16} className="animate-spin text-white/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">
                      {DATE_LABEL.format(new Date(u.createdAt))}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDialogUser(u)}
                        className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label={`Más acciones para ${u.name}`}
                      >
                        <EllipsisVertical size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                    No se han encontrado usuarios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {dialogUser && (
        <UserActionsDialog
          user={dialogUser}
          onClose={() => setDialogUser(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

export default UsersManagement
