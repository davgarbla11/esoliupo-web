import { motion } from 'framer-motion'
import { CalendarCheck, Clock3, Timer } from 'lucide-react'
import EventListItem from '../../components/dashboard/EventListItem'
import EventsCalendar from '../../components/dashboard/EventsCalendar'
import StatTile from '../../components/dashboard/StatTile'
import { useAuth } from '../../context/AuthContext'
import { getAttendedEvents, getUpcomingEvents, mockEvents } from '../../lib/mockEvents'

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function DashboardHome() {
  const { user } = useAuth()
  const upcoming = getUpcomingEvents()
  const attended = getAttendedEvents()
  const nextEvent = upcoming[0]
  const formationHours = attended.filter((e) => e.type === 'Formación').length * 2

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
          icon={CalendarCheck}
          label="Eventos asistidos"
          value={String(attended.length)}
          index={0}
        />
        <StatTile
          icon={Clock3}
          label="Horas de formación"
          value={`${formationHours}h`}
          index={1}
        />
        <StatTile
          icon={Timer}
          label="Próximo evento"
          value={nextEvent ? `en ${daysUntil(nextEvent.date)} días` : '—'}
          index={2}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-lg font-medium text-white">Próximos eventos</h2>
          <div className="mt-4 space-y-3">
            {upcoming.slice(0, 4).map((event, index) => (
              <EventListItem key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-white">Calendario</h2>
          <div className="mt-4">
            <EventsCalendar events={mockEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
