import 'dotenv/config'
import { exec } from 'child_process'
import http from 'http'
import { OAuth2Client } from 'google-auth-library'

const PORT = 53682
const REDIRECT_URI = `http://localhost:${PORT}`

const clientId = process.env.GMAIL_OAUTH_CLIENT_ID
const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error('Faltan GMAIL_OAUTH_CLIENT_ID / GMAIL_OAUTH_CLIENT_SECRET en .env')
  process.exit(1)
}

const client = new OAuth2Client(clientId, clientSecret, REDIRECT_URI)

const authUrl = client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
})

console.log('\nAbre esta URL e inicia sesión como no-reply@esoliupo.org:\n')
console.log(authUrl)
console.log('\nEsperando autorización...\n')

exec(`open "${authUrl}"`)

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  const code = url.searchParams.get('code')

  if (!code) {
    res.writeHead(400)
    res.end('Falta el parámetro code.')
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end('<h1>Listo</h1><p>Ya puedes cerrar esta pestaña y volver a la terminal.</p>')

  const { tokens } = await client.getToken(code)

  console.log('Refresh token obtenido — cópialo a GMAIL_OAUTH_REFRESH_TOKEN en .env:\n')
  console.log(tokens.refresh_token ?? '(vacío — revoca el acceso en https://myaccount.google.com/permissions y vuelve a ejecutar este script)')
  console.log()

  server.close()
  process.exit(0)
})

server.listen(PORT)
