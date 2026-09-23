import { OAuth2Client } from 'google-auth-library'

const MAIL_FROM = process.env.MAIL_FROM ?? 'ESOLIUPO <no-reply@esoliupo.org>'

function loadGmailClient() {
  const { GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET, GMAIL_OAUTH_REFRESH_TOKEN } =
    process.env

  if (!GMAIL_OAUTH_CLIENT_ID || !GMAIL_OAUTH_CLIENT_SECRET || !GMAIL_OAUTH_REFRESH_TOKEN) {
    return null
  }

  const client = new OAuth2Client(GMAIL_OAUTH_CLIENT_ID, GMAIL_OAUTH_CLIENT_SECRET)
  client.setCredentials({ refresh_token: GMAIL_OAUTH_REFRESH_TOKEN })
  return client
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
    console.log(`[mailer] Gmail OAuth no configurado — correo no enviado. Para: ${to} · Asunto: ${subject}`)
    return { sent: false }
  }

  const { token } = await gmailClient.getAccessToken()

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: buildRawMessage({ to, subject, html, text }) }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gmail API error ${res.status}: ${body}`)
  }

  return { sent: true, ...(await res.json()) }
}
