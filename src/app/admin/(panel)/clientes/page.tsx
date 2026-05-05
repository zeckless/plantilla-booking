import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Users, Phone, Mail, Calendar } from "lucide-react"

export default async function ClientesPage() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      appointments: {
        orderBy: { date: "desc" },
        include: { service: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Base de datos</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Clientes</h1>
        <p className="text-sm text-ink-secondary mt-1">
          {users.length} cliente{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
          <Users className="w-10 h-10 text-ink-muted mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm font-medium text-ink-primary">Sin clientes todavía</p>
          <p className="text-xs text-ink-secondary mt-1">Los clientes aparecen aquí al hacer su primera reserva</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_80px_120px] gap-4 px-6 py-3 border-b border-black/[0.06] text-[10px] font-semibold uppercase tracking-widest text-ink-muted">
            <span>Cliente</span>
            <span>Contacto</span>
            <span className="text-center">Citas</span>
            <span>Última visita</span>
          </div>

          <div className="divide-y divide-black/[0.04]">
            {users.map((user) => {
              const totalAppts = user.appointments.length
              const completed = user.appointments.filter((a) => a.status === "COMPLETED").length
              const lastAppt = user.appointments[0]

              return (
                <div key={user.id} className="grid grid-cols-[1fr_160px_80px_120px] gap-4 px-6 py-4 items-center hover:bg-black/[0.01] transition-colors">
                  {/* Nombre */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-primary truncate">
                      {user.name}{user.lastName ? ` ${user.lastName}` : ""}
                    </p>
                    {user.rut && <p className="text-xs text-ink-muted">{user.rut}</p>}
                    {lastAppt && (
                      <p className="text-xs text-ink-secondary mt-0.5 truncate">{lastAppt.service.name}</p>
                    )}
                  </div>

                  {/* Contacto */}
                  <div className="space-y-1 min-w-0">
                    {user.phone && (
                      <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary truncate">
                        <Phone className="w-3 h-3 shrink-0" />
                        {user.phone}
                      </a>
                    )}
                    {user.email && !user.email.includes("@sin-email.local") && (
                      <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Citas */}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-ink-primary">{totalAppts}</p>
                    {completed > 0 && (
                      <p className="text-[10px] text-emerald-600">{completed} completada{completed !== 1 ? "s" : ""}</p>
                    )}
                  </div>

                  {/* Última visita */}
                  <div>
                    {lastAppt ? (
                      <>
                        <p className="text-xs text-ink-primary capitalize">
                          {format(new Date(lastAppt.date), "d MMM yyyy", { locale: es })}
                        </p>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          lastAppt.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
                          lastAppt.status === "CONFIRMED" ? "bg-blue-50 text-blue-700" :
                          lastAppt.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {lastAppt.status === "COMPLETED" ? "Completada" :
                           lastAppt.status === "CONFIRMED" ? "Confirmada" :
                           lastAppt.status === "CANCELLED" ? "Cancelada" : "Pendiente"}
                        </span>
                      </>
                    ) : (
                      <p className="text-xs text-ink-muted">—</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
