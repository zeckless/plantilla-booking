import { Resend } from "resend"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getBusinessSettings } from "./business-settings"

const resend = new Resend(process.env.RESEND_API_KEY)

function formatCLP(amount: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(amount)
}

interface ConfirmationEmailArgs {
  to: string
  clientName: string
  serviceName: string
  date: Date
  depositPaid: number
  balanceDue: number
  appointmentId: string
}

export async function sendConfirmationEmail(args: ConfirmationEmailArgs) {
  const { to, clientName, serviceName, date, depositPaid, balanceDue, appointmentId } = args

  const formattedDate = format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })
  const formattedTime = format(date, "HH:mm")
  const dbSettings = await getBusinessSettings()
  const businessName = dbSettings.name || process.env.BUSINESS_NAME || "Barbería & Estética"
  const businessEmail = dbSettings.email || process.env.BUSINESS_EMAIL || "contacto@barberia.cl"
  const businessPhone = dbSettings.phone || process.env.BUSINESS_PHONE || "+56 9 1234 5678"
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reserva confirmada</title>
</head>
<body style="margin:0;padding:0;background:#f5f0ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0ea;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#a89e98;">
                ${businessName}
              </p>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;border:1px solid #e2dbd2;overflow:hidden;">

              <!-- Icon + Title -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid #f5f0ea;">
                    <div style="width:56px;height:56px;background:#f5eaea;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
                      <span style="font-size:24px;">✓</span>
                    </div>
                    <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:#1a1612;letter-spacing:-0.02em;">
                      ¡Reserva confirmada!
                    </h1>
                    <p style="margin:0;font-size:14px;color:#6b6460;">
                      Hola ${clientName}, tu turno está agendado.
                    </p>
                  </td>
                </tr>

                <!-- Details -->
                <tr>
                  <td style="padding:32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">

                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#a89e98;">Servicio</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#1a1612;">${serviceName}</p>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#a89e98;">Fecha y hora</p>
                          <p style="margin:0;font-size:15px;font-weight:600;color:#1a1612;text-transform:capitalize;">${formattedDate}</p>
                          <p style="margin:4px 0 0;font-size:14px;color:#6b6460;">${formattedTime} hs</p>
                        </td>
                      </tr>

                      <!-- Divider -->
                      <tr>
                        <td style="padding:8px 0 24px;">
                          <hr style="border:none;border-top:1px solid #e2dbd2;margin:0;" />
                        </td>
                      </tr>

                      <!-- Pricing -->
                      <tr>
                        <td>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:14px;color:#6b6460;padding-bottom:8px;">Seña pagada</td>
                              <td style="font-size:14px;font-weight:600;color:#1a1612;text-align:right;padding-bottom:8px;">${formatCLP(depositPaid)}</td>
                            </tr>
                            <tr>
                              <td style="font-size:14px;color:#6b6460;">Saldo a pagar en el local</td>
                              <td style="font-size:14px;font-weight:600;color:#1a1612;text-align:right;">${formatCLP(balanceDue)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>

                <!-- Footer note -->
                <tr>
                  <td style="padding:24px 40px;background:#f5f0ea;border-top:1px solid #e2dbd2;border-radius:0 0 20px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;color:#6b6460;line-height:1.6;">
                      Si necesitas cancelar o reprogramar tu turno, contáctanos con anticipación.
                    </p>
                    <p style="margin:0;font-size:13px;color:#6b6460;">
                      📞 <a href="tel:${businessPhone.replace(/\s/g, '')}" style="color:#a87878;text-decoration:none;">${businessPhone}</a>
                      &nbsp;&nbsp;·&nbsp;&nbsp;
                      ✉️ <a href="mailto:${businessEmail}" style="color:#a87878;text-decoration:none;">${businessEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom note -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a89e98;">
                ${businessName} · Pago procesado de forma segura con Webpay Plus
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    await resend.emails.send({
      from: `${businessName} <reservas@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
      to,
      subject: `✓ Reserva confirmada — ${serviceName}`,
      html,
    })
    console.log("[email] confirmation sent to", to)
  } catch (error) {
    // Don't fail the payment flow if email fails
    console.error("[email] failed to send confirmation:", error)
  }
}
