import { motion } from 'framer-motion'
import { CalendarDays, Loader2, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import EventContent from '../components/EventContent'
import api from '../lib/api'
import type { EsoliupoEvent } from '../types/event'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function Activities() {
  const [events, setEvents] = useState<EsoliupoEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await api.get<{ events: EsoliupoEvent[] }>('/events/public')
        setEvents(res.data.events)
      } catch {
        setLoadError('No se han podido cargar las actividades.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-3xl px-6 py-32"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-gold-400">
        ESOLIUPO
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Actividades
      </h1>
      <p className="mt-4 max-w-2xl text-white/60">
        Lo último que la Junta Directiva ha organizado y publicado para los socios.
      </p>

      {loading && (
        <div className="mt-16 flex justify-center">
          <Loader2 className="animate-spin text-gold-400" size={28} />
        </div>
      )}

      {!loading && loadError && <p className="mt-10 text-white/50">{loadError}</p>}

      {!loading && !loadError && events.length === 0 && (
        <p className="mt-10 text-white/50">
          Todavía no hay actividades publicadas. Vuelve pronto.
        </p>
      )}

      <div className="mt-14 space-y-14">
        {events.map((event, index) => (
          <motion.article
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className={index > 0 ? 'border-t border-white/10 pt-14' : ''}
          >
            {event.coverImageUrl && (
              <img
                src={event.coverImageUrl}
                alt=""
                className="mb-6 aspect-video w-full rounded-2xl object-cover"
              />
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs uppercase tracking-wide text-gold-400/80">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={13} />
                {DATE_LABEL.format(new Date(event.date))}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {event.place}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {event.title}
            </h2>

            <p className="mt-3 text-white/60">{event.description}</p>

            {event.content && <EventContent html={event.content} className="mt-6" />}
          </motion.article>
        ))}
      </div>
    </motion.section>
  )
}

export default Activities
