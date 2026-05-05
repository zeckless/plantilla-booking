"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  format, addDays, subDays,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  eachDayOfInterval,
  isSameMonth, isSameDay,
  addMonths, subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft, ChevronRight, Loader2,
  Mail, Phone, CalendarDays, X, MessageCircle,
  LayoutGrid, AlignJustify, Plus,
} from "lucide-react"
import Link from "next/link"
import { formatCLP } from "@/lib/utils"
import { cn } from "@/lib/utils"

type View = "monthly" | "daily"

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

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8)
const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

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

const STATUS_PILL: Record<string, string> = {
  PENDING: "bg-amber-50 border-l-amber-400 text-amber-800",
  CONFIRMED: "bg-emerald-50 border-l-emerald-400 text-emerald-800",
  COMPLETED: "bg-blue-50 border-l-blue-400 text-blue-800",
  CANCELLED: "bg-red-50 border-l-red-300 text-red-700 opacity-60",
  NO_SHOW: "bg-orange-50 border-l-orange-400 text-orange-800 opacity-60",
}

// ─── Action Buttons ──────────────────────────────────────────────────────────

function ActionButtons({
  status, onUpdate, loading,
}: {
  status: string; onUpdate: (s: string) => void; loading: boolean
}) {
  if (["COMPLETED", "CANCELLED", "NO_SHOW"].includes(status)) return null
  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-black/[0.06]">
      {status === "PENDING" && (
        <button onClick={() => onUpdate("CONFIRMED")} disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50">
          Confirmar
        </button>
      )}
      {status === "CONFIRMED" && (
        <>
          <button onClick={() => onUpdate("COMPLETED")} disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50">
            Completar
          </button>
          <button onClick={() => onUpdate("NO_SHOW")} disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50">
            No asistió
          </button>
        </>
      )}
      <button onClick={() => onUpdate("CANCELLED")} disabled={loading}
        className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
        Cancelar
      </button>
    </div>
  )
}

// ─── Appointment Modal ────────────────────────────────────────────────────────

function AppointmentModal({
  appt, onClose, onUpdate, updating,
}: {
  appt: Appointment
  onClose: () => void
  onUpdate: (id: string, status: string) => Promise<void>
  updating: boolean
}) {
  const fullName = `${appt.user.name}${appt.user.lastName ? ` ${appt.user.lastName}` : ""}`
  const saldo = appt.service.price - appt.service.deposit
  const apptDate = new Date(appt.date)
  const apptEnd = new Date(apptDate.getTime() + appt.service.duration * 60000)

  const waNumber = appt.user.phone?.replace(/\D/g, "")
  const waLink = waNumber
    ? `https://wa.me/${waNumber.startsWith("56") ? waNumber : `56${waNumber}`}`
    : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-sm rounded-2xl border border-black/[0.08] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <div>
            <p className="text-sm font-semibold text-ink-primary">{fullName}</p>
            <p className="text-[10px] text-ink-muted mt-0.5">
              Cita #{appt.id.slice(-6).toUpperCase()}
            </p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors text-ink-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLE[appt.status] ?? ""}`}>
              {STATUS_LABEL[appt.status] ?? appt.status}
            </span>
            <span className="text-[10px] text-ink-muted">
              {appt.paymentStatus === "DEPOSIT_PAID" ? "Abono pagado" :
               appt.paymentStatus === "FULLY_PAID" ? "Pago total" : "Pendiente de pago"}
            </span>
          </div>

          {/* Details */}
          <div className="rounded-xl border border-black/[0.06] divide-y divide-black/[0.04] text-sm">
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-ink-secondary text-xs">Servicio</span>
              <span className="font-medium text-ink-primary">{appt.service.name}</span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-ink-secondary text-xs">Horario</span>
              <span className="font-medium text-ink-primary font-mono text-xs">
                {format(apptDate, "HH:mm")} – {format(apptEnd, "HH:mm")} · {appt.service.duration}min
              </span>
            </div>
            <div className="flex justify-between items-center px-3 py-2.5">
              <span className="text-ink-secondary text-xs">Abono</span>
              <span className="font-medium text-ink-primary">{formatCLP(appt.service.deposit)}</span>
            </div>
            {saldo > 0 && (
              <div className="flex justify-between items-center px-3 py-2.5">
                <span className="text-ink-secondary text-xs">Saldo en local</span>
                <span className="font-medium text-ink-primary">{formatCLP(saldo)}</span>
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <a href={`mailto:${appt.user.email}`}
              className="flex items-center gap-2.5 text-xs text-ink-secondary hover:text-ink-primary transition-colors">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {appt.user.email}
            </a>
            {appt.user.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 shrink-0 text-ink-secondary" />
                <span className="text-xs text-ink-secondary">{appt.user.phone}</span>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                )}
              </div>
            )}
            {appt.user.rut && (
              <p className="text-[10px] text-ink-muted font-mono">RUT {appt.user.rut}</p>
            )}
          </div>

          {appt.notes && (
            <p className="text-xs text-ink-secondary italic bg-black/[0.02] rounded-lg px-3 py-2">
              {appt.notes}
            </p>
          )}

          {updating ? (
            <div className="flex items-center gap-2 text-xs text-ink-secondary pt-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Actualizando...
            </div>
          ) : (
            <ActionButtons
              status={appt.status}
              onUpdate={(s) => onUpdate(appt.id, s)}
              loading={updating}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Monthly View ─────────────────────────────────────────────────────────────

function MonthView({
  currentMonth,
  appointments,
  today,
  onDayClick,
  onApptClick,
}: {
  currentMonth: Date
  appointments: Appointment[]
  today: Date
  onDayClick: (day: Date) => void
  onApptClick: (appt: Appointment, e: React.MouseEvent) => void
}) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  const getAppts = (day: Date) =>
    appointments.filter((a) => isSameDay(new Date(a.date), day))

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-black/[0.06]">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-2.5 text-center">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">{d}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isToday = isSameDay(day, today)
          const dayAppts = getAppts(day)
          const visible = dayAppts.slice(0, 3)
          const overflow = dayAppts.length - visible.length

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[90px] p-1.5 border-b border-r border-black/[0.04] cursor-pointer transition-colors",
                "hover:bg-black/[0.01]",
                !isCurrentMonth && "bg-black/[0.01]",
                idx % 7 === 6 && "border-r-0"
              )}
            >
              {/* Day number */}
              <div className="flex justify-end mb-1">
                <span className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isToday
                    ? "bg-ink-primary text-white"
                    : isCurrentMonth
                    ? "text-ink-primary"
                    : "text-ink-muted"
                )}>
                  {format(day, "d")}
                </span>
              </div>

              {/* Appointment pills */}
              <div className="space-y-0.5">
                {visible.map((a) => (
                  <button
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onApptClick(a, e) }}
                    className={cn(
                      "w-full text-left text-[10px] font-medium px-1.5 py-0.5 rounded border-l-2 truncate leading-4",
                      STATUS_PILL[a.status] ?? "bg-black/5 border-l-black/20 text-ink-secondary"
                    )}
                  >
                    {format(new Date(a.date), "HH:mm")} {a.user.name}
                  </button>
                ))}
                {overflow > 0 && (
                  <p className="text-[10px] text-ink-muted pl-1.5">+{overflow} más</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Daily Timeline View ──────────────────────────────────────────────────────

function DayView({
  appointments, slots, updating, onUpdate, onApptClick,
}: {
  appointments: Appointment[]
  slots: Slot[]
  updating: Set<string>
  onUpdate: (id: string, status: string) => Promise<void>
  onApptClick: (appt: Appointment, e: React.MouseEvent) => void
}) {
  const getApptForHour = (h: number) => appointments.find((a) => new Date(a.date).getHours() === h)
  const getSlotForHour = (h: number) => slots.find((s) => new Date(s.datetime).getHours() === h)
  const activeHours = HOURS.filter((h) => getApptForHour(h) || getSlotForHour(h))

  if (activeHours.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.06] px-6 py-16 text-center">
        <CalendarDays className="w-8 h-8 text-ink-muted mx-auto mb-3" strokeWidth={1} />
        <p className="text-sm font-medium text-ink-primary">Sin actividad para este día</p>
        <p className="text-xs text-ink-secondary mt-1">No hay citas ni horarios liberados.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
      <div className="divide-y divide-black/[0.04]">
        {HOURS.map((hour) => {
          const appt = getApptForHour(hour)
          const slot = getSlotForHour(hour)
          if (!appt && !slot) return null
          const timeLabel = `${String(hour).padStart(2, "0")}:00`

          return (
            <div key={hour} className="flex">
              <div className="w-16 shrink-0 px-4 py-4 flex items-start">
                <span className="text-xs font-mono text-ink-muted">{timeLabel}</span>
              </div>
              <div className="flex-1 py-3 pr-4">
                {appt ? (
                  <button
                    onClick={(e) => onApptClick(appt, e)}
                    className={cn(
                      "w-full text-left rounded-xl p-3.5 border transition-colors hover:border-black/10",
                      appt.status === "CANCELLED" || appt.status === "NO_SHOW"
                        ? "bg-black/[0.02] border-black/[0.05] opacity-60"
                        : "bg-white border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-primary truncate">
                          {appt.user.name}{appt.user.lastName ? ` ${appt.user.lastName}` : ""}
                        </p>
                        <p className="text-xs text-ink-secondary mt-0.5">
                          {appt.service.name} · {appt.service.duration} min
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[appt.status] ?? "bg-black/20"}`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLE[appt.status] ?? ""}`}>
                          {STATUS_LABEL[appt.status] ?? appt.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-ink-muted mt-1.5">Toca para ver detalles →</p>
                  </button>
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
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AgendaClient() {
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const [view, setView] = useState<View>("monthly")
  const [selectedDay, setSelectedDay] = useState<Date>(today)
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(today))

  const [monthAppts, setMonthAppts] = useState<Appointment[]>([])
  const [dayAppts, setDayAppts] = useState<Appointment[]>([])
  const [daySlots, setDaySlots] = useState<Slot[]>([])

  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingDay, setLoadingDay] = useState(false)
  const [updating, setUpdating] = useState<Set<string>>(new Set())
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null)

  // Load month appointments
  const loadMonth = useCallback(async (month: Date) => {
    setLoadingMonth(true)
    try {
      const res = await fetch(`/api/appointments?date=${startOfMonth(month).toISOString()}&range=month`)
      const data = await res.json()
      setMonthAppts(data.appointments ?? [])
    } finally {
      setLoadingMonth(false)
    }
  }, [])

  // Load day appointments + slots
  const loadDay = useCallback(async (day: Date) => {
    setLoadingDay(true)
    try {
      const dayEnd = new Date(day); dayEnd.setDate(dayEnd.getDate() + 1)
      const [apptRes, slotRes] = await Promise.all([
        fetch(`/api/appointments?date=${day.toISOString()}`),
        fetch(`/api/slots?start=${day.toISOString()}&end=${dayEnd.toISOString()}`),
      ])
      const [apptData, slotData] = await Promise.all([apptRes.json(), slotRes.json()])
      setDayAppts(apptData.appointments ?? [])
      setDaySlots(slotData.slots ?? [])
    } finally {
      setLoadingDay(false)
    }
  }, [])

  useEffect(() => { loadMonth(currentMonth) }, [currentMonth, loadMonth])
  useEffect(() => { if (view === "daily") loadDay(selectedDay) }, [selectedDay, view, loadDay])

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
        const updated = (a: Appointment) => a.id === id ? { ...a, status: data.appointment.status } : a
        setMonthAppts((prev) => prev.map(updated))
        setDayAppts((prev) => prev.map(updated))
        setSelectedAppt((prev) => prev?.id === id ? { ...prev, status: data.appointment.status } : prev)
      }
    } finally {
      setUpdating((prev) => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  const handleDayClick = (day: Date) => {
    setSelectedDay(day)
    setView("daily")
  }

  const handleApptClick = (appt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAppt(appt)
  }

  const isToday = isSameDay(selectedDay, today)

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Agenda</p>
          <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
            {view === "monthly" ? "Vista mensual" : "Citas del día"}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/admin/agenda/nueva"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ink-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-3.5 h-3.5" />
            Nueva cita
          </Link>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-black/[0.04] rounded-xl p-1">
          <button
            onClick={() => setView("monthly")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              view === "monthly"
                ? "bg-white text-ink-primary shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Mes
          </button>
          <button
            onClick={() => setView("daily")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
              view === "daily"
                ? "bg-white text-ink-primary shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            )}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            Día
          </button>
          </div>
        </div>
      </div>

      {/* Navigator */}
      {view === "monthly" ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors">
            <ChevronLeft className="w-4 h-4 text-ink-primary" />
          </button>
          <div className="flex items-center gap-3">
            {loadingMonth && <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-secondary" />}
            <p className="text-sm font-semibold text-ink-primary capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </p>
            {!isSameDay(startOfMonth(currentMonth), startOfMonth(today)) && (
              <button onClick={() => setCurrentMonth(startOfMonth(today))}
                className="text-xs font-semibold uppercase tracking-widest text-ink-secondary hover:text-ink-primary transition-colors">
                Hoy
              </button>
            )}
          </div>
          <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors">
            <ChevronRight className="w-4 h-4 text-ink-primary" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSelectedDay((d) => subDays(d, 1))}
            className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors">
            <ChevronLeft className="w-4 h-4 text-ink-primary" />
          </button>
          <div className="flex items-center gap-3">
            {loadingDay && <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-secondary" />}
            <p className="text-sm font-semibold text-ink-primary capitalize">
              {format(selectedDay, "EEEE d 'de' MMMM, yyyy", { locale: es })}
            </p>
            {!isToday && (
              <button onClick={() => setSelectedDay(today)}
                className="text-xs font-semibold uppercase tracking-widest text-ink-secondary hover:text-ink-primary transition-colors">
                Hoy
              </button>
            )}
          </div>
          <button onClick={() => setSelectedDay((d) => addDays(d, 1))}
            className="p-2 rounded-xl hover:bg-black/[0.04] transition-colors">
            <ChevronRight className="w-4 h-4 text-ink-primary" />
          </button>
        </div>
      )}

      {/* Content */}
      {view === "monthly" ? (
        <MonthView
          currentMonth={currentMonth}
          appointments={monthAppts}
          today={today}
          onDayClick={handleDayClick}
          onApptClick={handleApptClick}
        />
      ) : loadingDay ? (
        <div className="flex items-center justify-center gap-2 py-20 text-ink-secondary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando...</span>
        </div>
      ) : (
        <DayView
          appointments={dayAppts}
          slots={daySlots}
          updating={updating}
          onUpdate={updateStatus}
          onApptClick={handleApptClick}
        />
      )}

      {/* Modal */}
      {selectedAppt && (
        <AppointmentModal
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onUpdate={updateStatus}
          updating={updating.has(selectedAppt.id)}
        />
      )}
    </div>
  )
}
