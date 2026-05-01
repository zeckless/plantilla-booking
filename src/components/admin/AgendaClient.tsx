"use client"

import { useEffect, useState, useTransition } from "react"
import { format, addDays, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  Mail,
  Phone,
} from "lucide-react"
import { formatCLP } from "@/lib/utils"

interface Appointment {
  id: string
  date: string
  status: string
  paymentStatus: string
  notes: string | null
  user: { name: string; lastName: string | null; rut: string | null; email: string; phone: string | null }
  service: { name: string; duration: number; price: number; deposit: number }
}

const statusOptions = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "COMPLETED", label: "Completada" },
  { value: "CANCELLED", label: "Cancelada" },
  { value: "NO_SHOW", label: "No asistio" },
]

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-accent-sage/40 text-ink-primary"
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-900"
    case "PENDING":
      return "bg-yellow-100 text-yellow-900"
    case "CANCELLED":
      return "bg-red-100 text-red-900"
    case "NO_SHOW":
      return "bg-orange-100 text-orange-900"
    default:
      return "bg-black/5 text-ink-secondary"
  }
}

export default function AgendaClient() {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  const load = async (target: Date) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/appointments?date=${target.toISOString()}`
      )
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(date)
  }, [date])

  const updateStatus = async (id: string, status: string) => {
    startTransition(async () => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: data.appointment.status } : a
          )
        )
      }
    })
  }

  return (
    <div className="space-y-8 animate-reveal">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow w-max mb-4">Agenda</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink-primary">
            Citas
          </h1>
        </div>
      </div>

      <div className="bezel-outer">
        <div className="bezel-inner p-6 flex items-center justify-between">
          <button
            onClick={() => setDate((d) => subDays(d, 1))}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ink-primary" />
          </button>

          <div className="flex items-center gap-3 text-ink-primary">
            <CalendarIcon className="w-5 h-5" strokeWidth={1.5} />
            <p className="font-serif text-xl capitalize">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            <button
              onClick={() => {
                const d = new Date()
                d.setHours(0, 0, 0, 0)
                setDate(d)
              }}
              className="ml-4 text-xs uppercase tracking-widest font-medium text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Hoy
            </button>
          </div>

          <button
            onClick={() => setDate((d) => addDays(d, 1))}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-ink-primary" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-ink-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bezel-outer">
          <div className="bezel-inner p-12 text-center">
            <p className="text-ink-secondary">
              No hay citas agendadas para este dia.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="bezel-outer">
              <div className="bezel-inner p-6 grid gap-6 md:grid-cols-[120px_1fr_auto] items-start md:items-center">
                <div>
                  <p className="font-mono text-2xl text-ink-primary">
                    {format(new Date(a.date), "HH:mm")}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1">
                    {a.service.duration} min
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-ink-primary">
                      {a.user.name}{a.user.lastName ? ` ${a.user.lastName}` : ""}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <p className="text-sm text-ink-secondary">{a.service.name}</p>
                      {a.user.rut && (
                        <span className="text-xs text-ink-muted bg-black/5 px-2 py-0.5 rounded-full font-mono">
                          RUT {a.user.rut}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-secondary">
                    <a
                      href={`mailto:${a.user.email}`}
                      className="flex items-center gap-1.5 hover:text-ink-primary"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {a.user.email}
                    </a>
                    {a.user.phone && (
                      <a
                        href={`tel:${a.user.phone}`}
                        className="flex items-center gap-1.5 hover:text-ink-primary"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {a.user.phone}
                      </a>
                    )}
                    <span>Abono: {formatCLP(a.service.deposit)}</span>
                    <span>Saldo: {formatCLP(a.service.price - a.service.deposit)}</span>
                  </div>
                  {a.notes && (
                    <p className="text-xs text-ink-secondary italic">
                      Nota: {a.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span
                    className={`text-xs uppercase tracking-widest px-3 py-1 rounded-full font-medium ${statusBadgeClass(a.status)}`}
                  >
                    {statusOptions.find((s) => s.value === a.status)?.label ||
                      a.status}
                  </span>
                  <select
                    value={a.status}
                    onChange={(e) => updateStatus(a.id, e.target.value)}
                    className="bg-white/50 border border-black/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        Cambiar a: {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
