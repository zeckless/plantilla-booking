import { prisma } from "@/lib/prisma"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"
import { formatCLP } from "@/lib/utils"
import { TrendingUp, Calendar, CheckCircle2, XCircle, AlertCircle, DollarSign } from "lucide-react"

function Bar({ value, max, color = "bg-ink-primary" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-2 bg-black/[0.05] rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default async function ReportesPage() {
  const now = new Date()

  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 })
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const thisMonthStart = startOfMonth(now)
  const thisMonthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))
  const threeMonthsAgo = startOfMonth(subMonths(now, 2))

  const [allTime, thisWeek, thisMonth, lastMonth, threeMonths, byService, dailyThisMonth] = await Promise.all([
    // Totales globales
    prisma.appointment.groupBy({ by: ["status"], _count: true }),
    // Esta semana
    prisma.appointment.findMany({
      where: { date: { gte: thisWeekStart, lte: thisWeekEnd }, status: { notIn: ["CANCELLED"] } },
      include: { service: { select: { deposit: true } } },
    }),
    // Este mes
    prisma.appointment.findMany({
      where: { date: { gte: thisMonthStart, lte: thisMonthEnd }, status: { notIn: ["CANCELLED"] } },
      include: { service: { select: { deposit: true } } },
    }),
    // Mes pasado
    prisma.appointment.findMany({
      where: { date: { gte: lastMonthStart, lte: lastMonthEnd }, status: { notIn: ["CANCELLED"] } },
      include: { service: { select: { deposit: true } } },
    }),
    // Últimos 3 meses
    prisma.appointment.findMany({
      where: { date: { gte: threeMonthsAgo, lte: thisMonthEnd }, status: { notIn: ["CANCELLED"] } },
      include: { service: { select: { deposit: true } } },
    }),
    // Por servicio (todos los tiempos)
    prisma.appointment.groupBy({
      by: ["serviceId"],
      where: { status: { notIn: ["CANCELLED"] } },
      _count: true,
      orderBy: { _count: { serviceId: "desc" } },
      take: 5,
    }),
    // Por día este mes
    prisma.appointment.findMany({
      where: { date: { gte: thisMonthStart, lte: thisMonthEnd }, status: { notIn: ["CANCELLED"] } },
      select: { date: true },
    }),
  ])

  // Totales globales
  const totalAll = allTime.reduce((acc, g) => acc + g._count, 0)
  const completedAll = allTime.find((g) => g.status === "COMPLETED")?._count ?? 0
  const cancelledAll = allTime.find((g) => g.status === "CANCELLED")?._count ?? 0
  const noShowAll = allTime.find((g) => g.status === "NO_SHOW")?._count ?? 0

  const revenue = (appts: { service: { deposit: number } }[]) =>
    appts.reduce((acc, a) => acc + a.service.deposit, 0)

  // Servicios más pedidos con nombres
  const serviceIds = byService.map((s) => s.serviceId)
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } }, select: { id: true, name: true } })
  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s.name]))
  const maxServiceCount = byService[0]?._count ?? 1

  // Distribución por día del mes
  const days = eachDayOfInterval({ start: thisMonthStart, end: now })
  const dailyMap: Record<string, number> = {}
  for (const a of dailyThisMonth) {
    const key = format(a.date, "yyyy-MM-dd")
    dailyMap[key] = (dailyMap[key] ?? 0) + 1
  }
  const maxDaily = Math.max(...Object.values(dailyMap), 1)

  return (
    <div className="space-y-8 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Análisis</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Reportes</h1>
        <p className="text-sm text-ink-secondary mt-1 capitalize">
          Actualizado al {format(now, "d 'de' MMMM yyyy", { locale: es })}
        </p>
      </div>

      {/* Resumen del período */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-3">Comparativa de ingresos</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Esta semana", appts: thisWeek, color: "text-primary" },
            { label: "Este mes", appts: thisMonth, color: "text-emerald-600" },
            { label: "Mes anterior", appts: lastMonth, color: "text-ink-secondary" },
          ].map(({ label, appts, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-black/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-2">{label}</p>
              <p className={`text-2xl font-semibold ${color}`}>{formatCLP(revenue(appts))}</p>
              <p className="text-xs text-ink-secondary mt-1">{appts.length} cita{appts.length !== 1 ? "s" : ""}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Estados globales */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-5">
            Historial total · {totalAll} citas
          </p>
          <div className="space-y-4">
            {[
              { label: "Completadas", value: completedAll, icon: CheckCircle2, color: "text-emerald-600", bar: "bg-emerald-500" },
              { label: "Canceladas", value: cancelledAll, icon: XCircle, color: "text-red-500", bar: "bg-red-400" },
              { label: "No asistió", value: noShowAll, icon: AlertCircle, color: "text-orange-500", bar: "bg-orange-400" },
            ].map(({ label, value, icon: Icon, color, bar }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
                    <span className="text-sm text-ink-primary">{label}</span>
                  </div>
                  <span className="text-sm font-semibold text-ink-primary">{value}</span>
                </div>
                <Bar value={value} max={totalAll} color={bar} />
              </div>
            ))}
          </div>
        </div>

        {/* Servicios más pedidos */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-5">
            Servicios más pedidos
          </p>
          {byService.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-8">Sin datos todavía</p>
          ) : (
            <div className="space-y-4">
              {byService.map((s) => (
                <div key={s.serviceId}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-ink-primary truncate">{serviceMap[s.serviceId] ?? "Servicio"}</span>
                    <span className="text-sm font-semibold text-ink-primary ml-3 shrink-0">{s._count}</span>
                  </div>
                  <Bar value={s._count} max={maxServiceCount} color="bg-primary" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actividad diaria este mes */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-5">
          Actividad diaria — {format(now, "MMMM yyyy", { locale: es })}
        </p>
        <div className="flex items-end gap-1 h-24">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const count = dailyMap[key] ?? 0
            const pct = maxDaily > 0 ? (count / maxDaily) * 100 : 0
            const isToday = key === format(now, "yyyy-MM-dd")
            return (
              <div key={key} className="flex-1 flex flex-col items-center gap-1 group relative" title={`${format(day, "d MMM", { locale: es })}: ${count} cita${count !== 1 ? "s" : ""}`}>
                <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isToday ? "bg-primary" : count > 0 ? "bg-ink-primary/30" : "bg-black/[0.05]"}`}
                    style={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
                  />
                </div>
                {day.getDate() % 5 === 0 || day.getDate() === 1 ? (
                  <span className="text-[8px] text-ink-muted">{day.getDate()}</span>
                ) : <span className="text-[8px] text-transparent">·</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen financiero 3 meses */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Ingresos últimos 3 meses
          </p>
        </div>
        <p className="text-3xl font-semibold text-ink-primary">{formatCLP(revenue(threeMonths))}</p>
        <p className="text-xs text-ink-secondary mt-1">
          {threeMonths.length} citas · promedio {formatCLP(threeMonths.length > 0 ? Math.round(revenue(threeMonths) / threeMonths.length) : 0)} por cita
        </p>
        <div className="mt-4 pt-4 border-t border-black/[0.06]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span className="text-xs text-ink-secondary">
              {revenue(thisMonth) >= revenue(lastMonth)
                ? `Este mes supera al anterior en ${formatCLP(revenue(thisMonth) - revenue(lastMonth))}`
                : `Este mes está ${formatCLP(revenue(lastMonth) - revenue(thisMonth))} por debajo del anterior`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
