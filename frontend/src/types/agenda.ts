export type AgendaKind = 'Evento' | 'Formación'

export type AgendaItem = {
  id: string
  title: string
  date: string
  place: string
  kind: AgendaKind
}
