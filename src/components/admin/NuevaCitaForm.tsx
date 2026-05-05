"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, ArrowLeft, Check } from "lucide-react"

interface Service {
  id: string
  name: string
  duration: number
  price: number
  deposit: number
}

interface TakenSlot {
  hour: number
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8–21

export default function NuevaCitaForm({ services }: { services: Service[] }) {
  const router = useRouter()

  const [serviceId, setServiceId] = useState("")
  const [date, setDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return format(d, "yyyy-MM-dd")
  })
  const [hour, setHour] = useState("")
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [rut, setRut] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentReceived, setPaymentReceived] = useState(false)
  const [takenHours, setTakenHours] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch existing appointments for selected date to mark conflicts
  useEffect(() => {
    if (!date) return
    const d = new Date(date + "T00:00:00")
    fetch(`/api/appointments?date=${d.toISOString()}`)
      .then((r) => r.json())
      .then((data) => {
        const hours = (data.appointments ?? [])
          .filter((a: { status: string }) => ["PENDING", "CONFIRMED"].includes(a.status))
          .map((a: { date: string }) => new Date(a.date).getHours())
        setTakenHours(hours)
        // Reset hour if it became taken
        if (hour && hours.includes(parseInt(hour))) setHour("")
      })
      .catch(() => {})
  }, [date])

  const selectedService = services.find((s) => s.id === serviceId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceId || !date || !hour || !name || !phone) {
      setError("Completa los campos obligatorios.")
      return
    }
    setLoading(true)
    setError(null)

    const datetime = new Date(`${date}T${hour.padStart(2, "0")}:00:00`)

    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, datetime: datetime.toISOString(), name, lastName, rut, email, phone, notes, paymentReceived }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Error al crear la cita")
        return
      }
      setSuccess(true)
      setTimeout(() => router.push("/admin/agenda"), 1200)
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
          <Check className="w-6 h-6 text-emerald-600" strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-ink-primary">Cita creada correctamente</p>
        <p className="text-xs text-ink-secondary">Redirigiendo a la agenda…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Servicio */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">Servicio</p>
        <div className="grid gap-2">
          {services.map((s) => (
            <label
              key={s.id}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                serviceId === s.id
                  ? "border-ink-primary bg-ink-primary/[0.03]"
                  : "border-black/[0.08] hover:border-black/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  serviceId === s.id ? "border-ink-primary" : "border-black/20"
                }`}>
                  {serviceId === s.id && <div className="w-2 h-2 rounded-full bg-ink-primary" />}
                </div>
                <span className="text-sm font-medium text-ink-primary">{s.name}</span>
                <span className="text-xs text-ink-secondary">{s.duration} min</span>
              </div>
              <span className="text-sm font-semibold text-ink-primary">${s.deposit.toLocaleString("es-CL")}</span>
              <input type="radio" name="service" value={s.id} className="sr-only"
                onChange={() => setServiceId(s.id)} />
            </label>
          ))}
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">Fecha y hora</p>

        <div>
          <label className="text-xs text-ink-secondary mb-1.5 block">Fecha *</label>
          <input
            type="date"
            value={date}
            min={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => { setDate(e.target.value); setHour("") }}
            required
            className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs text-ink-secondary mb-1.5 block">Hora *</label>
          <div className="grid grid-cols-7 gap-1.5">
            {HOURS.map((h) => {
              const isTaken = takenHours.includes(h)
              const label = `${String(h).padStart(2, "0")}:00`
              const selected = hour === String(h)
              return (
                <button
                  key={h}
                  type="button"
                  disabled={isTaken}
                  onClick={() => setHour(String(h))}
                  className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                    isTaken
                      ? "bg-red-50 text-red-300 cursor-not-allowed line-through"
                      : selected
                      ? "bg-ink-primary text-white"
                      : "bg-black/[0.04] text-ink-secondary hover:bg-black/[0.08] hover:text-ink-primary"
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Datos del cliente */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">Datos del cliente</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-secondary mb-1.5 block">Nombre *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Juan"
              className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted" />
          </div>
          <div>
            <label className="text-xs text-ink-secondary mb-1.5 block">Apellido</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Pérez"
              className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-ink-secondary mb-1.5 block">Teléfono *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="912345678" type="tel"
              className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted" />
          </div>
          <div>
            <label className="text-xs text-ink-secondary mb-1.5 block">RUT</label>
            <input value={rut} onChange={(e) => setRut(e.target.value)} placeholder="12.345.678-9"
              className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted" />
          </div>
        </div>

        <div>
          <label className="text-xs text-ink-secondary mb-1.5 block">Email <span className="text-ink-muted">(opcional)</span></label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="juan@email.com" type="email"
            className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted" />
        </div>

        <div>
          <label className="text-xs text-ink-secondary mb-1.5 block">Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            placeholder="Ej: cliente frecuente, alergias, preferencias…"
            className="w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted resize-none" />
        </div>
      </div>

      {/* Pago */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setPaymentReceived((v) => !v)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              paymentReceived ? "bg-emerald-500 border-emerald-500" : "border-black/20"
            }`}
          >
            {paymentReceived && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </div>
          <div>
            <p className="text-sm font-medium text-ink-primary">Abono ya cobrada</p>
            {selectedService && (
              <p className="text-xs text-ink-secondary mt-0.5">
                ${selectedService.deposit.toLocaleString("es-CL")} recibido en efectivo o transferencia
              </p>
            )}
          </div>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <button type="submit" disabled={loading || !serviceId || !hour || !name || !phone}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : "Crear cita"}
        </button>
      </div>
    </form>
  )
}
