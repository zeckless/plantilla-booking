"use client"

import { useEffect, useState } from "react"
import { format, addDays, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react"
import { formatCLP } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Appointment {
  id: string
  date: string
  status: string
  paymentStatus: string
  notes: string | null
  user: { name: string; lastName: string | null; rut: string | null; email: string; phone: string | null }
  service: { name: string; duration: number; price: number; deposit: number }
}

interface Slot {
  id: string
  datetime: string
  isBooked: boolean
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8–21

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
}

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  COMPLETED: "bg-blue-50 text-blue-700 border border-blue-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
  NO_SHOW: "bg-orange-50 text-orange-700 border border-orange-200",
}

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-emerald-400",
  COMPLETED: "bg-blue-400",
  CANCELLED: "bg-red-400",
  NO_SHOW: "bg-orange-400",
}

function ActionButtons({
  status,
  onUpdate,
  loading,
}: {
  status: string
  onUpdate: (s: string) => void
  loading: boolean
}) {
  if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) return null

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {status === "PENDING" && (
        <button
          onClick={() => onUpdate("CONFIRMED")}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          Confirmar
        </button>
      )}
      {status === "CONFIRMED" && (
        <>
          <button
            onClick={() => onUpdate("COMPLETED")}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Completar
          </button>
          <button
            onClick={() => onUpdate("NO_SHOW")}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            No asistió
          </button>
        </>
      )}
      <button
        onClick={() => onUpdate("CANCELLED")}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  )
}

export default function AgendaClient() {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const load = async (target: Date) => {
    setLoading(true)
    try {
      const dayStart = new Date(target)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const [apptRes, slotRes] = await Promise.all([
        fetch(`/api/appointments?date=${target.toISOString()}`),
        fetch(`/api/slots?start=${dayStart.toISOString()}&end=${dayEnd.toISOString()}`),
      ])
      const [apptData, slotData] = await Promise.all([apptRes.json(), slotRes.json()])
      setAppointments(apptData.appointments ?? [])
      setSlots(slotData.slots ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(date)
  }, [date])

  const updateStatus = async (id: string, status: string) => {
    setUpdating((prev) => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        const data = await res.json()
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: data.appointment.status } : a))
        )
      }
    } finally {
      setUpdating((prev) => {
        const s = new Set(prev)
        s.delete(id)
        return s
      })
    }
  }

  const getAppointmentForHour = (hour: number): Appointment | undefined =>
    appointments.find((a) => new Date(a.date).getHours() === hour)

  const getSlotForHour = (hour: number): Slot | undefined =>
    slots.find((s) => new Date(s.datetime).getHours() === hour)

  const activeHours = HOURS.filter((h) => getAppointmentForHour(h) || getSlotForHour(h))
  const hasActivity = activeHours.length > 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = date.getTime() === today.getTime()

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Agenda</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Citas del día</h1>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-2xl border border-black/[0.06] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setDate((d) => subDays(d, 1))}
          className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-ink-primary" />
        </button>

        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-ink-primary capitalize">
            {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
          </p>
          {!isToday && (
            <button
              onClick={() => {
                const d = new Date()
                d.setHours(0, 0, 0, 0)
                setDate(d)
              }}
              className="text-xs font-semibold uppercase tracking-widest text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Hoy
            </button>
          )}
        </div>

        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-ink-primary" />
        </button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-ink-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      ) : !hasActivity ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] px-6 py-16 text-center">
          <CalendarDays className="w-8 h-8 text-ink-muted mx-auto mb-3" strokeWidth={1} />
          <p className="text-sm font-medium text-ink-primary">Sin actividad para este día</p>
          <p className="text-xs text-ink-secondary mt-1">
            No hay citas ni horarios liberados.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="divide-y divide-black/[0.04]">
            {HOURS.map((hour) => {
              const appt = getAppointmentForHour(hour)
              const slot = getSlotForHour(hour)
              const timeLabel = `${String(hour).padStart(2, "0")}:00`

              if (!appt && !slot) return null

              return (
                <div key={hour} className="flex gap-0">
                  {/* Time column */}
                  <div className="w-16 shrink-0 px-4 py-4 flex items-start pt-4">
                    <span className="text-xs font-mono text-ink-muted">{timeLabel}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-3 pr-4">
                    {appt ? (
                      <AppointmentCard
                        appt={appt}
                        onUpdate={(s) => updateStatus(appt.id, s)}
                        loading={updating.has(appt.id)}
                      />
                    ) : slot && !slot.isBooked ? (
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-xs font-medium text-emerald-700">Disponible</span>
                      </div>
                    ) : null}
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

function AppointmentCard({
  appt,
  onUpdate,
  loading,
}: {
  appt: Appointment
  onUpdate: (s: string) => void
  loading: boolean
}) {
  const fullName = `${appt.user.name}${appt.user.lastName ? ` ${appt.user.lastName}` : ""}`
  const saldo = appt.service.price - appt.service.deposit

  return (
    <div
      className={cn(
        "rounded-xl p-4 border",
        appt.status === "CANCELLED" || appt.status === "NO_SHOW"
          ? "bg-black/[0.02] border-black/[0.05] opacity-60"
          : "bg-white border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-ink-primary">{fullName}</p>
            {appt.user.rut && (
              <span className="text-[10px] font-mono text-ink-muted bg-black/[0.04] px-1.5 py-0.5 rounded">
                {appt.user.rut}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-ink-secondary">{appt.service.name}</span>
            <span className="text-ink-muted text-xs">·</span>
            <span className="text-xs text-ink-muted">{appt.service.duration} min</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[appt.status] ?? "bg-black/20"}`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLE[appt.status] ?? ""}`}>
            {STATUS_LABEL[appt.status] ?? appt.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-3">
        <a
          href={`mailto:${appt.user.email}`}
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <Mail className="w-3 h-3" />
          {appt.user.email}
        </a>
        {appt.user.phone && (
          <a
            href={`tel:${appt.user.phone}`}
            className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors"
          >
            <Phone className="w-3 h-3" />
            {appt.user.phone}
          </a>
        )}
        <span className="text-xs text-ink-secondary">
          Abono {formatCLP(appt.service.deposit)}
          {saldo > 0 && <> · Saldo {formatCLP(saldo)}</>}
        </span>
      </div>

      {appt.notes && (
        <p className="mt-2 text-xs text-ink-secondary italic">{appt.notes}</p>
      )}

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-ink-secondary">
          <Loader2 className="w-3 h-3 animate-spin" />
          Actualizando...
        </div>
      ) : (
        <ActionButtons status={appt.status} onUpdate={onUpdate} loading={loading} />
      )}
    </div>
  )
}
