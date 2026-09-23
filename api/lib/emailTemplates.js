const GOLD = '#fcc101'
const INK = '#161616'
const MUTED = '#6b6b6b'
const BORDER = '#e8e8e8'
const SITE_URL = process.env.SITE_URL ?? 'https://esoliupo.org'

export function renderEmailLayout({ heading, preheader, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <span style="display:none; max-height:0; overflow:hidden;">${preheader ?? ''}</span>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid ${BORDER};">
            <tr>
              <td style="background-color:${INK}; padding:24px 32px;">
                <span style="color:${GOLD}; font-size:20px; font-weight:700; letter-spacing:0.02em;">
                  ESOLIUPO
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px; font-size:20px; line-height:1.35; color:${INK};">
                  ${heading}
                </h1>
                <div style="font-size:15px; line-height:1.6; color:#333333;">
                  ${bodyHtml}
                </div>
                ${
                  ctaLabel && ctaUrl
                    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                        <tr>
                          <td style="border-radius:999px; background-color:${GOLD};">
                            <a href="${ctaUrl}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:600; color:${INK}; text-decoration:none;">
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
              <td style="padding:20px 32px; border-top:1px solid ${BORDER};">
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
