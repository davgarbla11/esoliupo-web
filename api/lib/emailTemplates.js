const GOLD = '#fcc101'
const INK = '#0a0a0a'
const MUTED = '#6b6b6b'
const BORDER = '#e8e8e8'
const SITE_URL = process.env.SITE_URL ?? 'https://esoliupo.org'
const LOGO_URL = 'cid:esoliupo-logo'

const DATE_LABEL = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatEventDate(date) {
  return DATE_LABEL.format(new Date(date))
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toHtmlParagraphs(value) {
  return escapeHtml(value)
    .split(/\n+/)
    .map((line) => `<p>${line}</p>`)
    .join('')
}

export function renderEmailLayout({ eyebrow, heading, preheader, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f2f2f3; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden;">${preheader ?? ''}</span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f3; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px; background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <tr>
              <td style="background-color:${INK}; padding:22px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:middle; padding-right:10px;">
                      <img src="${LOGO_URL}" alt="ESOLIUPO" width="28" height="28" style="display:block; border-radius:6px;" />
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="color:#ffffff; font-size:17px; font-weight:700; letter-spacing:0.01em;">
                        ESOLIUPO
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:4px; background-color:${GOLD}; font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:36px 32px 32px;">
                ${
                  eyebrow
                    ? `<p style="margin:0 0 10px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:${GOLD};">
                        ${eyebrow}
                      </p>`
                    : ''
                }
                <h1 style="margin:0 0 18px; font-size:22px; line-height:1.3; color:${INK};">
                  ${heading}
                </h1>
                <div style="font-size:15px; line-height:1.65; color:#333333;">
                  ${bodyHtml}
                </div>
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                        <tr>
                          <td style="border-radius:999px; background-color:${GOLD};">
                            <a href="${ctaUrl}" style="display:inline-block; padding:13px 30px; font-size:14px; font-weight:700; color:${INK}; text-decoration:none;">
                              ${ctaLabel}
                            </a>
                          </td>
                        </tr>
                      </table>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 26px; border-top:1px solid ${BORDER};">
                <p style="margin:0; font-size:12px; line-height:1.5; color:${MUTED};">
                  Este es un mensaje automático de ESOLIUPO, no respondas a este correo.
                  <br />
                  <a href="${SITE_URL}" style="color:${MUTED}; text-decoration:underline;">${SITE_URL.replace(/^https?:\/\//, '')}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function renderEventPublishedEmail({ title, date, place, description }) {
  return renderEmailLayout({
    eyebrow: 'Nuevo evento',
    heading: escapeHtml(title),
    preheader: `${formatEventDate(date)} · ${escapeHtml(place)}`,
    bodyHtml: `
      <p>La Junta Directiva ha publicado un nuevo evento:</p>
      <p style="margin:16px 0; padding:14px 16px; background-color:#faf7ee; border-radius:12px; font-size:14px; color:${INK};">
        📅 ${formatEventDate(date)}<br />
        📍 ${escapeHtml(place)}
      </p>
      <p>${escapeHtml(description)}</p>
    `,
    ctaLabel: 'Ver en Actividades',
    ctaUrl: `${SITE_URL}/actividades`,
  })
}

export function renderTrainingPublishedEmail({ title, date, place, description }) {
  return renderEmailLayout({
    eyebrow: 'Nueva formación',
    heading: escapeHtml(title),
    preheader: `${formatEventDate(date)} · ${escapeHtml(place)}`,
    bodyHtml: `
      <p>La Junta Directiva ha publicado una nueva formación y ya puedes inscribirte:</p>
      <p style="margin:16px 0; padding:14px 16px; background-color:#faf7ee; border-radius:12px; font-size:14px; color:${INK};">
        📅 ${formatEventDate(date)}<br />
        📍 ${escapeHtml(place)}
      </p>
      <p>${escapeHtml(description)}</p>
    `,
    ctaLabel: 'Inscribirme',
    ctaUrl: `${SITE_URL}/dashboard/formaciones`,
  })
}

export function renderMembershipRequestReceivedEmail({ name }) {
  return renderEmailLayout({
    eyebrow: 'Solicitud recibida',
    heading: `Hola, ${escapeHtml(name)}`,
    preheader: 'Tu solicitud para unirte a ESOLIUPO se ha registrado',
    bodyHtml: `
      <p>Hemos recibido tu solicitud para unirte a ESOLIUPO.</p>
      <p>La Junta Directiva la revisará y te contactará por correo con los siguientes pasos.</p>
    `,
  })
}

export function renderMembershipApprovedEmail({ name, email, password }) {
  return renderEmailLayout({
    eyebrow: 'Ya eres socio',
    heading: `Bienvenido/a a ESOLIUPO, ${escapeHtml(name)}`,
    preheader: 'Tu cuenta de socio ya está lista',
    bodyHtml: `
      <p>Tu solicitud ha sido aprobada. Ya puedes acceder al panel de socios con estas credenciales:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0; width:100%; background-color:#faf7ee; border-radius:12px;">
        <tr>
          <td style="padding:14px 16px; font-size:14px; color:${INK};">
            <strong>Correo:</strong> ${escapeHtml(email)}<br />
            <strong>Contraseña temporal:</strong> ${escapeHtml(password)}
          </td>
        </tr>
      </table>
      <p>Por seguridad, cámbiala en cuanto inicies sesión.</p>
    `,
    ctaLabel: 'Iniciar sesión',
    ctaUrl: `${SITE_URL}/login`,
  })
}

export function renderLeaveApprovedEmail({ name }) {
  return renderEmailLayout({
    eyebrow: 'Baja procesada',
    heading: `Hasta pronto, ${escapeHtml(name)}`,
    preheader: 'Tu baja de ESOLIUPO se ha procesado correctamente',
    bodyHtml: `
      <p>Tu solicitud de baja como socio de ESOLIUPO ha sido aprobada y se ha procesado correctamente.</p>
      <p>Si en el futuro quieres volver a unirte, siempre serás bienvenido/a.</p>
    `,
  })
}

export function renderPasswordResetEmail({ name, email, password }) {
  return renderEmailLayout({
    eyebrow: 'Contraseña restablecida',
    heading: `Hola, ${escapeHtml(name)}`,
    preheader: 'Se ha restablecido la contraseña de tu cuenta de ESOLIUPO',
    bodyHtml: `
      <p>Un Administrador ha restablecido la contraseña de tu cuenta. Estos son tus nuevos accesos:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0; width:100%; background-color:#faf7ee; border-radius:12px;">
        <tr>
          <td style="padding:14px 16px; font-size:14px; color:${INK};">
            <strong>Correo:</strong> ${escapeHtml(email)}<br />
            <strong>Contraseña temporal:</strong> ${escapeHtml(password)}
          </td>
        </tr>
      </table>
      <p>Por seguridad, cámbiala en cuanto inicies sesión.</p>
      <p style="color:${MUTED}; font-size:13px;">
        Si no esperabas este correo, contacta con la Junta Directiva.
      </p>
    `,
    ctaLabel: 'Iniciar sesión',
    ctaUrl: `${SITE_URL}/login`,
  })
}

export function renderPasswordResetLinkEmail({ name, resetUrl }) {
  return renderEmailLayout({
    eyebrow: 'Restablecer contraseña',
    heading: `Hola, ${escapeHtml(name)}`,
    preheader: 'Enlace para restablecer tu contraseña de ESOLIUPO',
    bodyHtml: `
      <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
      <p>El enlace es válido durante 1 hora y solo se puede usar una vez.</p>
      <p style="color:${MUTED}; font-size:13px;">
        Si no has sido tú, ignora este correo — tu contraseña actual seguirá funcionando.
      </p>
    `,
    ctaLabel: 'Restablecer mi contraseña',
    ctaUrl: resetUrl,
  })
}

export function renderContactReplyEmail({ name, message, reply }) {
  return renderEmailLayout({
    eyebrow: 'Respuesta a tu consulta',
    heading: `Hola, ${escapeHtml(name)}`,
    preheader: 'La Junta Directiva ha respondido a tu consulta',
    bodyHtml: `
      <p>La Junta Directiva de ESOLIUPO ha respondido a tu consulta:</p>
      <div style="margin:16px 0; padding:14px 16px; background-color:#faf7ee; border-radius:12px; font-size:14px; color:${INK};">
        ${toHtmlParagraphs(reply)}
      </div>
      <p style="color:${MUTED}; font-size:13px;">Tu consulta original:</p>
      <blockquote style="margin:0; padding-left:14px; border-left:2px solid ${BORDER}; color:${MUTED}; font-size:13px;">
        ${toHtmlParagraphs(message)}
      </blockquote>
    `,
  })
}
