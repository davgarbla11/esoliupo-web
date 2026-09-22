import { motion } from 'framer-motion'
import { Clock, MapPin } from 'lucide-react'
import type { EventItem } from '../../lib/mockEvents'

const MONTH_LABEL = new Intl.DateTimeFormat('es-ES', { month: 'short' })
const TIME_LABEL = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
})

function EventListItem({ event, index }: { event: EventItem; index: number }) {
  const date = new Date(event.date)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
    >
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-gold-400/10 text-gold-400">
        <span className="text-xs font-medium uppercase leading-none">
          {MONTH_LABEL.format(date).replace('.', '')}
        </span>
        <span className="text-lg font-semibold leading-none">{date.getDate()}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-white">{event.title}</p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
            {event.type}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {TIME_LABEL.format(date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {event.location}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default EventListItem
