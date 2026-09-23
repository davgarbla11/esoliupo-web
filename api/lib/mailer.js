import fs from 'fs'
import { JWT } from 'google-auth-library'

const MAIL_FROM = process.env.MAIL_FROM ?? 'ESOLIUPO <no-reply@esoliupo.org>'
const GMAIL_SENDER = process.env.GMAIL_SENDER ?? 'no-reply@esoliupo.org'

function loadGmailClient() {
  const keyFile = process.env.GMAIL_SERVICE_ACCOUNT_KEY_FILE
  if (!keyFile || !fs.existsSync(keyFile)) {
    return null
  }

  const key = JSON.parse(fs.readFileSync(keyFile, 'utf-8'))

  return new JWT({
    email: key.client_email,
    key: key.private_key,
    subject: GMAIL_SENDER,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
  })
}

const gmailClient = loadGmailClient()

function encodeSubject(subject) {
  return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`
}

function buildRawMessage({ to, subject, html, text }) {
  const lines = [
    `From: ${MAIL_FROM}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: text/html; charset="UTF-8"`,
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(html ?? text ?? '', 'utf-8').toString('base64'),
  ]

  return Buffer.from(lines.join('\r\n'), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function sendMail({ to, subject, html, text }) {
  if (!gmailClient) {
    console.log(`[mailer] Gmail API no configurada — correo no enviado. Para: ${to} · Asunto: ${subject}`)
    return { sent: false }
  }

  const { token } = await gmailClient.getAccessToken()

  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(GMAIL_SENDER)}/messages/send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: buildRawMessage({ to, subject, html, text }) }),
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gmail API error ${res.status}: ${body}`)
  }

  return { sent: true, ...(await res.json()) }
}
