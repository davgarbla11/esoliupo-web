export type EventItem = {
  id: string
  title: string
  type: 'Evento' | 'Formación'
  date: string
  location: string
  attended?: boolean
}

function addDays(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(18, 0, 0, 0)
  return date.toISOString()
}

export const mockEvents: EventItem[] = [
  {
    id: 'e-1',
    title: 'Hackathon UPO 2026',
    type: 'Evento',
    date: addDays(-62),
    location: 'ETSII, Sala de Grados',
    attended: true,
  },
  {
    id: 'e-2',
    title: 'Taller de Git y GitHub',
    type: 'Formación',
    date: addDays(-45),
    location: 'Aula 1.03',
    attended: true,
  },
  {
    id: 'e-3',
    title: 'Charla: Introducción a Rust',
    type: 'Formación',
    date: addDays(-21),
    location: 'Online',
    attended: false,
  },
  {
    id: 'e-4',
    title: 'Sesión de mentoring con alumni',
    type: 'Formación',
    date: addDays(-10),
    location: 'Aula 1.05',
    attended: true,
  },
  {
    id: 'e-5',
    title: 'Taller de Docker y Contenedores',
    type: 'Formación',
    date: addDays(3),
    location: 'Aula 1.03',
  },
  {
    id: 'e-6',
    title: 'Charla: IA generativa aplicada',
    type: 'Formación',
    date: addDays(10),
    location: 'Online',
  },
  {
    id: 'e-7',
    title: 'Hackathon de primavera',
    type: 'Evento',
    date: addDays(25),
    location: 'ETSII, Sala de Grados',
  },
  {
    id: 'e-8',
    title: 'Asamblea general de socios',
    type: 'Evento',
    date: addDays(40),
    location: 'Salón de Actos',
  },
]

export function getUpcomingEvents() {
  const now = Date.now()
  return mockEvents
    .filter((event) => new Date(event.date).getTime() >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getAttendedEvents() {
  const now = Date.now()
  return mockEvents.filter(
    (event) => new Date(event.date).getTime() < now && event.attended,
  )
}
