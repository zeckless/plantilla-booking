import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { formatCLP } from "@/lib/utils"

export default async function AdminDashboardPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const [todayAppointments, pending, totalRevenueAgg, totalConfirmed] =
    await Promise.all([
      prisma.appointment.findMany({
        where: { date: { gte: todayStart, lt: todayEnd } },
        include: { user: true, service: true },
        orderBy: { date: "asc" },
      }),
      prisma.appointment.count({
        where: { status: "PENDING" },
      }),
      prisma.appointment.findMany({
        where: { paymentStatus: { in: ["DEPOSIT_PAID", "FULLY_PAID"] } },
        include: { service: { select: { deposit: true } } },
      }),
      prisma.appointment.count({
        where: { status: "CONFIRMED" },
      }),
    ])

  const totalRevenue = totalRevenueAgg.reduce(
    (acc, a) => acc + (a.service?.deposit || 0),
    0
  )

  const stats = [
    {
      label: "Hoy",
      value: todayAppointments.length.toString(),
      sublabel: "citas agendadas",
      icon: Calendar,
    },
    {
      label: "Confirmadas",
      value: totalConfirmed.toString(),
      sublabel: "en total",
      icon: CheckCircle2,
    },
    {
      label: "Pendientes",
      value: pending.toString(),
      sublabel: "sin confirmar",
      icon: Clock,
    },
    {
      label: "Ingresos",
      value: formatCLP(totalRevenue),
      sublabel: "por abonos",
      icon: TrendingUp,
    },
  ]

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    NO_SHOW: "No asistio",
  }

  return (
    <div className="space-y-12 animate-reveal">
      <div>
        <p className="eyebrow w-max mb-4">Resumen</p>
        <h1 className="font-serif text-4xl tracking-tight text-ink-primary">
          Dashboard
        </h1>
        <p className="text-ink-secondary mt-2 capitalize">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bezel-outer">
              <div className="bezel-inner p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-ink-secondary font-medium">
                    {stat.label}
                  </p>
                  <Icon
                    className="w-5 h-5 text-ink-secondary"
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="font-serif text-3xl text-ink-primary">
                    {stat.value}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1">
                    {stat.sublabel}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bezel-outer">
        <div className="bezel-inner p-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow w-max mb-3">Hoy</p>
              <h2 className="font-serif text-2xl text-ink-primary">
                Citas del dia
              </h2>
            </div>
            <Link
              href="/admin/agenda"
              className="text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors flex items-center gap-2"
            >
              Ver agenda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <p className="text-sm text-ink-secondary py-8 text-center">
              No hay citas agendadas para hoy.
            </p>
          ) : (
            <div className="space-y-2">
              {todayAppointments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-6 p-4 rounded-xl border border-black/5 bg-surface-inner"
                >
                  <div className="font-mono text-lg text-ink-primary w-16">
                    {format(a.date, "HH:mm")}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-ink-primary">
                      {a.user.name}{a.user.lastName ? ` ${a.user.lastName}` : ""}
                    </p>
                    <p className="text-sm text-ink-secondary">
                      {a.service.name} · {a.service.duration} min
                    </p>
                  </div>
                  <span
                    className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full font-medium ${
                      a.status === "CONFIRMED"
                        ? "bg-accent-sage/40 text-ink-primary"
                        : a.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-900"
                        : a.status === "CANCELLED"
                        ? "bg-red-100 text-red-900"
                        : "bg-black/5 text-ink-secondary"
                    }`}
                  >
                    {statusLabels[a.status] || a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
