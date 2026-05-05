"use client"

import { useState } from "react"
import { useBookingStore } from "@/stores/booking-store"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  Wallet,
  Loader2,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react"
import { formatCLP } from "@/lib/utils"
import type { BookingService } from "@/stores/booking-store"

export default function StepThree({
  service,
  onBack,
}: {
  service: BookingService
  onBack: () => void
}) {
  const { selectedDate, selectedTime, contactInfo } = useBookingStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          date: selectedDate?.toISOString(),
          time: selectedTime,
          contactInfo,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Error al procesar el pago")
        setLoading(false)
        return
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else {
        setError("Respuesta invalida del servidor")
        setLoading(false)
      }
    } catch {
      setError("Error de conexion")
      setLoading(false)
    }
  }

  if (!selectedDate || !selectedTime || !contactInfo) return null

  const formattedDate = format(selectedDate, "EEEE d 'de' MMMM", {
    locale: es,
  })

  return (
    <div className="animate-reveal">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink-primary">Confirmacion</h2>
        <p className="text-sm text-ink-secondary mt-2">
          Revisa los detalles y paga la abono para confirmar tu turno.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Cita
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3 text-ink-primary">
              <Calendar className="w-4 h-4 text-ink-secondary" />
              <span className="capitalize">
                {formattedDate} a las {selectedTime} hrs
              </span>
            </div>
            <div className="flex items-center gap-3 text-ink-primary">
              <span className="text-ink-secondary text-xs uppercase tracking-widest">
                Servicio
              </span>
              <span>{service.name}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            Datos del cliente
          </p>
          <div className="space-y-2 text-sm text-ink-primary">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-ink-secondary shrink-0" />
              {contactInfo.name} {contactInfo.lastName}
            </div>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center text-xs text-ink-secondary shrink-0 font-mono">RUT</span>
              {contactInfo.rut}
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-ink-secondary shrink-0" />
              {contactInfo.email}
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-ink-secondary shrink-0" />
              +56 {contactInfo.phone}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-primary-soft border border-primary/10 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Abono a pagar ahora
              </p>
              <p className="text-xs text-ink-secondary mt-1">
                Saldo {formatCLP(service.price - service.deposit)} en el local
              </p>
            </div>
            <p className="text-3xl font-semibold text-primary">
              {formatCLP(service.deposit)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Atras
        </button>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="btn-island disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Procesando...
            </>
          ) : (
              <>
                <Wallet className="w-4 h-4" />
                Ir a pagar
              </>
          )}
        </button>
      </div>
    </div>
  )
}
