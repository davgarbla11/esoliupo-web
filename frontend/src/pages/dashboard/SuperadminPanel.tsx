import { isAxiosError } from 'axios'
import { motion } from 'framer-motion'
import { CircleAlert, Loader2, RefreshCw, Send, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMaintenance } from '../../context/MaintenanceContext'
import api from '../../lib/api'
import type { AuditLogEntry } from '../../types/auditLog'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function getErrorMessage(err: unknown, fallback: string) {
  return isAxiosError<{ error?: string }>(err) ? err.response?.data.error ?? fallback : fallback
}

type Tab = 'correo' | 'logs' | 'mantenimiento'

function MaintenanceTab() {
  const { maintenanceMode, loading, refresh } = useMaintenance()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleToggle() {
    setSaving(true)
    setError('')
    try {
      await api.patch('/settings', { maintenanceMode: !maintenanceMode })
      await refresh()
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido cambiar el estado.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-8 max-w-md">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">Modo mantenimiento</p>
          <p className="mt-1 text-sm text-white/50">
            La web pública mostrará un aviso de mantenimiento a cualquiera que no sea
            Administrador. El panel sigue accesible para gestionar todo con normalidad.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading || saving}
          role="switch"
          aria-checked={maintenanceMode}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
            maintenanceMode ? 'bg-red-500' : 'bg-white/15'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              maintenanceMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {maintenanceMode && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-300">
          <TriangleAlert size={14} />
          La web pública está en mantenimiento ahora mismo.
        </p>
      )}

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
          <CircleAlert size={14} />
          {error}
        </p>
      )}
    </div>
  )
}

function TestEmailTab() {
  const [to, setTo] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: boolean } | null>(null)
  const [error, setError] = useState('')

  async function handleSend() {
    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await api.post<{ sent: boolean }>('/admin/test-email', { to })
      setResult(res.data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se ha podido enviar el correo.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mt-8 max-w-md">
      <label className="mb-1.5 block text-sm font-medium text-white/80">
        Correo de destino
      </label>
      <input
        type="email"
        value={to}
        onChange={(event) => setTo(event.target.value)}
        placeholder="tu@correo.com"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
      />

      {error && (
        <p className="mt-3 flex items-center gap-2 text-sm text-red-400">
          <CircleAlert size={14} />
          {error}
        </p>
      )}

      {result && (
        <p className="mt-3 text-sm text-white/60">
          {result.sent
            ? 'Correo enviado correctamente.'
            : 'Gmail OAuth no está configurado — el correo se ha registrado en consola pero no se ha enviado de verdad.'}
        </p>
      )}

      <button
        type="button"
        onClick={handleSend}
        disabled={sending || !to.trim()}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-400 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Enviar prueba
      </button>
    </div>
  )
}

function LogsTab() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadLogs()
  }, [])

  async function loadLogs() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await api.get<{ logs: AuditLogEntry[] }>('/admin/logs', {
        params: search.trim() ? { search: search.trim() } : undefined,
      })
      setLogs(res.data.logs)
    } catch (err) {
      setLoadError(getErrorMessage(err, 'No se han podido cargar los registros.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && loadLogs()}
          placeholder="Buscar por correo, IP o ruta..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-gold-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={loadLogs}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      )}

      {!loading && loadError && (
        <p className="mt-6 flex items-center gap-2 text-sm text-red-400">
          <CircleAlert size={14} />
          {loadError}
        </p>
      )}

      {!loading && !loadError && (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
                <th className="px-5 py-3 font-medium">Fecha</th>
                <th className="px-5 py-3 font-medium">Usuario</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">IP</th>
                <th className="px-5 py-3 font-medium">Petición</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {logs.map((log) => (
                <tr key={log.id} className="bg-white/[0.02]">
                  <td className="whitespace-nowrap px-5 py-3 text-white/60">
                    {DATE_LABEL.format(new Date(log.createdAt))}
                  </td>
                  <td className="px-5 py-3 text-white">{log.userEmail}</td>
                  <td className="px-5 py-3 text-white/60">{log.role}</td>
                  <td className="px-5 py-3 font-mono text-white/60">{log.ip}</td>
                  <td className="px-5 py-3 font-mono text-white/60">
                    {log.method} {log.path}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        log.statusCode >= 400
                          ? 'bg-red-400/10 text-red-300'
                          : 'bg-green-400/10 text-green-400'
                      }`}
                    >
                      {log.statusCode}
                    </span>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-white/40">
                    Sin registros todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SuperadminPanel() {
  const [tab, setTab] = useState<Tab>('correo')

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          ESOLIUPO
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">Superadmin</h1>
        <p className="mt-2 text-white/60">
          Herramientas internas: prueba de notificaciones y registro de actividad.
        </p>
      </motion.div>

      <div className="mt-6 flex gap-1 border-b border-white/10">
        {(['correo', 'logs', 'mantenimiento'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === value
                ? 'border-b-2 border-gold-400 text-white'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {value === 'correo' ? 'Correo' : value === 'logs' ? 'Logs' : 'Mantenimiento'}
          </button>
        ))}
      </div>

      {tab === 'correo' && <TestEmailTab />}
      {tab === 'logs' && <LogsTab />}
      {tab === 'mantenimiento' && <MaintenanceTab />}
    </div>
  )
}

export default SuperadminPanel
