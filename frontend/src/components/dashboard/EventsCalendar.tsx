import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AgendaItem } from '../../types/agenda'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MONTH_LABEL = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
})

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function isSameDay(a: Date, b: Date) {
  return dayKey(a) === dayKey(b)
}

function buildMonthGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, i) => {
    const dayNumber = i - startOffset + 1
    return {
      date: new Date(year, month, dayNumber),
      inCurrentMonth: dayNumber >= 1 && dayNumber <= daysInMonth,
    }
  })
}

type EventsCalendarProps = {
  events: AgendaItem[]
}

function EventsCalendar({ events }: EventsCalendarProps) {
  const today = new Date()
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaItem[]>()
    for (const event of events) {
      const key = dayKey(new Date(event.date))
      map.set(key, [...(map.get(key) ?? []), event])
    }
    return map
  }, [events])

  const grid = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  )

  const selectedEvents = selectedDay ? eventsByDay.get(dayKey(selectedDay)) ?? [] : []

  function changeMonth(delta: number) {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDay(null)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium capitalize text-white">
          {MONTH_LABEL.format(cursor)}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-white/40">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map(({ date, inCurrentMonth }) => {
          const dayEvents = eventsByDay.get(dayKey(date)) ?? []
          const hasEvents = dayEvents.length > 0
          const isToday = isSameDay(date, today)
          const isSelected = selectedDay && isSameDay(date, selectedDay)

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!hasEvents}
              onClick={() => setSelectedDay(hasEvents ? date : null)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors ${
                !inCurrentMonth ? 'text-white/20' : 'text-white/80'
              } ${isSelected ? 'bg-gold-400 text-neutral-900' : hasEvents ? 'hover:bg-white/10' : ''} ${
                isToday && !isSelected ? 'ring-1 ring-gold-400/60' : ''
              }`}
            >
              {date.getDate()}
              {hasEvents && (
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isSelected ? 'bg-neutral-900' : 'bg-gold-400'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          {selectedEvents.map((event) => (
            <div key={event.id} className="text-sm">
              <div className="flex items-center gap-2">
                <p className="font-medium text-white">{event.title}</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                  {event.kind}
                </span>
              </div>
              <p className="text-white/50">{event.place}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsCalendar
