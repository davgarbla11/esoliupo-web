import fs from 'fs'
import path from 'path'
import { OAuth2Client } from 'google-auth-library'

const MAIL_FROM = process.env.MAIL_FROM ?? 'ESOLIUPO <no-reply@esoliupo.org>'
const LOGO_CID = 'esoliupo-logo'
const LOGO_PATH = path.resolve('assets/icon-mark.png')
const BOUNDARY = 'esoliupo-mail-boundary'

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
const logoBase64 = fs.existsSync(LOGO_PATH) ? wrapBase64(fs.readFileSync(LOGO_PATH).toString('base64')) : null

function wrapBase64(base64) {
  return base64.replace(/.{76}/g, '$&\r\n')
}

function encodeSubject(subject) {
  return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`
}

function buildRawMessage({ to, subject, html, text }) {
  const htmlPart = [
    `Content-Type: text/html; charset="UTF-8"`,
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(Buffer.from(html ?? text ?? '', 'utf-8').toString('base64')),
  ].join('\r\n')

  const logoPart = logoBase64
    ? [
        'Content-Type: image/png',
        'Content-Transfer-Encoding: base64',
        `Content-ID: <${LOGO_CID}>`,
        'Content-Disposition: inline; filename="logo.png"',
        '',
        logoBase64,
      ].join('\r\n')
    : null

  const lines = [
    `From: ${MAIL_FROM}`,
    `To: ${to}`,
    `Subject: ${encodeSubject(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/related; boundary="${BOUNDARY}"`,
    '',
    `--${BOUNDARY}`,
    htmlPart,
    ...(logoPart ? [`--${BOUNDARY}`, logoPart] : []),
    `--${BOUNDARY}--`,
  ]

  return Buffer.from(lines.join('\r\n'), 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function assertNoHeaderInjection(to) {
  if (/[\r\n]/.test(to)) {
    throw new Error(`Refusing to send: "to" address contains CR/LF: ${JSON.stringify(to)}`)
  }
}

export async function sendMail({ to, subject, html, text }) {
  assertNoHeaderInjection(to)

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
