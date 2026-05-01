"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2 } from "lucide-react"
import { WEEKDAY_NAMES } from "@/lib/utils"

export interface HourEntry {
  weekday: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

const ORDER = [1, 2, 3, 4, 5, 6, 0] // Lun..Sab, Dom

function buildInitial(existing: HourEntry[]): HourEntry[] {
  const map = new Map(existing.map((h) => [h.weekday, h]))
  return ORDER.map(
    (w) =>
      map.get(w) ?? {
        weekday: w,
        isOpen: w !== 0,
        openTime: "09:00",
        closeTime: "19:00",
      }
  )
}

export default function BusinessHoursForm({
  initial,
}: {
  initial: HourEntry[]
}) {
  const router = useRouter()
  const [hours, setHours] = useState<HourEntry[]>(buildInitial(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const update = (
    weekday: number,
    patch: Partial<HourEntry>
  ) => {
    setHours((prev) =>
      prev.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "Error al guardar")
        setSaving(false)
        return
      }
      setSavedAt(new Date())
      router.refresh()
    } catch {
      setError("Error de conexion")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 animate-reveal max-w-3xl">
      <div>
        <p className="eyebrow w-max mb-4">Horarios</p>
        <h1 className="font-serif text-4xl tracking-tight text-ink-primary">
          Horarios de atencion
        </h1>
        <p className="text-ink-secondary mt-2">
          Define los dias y horas en que aceptas reservas.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bezel-outer">
          <div className="bezel-inner divide-y divide-black/5">
            {hours.map((h) => (
              <div
                key={h.weekday}
                className="grid grid-cols-[120px_auto_1fr] items-center gap-6 px-6 py-4"
              >
                <div className="font-medium text-ink-primary">
                  {WEEKDAY_NAMES[h.weekday]}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.isOpen}
                    onChange={(e) =>
                      update(h.weekday, { isOpen: e.target.checked })
                    }
                    className="w-4 h-4 accent-ink-primary"
                  />
                  <span className="text-sm text-ink-secondary">
                    {h.isOpen ? "Abierto" : "Cerrado"}
                  </span>
                </label>

                <div className="flex items-center gap-3 justify-end">
                  <input
                    type="time"
                    disabled={!h.isOpen}
                    value={h.openTime}
                    onChange={(e) =>
                      update(h.weekday, { openTime: e.target.value })
                    }
                    className="bg-white/50 border border-black/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-40"
                  />
                  <span className="text-ink-secondary">a</span>
                  <input
                    type="time"
                    disabled={!h.isOpen}
                    value={h.closeTime}
                    onChange={(e) =>
                      update(h.weekday, { closeTime: e.target.value })
                    }
                    className="bg-white/50 border border-black/10 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-40"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-4">
          {savedAt && !saving && (
            <p className="text-sm text-ink-secondary">
              Guardado a las{" "}
              {savedAt.toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="btn-island justify-center disabled:opacity-50"
          >
            <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
            <div className="btn-island-inner-icon">
              {saving ? (
                <Loader2
                  className="w-5 h-5 text-white animate-spin"
                  strokeWidth={1.5}
                />
              ) : (
                <Save className="w-5 h-5 text-white" strokeWidth={1.5} />
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}
