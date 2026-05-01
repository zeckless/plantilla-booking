import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarPlus, ArrowRight, CheckCircle2, Clock3, TrendingUp, CalendarDays } from "lucide-react"
import { formatCLP } from "@/lib/utils"

const statusLabel: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
}

const statusDot: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-400",
  COMPLETED: "bg-blue-400",
  CANCELLED: "bg-red-400",
  NO_SHOW: "bg-orange-400",
}

export default async function AdminDashboardPage() {
  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart); todayEnd.setDate(todayEnd.getDate() + 1)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  weekEnd.setHours(23, 59, 59, 999)

  const [todayAppts, weekAppts, pending, revenueAppts, freeSlotsToday] = await Promise.all([
    prisma.appointment.findMany({
      where: { date: { gte: todayStart, lt: todayEnd }, status: { notIn: ["CANCELLED"] } },
      include: { user: true, service: true },
      orderBy: { date: "asc" },
    }),
    prisma.appointment.count({
      where: { date: { gte: weekStart, lte: weekEnd }, status: { notIn: ["CANCELLED"] } },
    }),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.findMany({
      where: { paymentStatus: { in: ["DEPOSIT_PAID", "FULLY_PAID"] } },
      include: { service: { select: { deposit: true } } },
    }),
    prisma.timeSlot.count({
      where: { datetime: { gte: now, lt: todayEnd }, isBooked: false },
    }),
  ])

  const totalRevenue = revenueAppts.reduce((acc, a) => acc + (a.service?.deposit ?? 0), 0)

  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 20 ? "Buenas tardes" : "Buenas noches"

  return (
    <div className="space-y-8 animate-reveal">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">{greeting}</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Dashboard</h1>
        <p className="text-sm text-ink-secondary mt-1 capitalize">
          {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Citas hoy", value: todayAppts.length, sub: freeSlotsToday > 0 ? `${freeSlotsToday} horario${freeSlotsToday !== 1 ? "s" : ""} libre${freeSlotsToday !== 1 ? "s" : ""}` : "Sin horarios libres", icon: CalendarDays, accent: "text-primary" },
          { label: "Esta semana", value: weekAppts, sub: "citas confirmadas", icon: TrendingUp, accent: "text-emerald-600" },
          { label: "Pendientes", value: pending, sub: "sin confirmar", icon: Clock3, accent: "text-amber-600" },
          { label: "Ingresos totales", value: formatCLP(totalRevenue), sub: "por abonos recibidos", icon: CheckCircle2, accent: "text-blue-600" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-black/[0.06] p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">{s.label}</p>
                <Icon className={`w-4 h-4 ${s.accent}`} strokeWidth={1.5} />
              </div>
              <p className="text-2xl font-semibold text-ink-primary">{s.value}</p>
              <p className="text-xs text-ink-secondary mt-1">{s.sub}</p>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.06]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-0.5">Hoy</p>
              <h2 className="text-base font-semibold text-ink-primary">
                {format(now, "EEEE d 'de' MMMM", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
              </h2>
            </div>
            <Link
              href="/admin/agenda"
              className="flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Ver agenda <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppts.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <CalendarDays className="w-8 h-8 text-ink-muted mx-auto mb-3" strokeWidth={1} />
              <p className="text-sm font-medium text-ink-primary">Sin citas para hoy</p>
              <p className="text-xs text-ink-secondary mt-1">
                {freeSlotsToday > 0
                  ? `Hay ${freeSlotsToday} horario${freeSlotsToday !== 1 ? "s" : ""} disponible${freeSlotsToday !== 1 ? "s" : ""}`
                  : "No hay horarios liberados"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.04]">
              {todayAppts.map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-6 py-4 hover:bg-black/[0.01] transition-colors">
                  <div className="w-14 shrink-0">
                    <p className="text-sm font-semibold text-ink-primary font-mono">{format(a.date, "HH:mm")}</p>
                    <p className="text-[10px] text-ink-muted">{a.service.duration}min</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">
                      {a.user.name}{a.user.lastName ? ` ${a.user.lastName}` : ""}
                    </p>
                    <p className="text-xs text-ink-secondary truncate">{a.service.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${statusDot[a.status] ?? "bg-black/20"}`} />
                    <p className="text-xs text-ink-secondary">{statusLabel[a.status] ?? a.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-4">Acciones rápidas</p>
            <div className="space-y-2">
              <Link
                href="/admin/slots"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.03] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                  <CalendarPlus className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-primary">Liberar horarios</p>
                  <p className="text-xs text-ink-secondary">Gestionar disponibilidad</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link
                href="/admin/agenda"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.03] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-primary">Ver agenda</p>
                  <p className="text-xs text-ink-secondary">Citas del día</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ink-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>

          {/* Upcoming days */}
          <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-4">Próximos días</p>
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => addDays(todayStart, i + 1)).map((day) => (
                <Link
                  key={day.toISOString()}
                  href={`/admin/agenda?date=${day.toISOString()}`}
                  className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-black/[0.03] transition-colors"
                >
                  <p className="text-sm text-ink-primary capitalize">
                    {format(day, "EEE d MMM", { locale: es })}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
