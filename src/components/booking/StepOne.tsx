"use client"

import { useEffect, useMemo, useState } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  startOfToday,
} from "date-fns"
import { es } from "date-fns/locale"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useBookingStore, type BookingService } from "@/stores/booking-store"
import { formatCLP } from "@/lib/utils"

const WEEKDAYS_SHORT = ["L", "M", "M", "J", "V", "S", "D"]

function buildMonthGrid(viewMonth: Date) {
  const start = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 })
  const days: Date[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

export default function StepOne({
  service,
  onNext,
}: {
  service: BookingService
  onNext: () => void
}) {
  const { selectedDate, selectedTime, setDate, setTime } = useBookingStore()
  const today = startOfToday()
  const [viewMonth, setViewMonth] = useState<Date>(selectedDate ?? today)
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth])

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(
      `/api/availability?serviceId=${service.id}&date=${selectedDate.toISOString()}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (Array.isArray(data.slots)) setSlots(data.slots)
        else {
          setSlots([])
          setError(data.error || "No se pudieron cargar los horarios")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Error de conexion")
          setSlots([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedDate, service.id])

  const handleNext = () => {
    if (selectedDate && selectedTime) onNext()
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-0 animate-reveal">
      {/* Left: calendar */}
      <div className="lg:border-r border-border">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-ink-primary">
            Elige fecha y horario
          </h2>
          <p className="text-sm text-ink-secondary mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {service.duration} min ·{" "}
            {formatCLP(service.deposit)} de abono
          </p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-ink-primary capitalize">
            {format(viewMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              disabled={isSameMonth(viewMonth, today)}
              className="p-2 rounded-lg hover:bg-canvas text-ink-primary disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-lg hover:bg-canvas text-ink-primary"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          {WEEKDAYS_SHORT.map((d, i) => (
            <span
              key={i}
              className="text-xs font-semibold text-ink-muted py-1"
            >
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth)
            const isPast = isBefore(day, today)
            const isSelected = selectedDate && isSameDay(selectedDate, day)
            const isToday = isSameDay(day, today)
            const disabled = isPast || !inMonth

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => setDate(day)}
                className={`aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : disabled
                      ? "text-ink-muted/50 cursor-not-allowed"
                      : "text-ink-primary hover:bg-primary-soft"
                  }
                  ${
                    !isSelected && isToday && inMonth && !isPast
                      ? "ring-1 ring-primary"
                      : ""
                  }
                `}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: time slots */}
      <div className="p-0 pt-6 lg:pt-0 lg:pl-8 bg-transparent">
        {!selectedDate ? (
          <div className="h-full flex items-center justify-center text-center text-sm text-ink-secondary py-12">
            Selecciona un dia para ver los horarios disponibles.
          </div>
        ) : (
          <>
            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest text-ink-secondary font-semibold mb-1">
                Horarios
              </p>
              <p className="text-base font-semibold text-ink-primary capitalize">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </div>
            )}

            {!loading && error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {!loading && !error && slots.length === 0 && (
              <p className="text-sm text-ink-secondary">
                Sin horarios disponibles este dia.
              </p>
            )}

            {!loading && slots.length > 0 && (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 hide-scrollbar">
                {slots.map((time) => {
                  const isSelected = selectedTime === time
                  return (
                    <div key={time} className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTime(time)}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold border transition-colors
                          ${
                            isSelected
                              ? "border-primary text-primary bg-white"
                              : "border-border text-ink-primary hover:border-primary"
                          }`}
                      >
                        {time}
                      </button>
                      {isSelected ? (
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn-island py-2.5"
                        >
                          Confirmar
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
