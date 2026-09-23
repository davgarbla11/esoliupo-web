import { renderEmailLayout } from '../lib/emailTemplates.js'
import { sendMail } from '../lib/mailer.js'
import prisma from '../lib/prisma.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendTestEmail(req, res) {
  const { to } = req.body

  if (!to?.trim() || !EMAIL_PATTERN.test(to.trim())) {
    return res.status(400).json({ error: 'Introduce un correo válido.' })
  }

  const html = renderEmailLayout({
    heading: 'Correo de prueba',
    preheader: 'Prueba del servicio de notificaciones de ESOLIUPO',
    bodyHtml: `<p>Este es un correo de prueba enviado desde el panel de Superadmin por <strong>${req.user.email}</strong>.</p><p>Si lo has recibido, el servicio de notificaciones funciona correctamente.</p>`,
  })

  const info = await sendMail({
    to: to.trim(),
    subject: 'ESOLIUPO — correo de prueba',
    html,
  })

  res.json({ sent: info.sent !== false })
}

export async function listAuditLogs(req, res) {
  const { role, search } = req.query
  const limit = Math.min(Number(req.query.limit) || 100, 500)

  const where = {}
  if (role) {
    where.role = role
  }
  if (search?.trim()) {
    where.OR = [
      { userEmail: { contains: search.trim(), mode: 'insensitive' } },
      { ip: { contains: search.trim() } },
      { path: { contains: search.trim() } },
    ]
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  res.json({ logs })
}
