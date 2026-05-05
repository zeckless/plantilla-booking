import { prisma } from "@/lib/prisma"
import ConsultasClient from "@/components/admin/ConsultasClient"

export default async function ConsultasPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  const unread = messages.filter((m) => !m.read).length

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Mensajes</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Consultas</h1>
        <p className="text-sm text-ink-secondary mt-1">
          {unread > 0 ? `${unread} mensaje${unread > 1 ? "s" : ""} sin leer` : "Todo al día"}
        </p>
      </div>
      <ConsultasClient initialMessages={messages} />
    </div>
  )
}
