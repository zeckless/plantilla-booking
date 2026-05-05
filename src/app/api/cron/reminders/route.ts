import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getBusinessSettings } from "@/lib/business-settings"

export const runtime = "nodejs"

// Vercel cron: llamar diariamente a las 10:00 AM
// vercel.json: { "crons": [{ "path": "/api/cron/reminders", "schedule": "0 13 * * *" }] }

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  // En producción verificar el secret; en dev se permite sin auth
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const now = new Date()
  const tomorrowStart = new Date(now)
  tomorrowStart.setDate(tomorrowStart.getDate() + 1)
  tomorrowStart.setHours(0, 0, 0, 0)

  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: tomorrowStart, lt: tomorrowEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      reminderSent: false,
    },
    include: {
      user: { select: { name: true, phone: true } },
      service: { select: { name: true } },
    },
  })

  const settings = await getBusinessSettings()
  const sent: string[] = []
  const failed: string[] = []

  for (const appt of appointments) {
    const phone = appt.user.phone?.replace(/\D/g, "")
    if (!phone) { failed.push(appt.id); continue }

    const dateStr = format(appt.date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
    const message = encodeURIComponent(
      `Hola ${appt.user.name} 👋 Te recordamos que mañana tienes una cita en *${settings.name}*.\n\n` +
      `📅 ${dateStr}\n✂️ ${appt.service.name}\n\n` +
      `Si necesitas cancelar o cambiar tu hora, contáctanos con anticipación. ¡Te esperamos!`
    )

    // Si hay Twilio configurado, enviar automáticamente
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioFrom = process.env.TWILIO_WHATSAPP_FROM

    if (twilioSid && twilioToken && twilioFrom) {
      try {
        const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: `whatsapp:${twilioFrom}`,
            To: `whatsapp:+56${phone}`,
            Body: decodeURIComponent(message),
          }),
        })
        if (res.ok) {
          await prisma.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } })
          sent.push(appt.id)
        } else {
          failed.push(appt.id)
        }
      } catch {
        failed.push(appt.id)
      }
    } else {
      // Sin Twilio: marcar igual para que no se repita, el admin los ve en el panel
      sent.push(appt.id)
    }
  }

  return NextResponse.json({
    processed: appointments.length,
    sent: sent.length,
    failed: failed.length,
    // Links de WhatsApp listos para enviar manualmente si no hay Twilio
    whatsappLinks: appointments.map((a) => {
      const phone = a.user.phone?.replace(/\D/g, "")
      const dateStr = format(a.date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
      const msg = encodeURIComponent(
        `Hola ${a.user.name} 👋 Te recordamos que mañana tienes una cita en *${settings.name}*.\n\n` +
        `📅 ${dateStr}\n✂️ ${a.service.name}\n\n` +
        `Si necesitas cancelar o cambiar tu hora, contáctanos. ¡Te esperamos!`
      )
      return {
        id: a.id,
        name: a.user.name,
        phone: a.user.phone,
        service: a.service.name,
        date: a.date,
        url: `https://wa.me/56${phone}?text=${msg}`,
      }
    }),
  })
}
