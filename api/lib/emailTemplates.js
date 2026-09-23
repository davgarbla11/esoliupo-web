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
    heading: title,
    preheader: `${formatEventDate(date)} · ${place}`,
    bodyHtml: `
      <p>La Junta Directiva ha publicado un nuevo evento:</p>
      <p style="margin:16px 0; padding:14px 16px; background-color:#faf7ee; border-radius:12px; font-size:14px; color:${INK};">
        📅 ${formatEventDate(date)}<br />
        📍 ${place}
      </p>
      <p>${description}</p>
    `,
    ctaLabel: 'Ver en Actividades',
    ctaUrl: `${SITE_URL}/actividades`,
  })
}

export function renderTrainingPublishedEmail({ title, date, place, description }) {
  return renderEmailLayout({
    eyebrow: 'Nueva formación',
    heading: title,
    preheader: `${formatEventDate(date)} · ${place}`,
    bodyHtml: `
      <p>La Junta Directiva ha publicado una nueva formación y ya puedes inscribirte:</p>
      <p style="margin:16px 0; padding:14px 16px; background-color:#faf7ee; border-radius:12px; font-size:14px; color:${INK};">
        📅 ${formatEventDate(date)}<br />
        📍 ${place}
      </p>
      <p>${description}</p>
    `,
    ctaLabel: 'Inscribirme',
    ctaUrl: `${SITE_URL}/dashboard/formaciones`,
  })
}

export function renderMembershipRequestReceivedEmail({ name }) {
  return renderEmailLayout({
    eyebrow: 'Solicitud recibida',
    heading: `Hola, ${name}`,
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
    heading: `Bienvenido/a a ESOLIUPO, ${name}`,
    preheader: 'Tu cuenta de socio ya está lista',
    bodyHtml: `
      <p>Tu solicitud ha sido aprobada. Ya puedes acceder al panel de socios con estas credenciales:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0; width:100%; background-color:#faf7ee; border-radius:12px;">
        <tr>
          <td style="padding:14px 16px; font-size:14px; color:${INK};">
            <strong>Correo:</strong> ${email}<br />
            <strong>Contraseña temporal:</strong> ${password}
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
    heading: `Hasta pronto, ${name}`,
    preheader: 'Tu baja de ESOLIUPO se ha procesado correctamente',
    bodyHtml: `
      <p>Tu solicitud de baja como socio de ESOLIUPO ha sido aprobada y se ha procesado correctamente.</p>
      <p>Si en el futuro quieres volver a unirte, siempre serás bienvenido/a.</p>
    `,
  })
}
