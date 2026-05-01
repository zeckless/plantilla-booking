"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  addDays,
  addWeeks,
  subWeeks,
  startOfWeek,
  format,
  isBefore,
  isToday,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Check, User, Loader2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface Slot {
  id: string
  datetime: string
  isBooked: boolean
}

const TIMES: string[] = []
for (let h = 8; h <= 21; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`)
}

const DAYS_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export default function SlotCalendar() {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [pending, setPending] = useState<Set<string>>(new Set())

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const weekEnd = addDays(weekStart, 7)

  const fetchSlots = useCallback(async (start: Date, end: Date) => {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/slots?start=${start.toISOString()}&end=${end.toISOString()}`
      )
      const data = await res.json()
      setSlots(data.slots ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots(weekStart, weekEnd)
  }, [weekStart])

  const getSlot = (day: Date, time: string): Slot | undefined => {
    const [h, m] = time.split(":").map(Number)
    const dt = new Date(day)
    dt.setHours(h, m, 0, 0)
    return slots.find(
      (s) => new Date(s.datetime).getTime() === dt.getTime()
    )
  }

  const handleCell = async (day: Date, time: string) => {
    const [h, m] = time.split(":").map(Number)
    const dt = new Date(day)
    dt.setHours(h, m, 0, 0)

    if (isBefore(dt, new Date())) return

    const key = dt.toISOString()
    const slot = getSlot(day, time)
    if (slot?.isBooked) return

    setPending((prev) => new Set(prev).add(key))
    try {
      if (slot) {
        await fetch(`/api/slots/${slot.id}`, { method: "DELETE" })
        setSlots((prev) => prev.filter((s) => s.id !== slot.id))
      } else {
        const res = await fetch("/api/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ datetime: dt.toISOString() }),
        })
        const data = await res.json()
        if (data.slot) setSlots((prev) => [...prev, data.slot])
      }
    } finally {
      setPending((prev) => {
        const s = new Set(prev)
        s.delete(key)
        return s
      })
    }
  }

  const available = slots.filter((s) => !s.isBooked).length
  const booked = slots.filter((s) => s.isBooked).length

  return (
    <div className="space-y-6 animate-reveal">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="eyebrow w-max mb-4">Agenda</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink-primary">
            Disponibilidad
          </h1>
          <p className="text-ink-secondary mt-2 text-sm">
            Haz clic en un horario para liberarlo. Haz clic nuevamente para quitarlo.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            {available} libres
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <div className="w-3 h-3 rounded-full bg-primary" />
            {booked} reservados
          </div>
        </div>
      </div>

      <div className="bezel-outer">
        <div className="bezel-inner overflow-hidden">
          {/* Week navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <button
              onClick={() => setWeekStart((w) => subWeeks(w, 1))}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-ink-primary" />
            </button>

            <div className="flex items-center gap-4">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-ink-secondary" />}
              <p className="text-sm font-semibold text-ink-primary capitalize">
                {format(weekStart, "d MMM", { locale: es })} –{" "}
                {format(addDays(weekStart, 6), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
              <button
                onClick={() =>
                  setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
                }
                className="text-xs uppercase tracking-widest font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
              >
                Hoy
              </button>
            </div>

            <button
              onClick={() => setWeekStart((w) => addWeeks(w, 1))}
              className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-ink-primary" />
            </button>
          </div>

          {/* Grid */}
          <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <div
              className="grid min-w-[640px]"
              style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
            >
              {/* Day headers */}
              <div className="sticky top-0 z-10 bg-white border-b border-border" />
              {weekDays.map((day, i) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "sticky top-0 z-10 bg-white border-b border-l border-border px-1 py-3 text-center",
                    isToday(day) && "bg-primary-soft"
                  )}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">
                    {DAYS_ES[i]}
                  </p>
                  <p
                    className={cn(
                      "text-base font-semibold mt-0.5",
                      isToday(day) ? "text-primary" : "text-ink-primary"
                    )}
                  >
                    {format(day, "d")}
                  </p>
                </div>
              ))}

              {/* Time rows */}
              {TIMES.map((time) => (
                <React.Fragment key={time}>
                  {/* Time label */}
                  <div
                    key={`label-${time}`}
                    className="border-b border-border px-2 flex items-center justify-end"
                    style={{ height: 44 }}
                  >
                    <span className="text-[10px] text-ink-muted font-mono">
                      {time}
                    </span>
                  </div>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const [h, m] = time.split(":").map(Number)
                    const dt = new Date(day)
                    dt.setHours(h, m, 0, 0)
                    const key = dt.toISOString()
                    const slot = getSlot(day, time)
                    const isPast = isBefore(dt, new Date())
                    const isPending = pending.has(key)

                    return (
                      <div
                        key={key}
                        style={{ height: 44 }}
                        className={cn(
                          "border-b border-l border-border flex items-center justify-center transition-all duration-150",
                          isPast && "bg-black/[0.02]",
                          !isPast && !slot && "cursor-pointer hover:bg-primary-soft group",
                          slot?.isBooked && "bg-rose-50 cursor-default",
                          slot && !slot.isBooked && "bg-emerald-50 cursor-pointer hover:bg-red-50 group",
                          isPending && "opacity-40 pointer-events-none"
                        )}
                        onClick={() => !isPast && !isPending && handleCell(day, time)}
                        title={
                          slot?.isBooked
                            ? "Turno reservado — no se puede eliminar"
                            : slot
                            ? "Clic para quitar este horario"
                            : isPast
                            ? ""
                            : "Clic para liberar este horario"
                        }
                      >
                        {isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin text-ink-secondary" />
                        ) : slot?.isBooked ? (
                          <User className="w-3.5 h-3.5 text-rose-400" />
                        ) : slot ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500 group-hover:hidden" />
                        ) : !isPast ? (
                          <Plus className="w-3 h-3 text-ink-muted opacity-0 group-hover:opacity-60 transition-opacity" />
                        ) : null}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-3 border-t border-border bg-surface-inner">
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <div className="w-4 h-4 rounded border border-dashed border-border bg-white" />
              Disponible para liberar
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-500" />
              </div>
              Horario libre
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <div className="w-4 h-4 rounded bg-rose-50 border border-rose-200 flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-rose-400" />
              </div>
              Reservado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
