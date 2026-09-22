import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CircleAlert, EllipsisVertical, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import MembershipRequestDialog, {
  type MembershipRequest,
} from '../../components/dashboard/MembershipRequestDialog'
import api from '../../lib/api'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function MembershipRequests() {
  const [requests, setRequests] = useState<MembershipRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selected, setSelected] = useState<MembershipRequest | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ requests: MembershipRequest[] }>('/membership-requests')
      setRequests(res.data.requests)
    } catch (err) {
      const message = isAxiosError<{ error?: string }>(err)
        ? err.response?.data.error
        : undefined
      setLoadError(message ?? 'No se han podido cargar las solicitudes.')
    } finally {
      setLoading(false)
    }
  }

  function handleApproved(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  function handleDeleted(id: string) {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Socios</h1>
        <p className="mt-2 text-white/60">
          Solicitudes pendientes de estudiantes que quieren unirse a la asociación.
        </p>
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
            onClick={loadRequests}
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
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Correo</th>
                <th className="px-5 py-3 font-medium">Solicitado</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {requests.map((request) => (
                <tr key={request.id} className="bg-white/[0.02]">
                  <td className="px-5 py-4 font-medium text-white">{request.name}</td>
                  <td className="px-5 py-4 text-white/60">{request.email}</td>
                  <td className="px-5 py-4 text-white/60">
                    {DATE_LABEL.format(new Date(request.createdAt))}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(request)}
                      className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                      aria-label={`Más opciones para ${request.name}`}
                    >
                      <EllipsisVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-white/40">
                    No hay solicitudes pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      )}

      {selected && (
        <MembershipRequestDialog
          request={selected}
          onClose={() => setSelected(null)}
          onApproved={handleApproved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

export default MembershipRequests
