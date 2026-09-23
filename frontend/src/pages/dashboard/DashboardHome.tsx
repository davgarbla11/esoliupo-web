import { motion } from 'framer-motion'
import { CalendarDays, Loader2, PartyPopper, Timer } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import EventListItem from '../../components/dashboard/EventListItem'
import EventsCalendar from '../../components/dashboard/EventsCalendar'
import StatTile from '../../components/dashboard/StatTile'
import { useAuth } from '../../context/AuthContext'
import api from '../../lib/api'
import type { EsoliupoEvent } from '../../types/event'

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function isThisMonth(date: string) {
  const d = new Date(date)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function DashboardHome() {
  const { user } = useAuth()
  const [events, setEvents] = useState<EsoliupoEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<{ events: EsoliupoEvent[] }>('/events/public')
        setEvents(res.data.events)
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const upcoming = useMemo(() => {
    const now = Date.now()
    return events
      .filter((event) => new Date(event.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [events])
  const nextEvent = upcoming[0]
  const eventsThisMonth = events.filter((event) => isThisMonth(event.date)).length

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
          Panel de socio
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Hola, {user?.name?.split(' ')[0]}
        </h1>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Timer}
          label="Próximo evento"
          value={nextEvent ? `en ${daysUntil(nextEvent.date)} días` : '—'}
          index={0}
        />
        <StatTile
          icon={CalendarDays}
          label="Eventos este mes"
          value={String(eventsThisMonth)}
          index={1}
        />
        <StatTile
          icon={PartyPopper}
          label="Eventos publicados"
          value={String(events.length)}
          index={2}
        />
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-lg font-medium text-white">Próximos eventos</h2>
            <div className="mt-4 space-y-3">
              {upcoming.slice(0, 4).map((event, index) => (
                <EventListItem key={event.id} event={event} index={index} />
              ))}

              {upcoming.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/40">
                  No hay próximos eventos publicados todavía.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium text-white">Calendario</h2>
            <div className="mt-4">
              <EventsCalendar events={events} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardHome
