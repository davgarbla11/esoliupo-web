export type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  status: 'PENDING' | 'ANSWERED'
  reply: string | null
  repliedBy: string | null
  repliedAt: string | null
  createdAt: string
}
