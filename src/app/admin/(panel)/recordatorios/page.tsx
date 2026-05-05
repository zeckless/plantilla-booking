import { prisma } from "@/lib/prisma"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { getBusinessSettings } from "@/lib/business-settings"
import RecordatoriosClient from "@/components/admin/RecordatoriosClient"

export default async function RecordatoriosPage() {
  const now = new Date()
  const tomorrowStart = addDays(new Date(now.setHours(0,0,0,0)), 1)
  const tomorrowEnd = addDays(tomorrowStart, 1)

  const [appointments, settings] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        date: { gte: tomorrowStart, lt: tomorrowEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: {
        user: { select: { name: true, phone: true } },
        service: { select: { name: true } },
      },
      orderBy: { date: "asc" },
    }),
    getBusinessSettings(),
  ])

  const reminders = appointments.map((a) => {
    const phone = a.user.phone?.replace(/\D/g, "") ?? ""
    const dateStr = format(a.date, "EEEE d 'de' MMMM 'a las' HH:mm", { locale: es })
    const msg = encodeURIComponent(
      `Hola ${a.user.name} 👋 Te recordamos que mañana tienes una cita en *${settings.name}*.\n\n` +
      `📅 ${dateStr}\n✂️ ${a.service.name}\n\n` +
      `Si necesitas cancelar o cambiar tu hora, contáctanos. ¡Te esperamos!`
    )
    return {
      id: a.id,
      name: a.user.name,
      phone: a.user.phone ?? null,
      service: a.service.name,
      date: a.date.toISOString(),
      reminderSent: a.reminderSent,
      whatsappUrl: phone ? `https://wa.me/56${phone}?text=${msg}` : null,
    }
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Agenda</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Recordatorios</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Citas de mañana — envía un recordatorio por WhatsApp a cada cliente.
        </p>
      </div>
      <RecordatoriosClient reminders={reminders} />
    </div>
  )
}
