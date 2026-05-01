"use client"

import { useState } from "react"
import { Clock, ArrowRight, Check } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import { useBookingStore, type BookingService } from "@/stores/booking-store"

export default function StepZero({
  services,
  onNext,
}: {
  services: BookingService[]
  onNext: () => void
}) {
  const { selectedService, setService } = useBookingStore()

  // Derive unique categories preserving order of first appearance
  const categories = ["Todos", ...Array.from(
    new Set(services.map((s) => s.category).filter(Boolean) as string[])
  )]

  const [activeCategory, setActiveCategory] = useState("Todos")

  const visible =
    activeCategory === "Todos"
      ? services
      : services.filter((s) => s.category === activeCategory)

  return (
    <div className="animate-reveal">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink-primary">
          Elige tu tratamiento
        </h2>
        <p className="text-sm text-ink-secondary mt-1">
          Selecciona el servicio que necesitas.
        </p>
      </div>

      {/* Category tabs — only show if there's more than one category */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-ink-secondary border-border hover:border-primary hover:text-ink-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Service list */}
      <div className="space-y-2">
        {visible.map((service) => {
          const isSelected = selectedService?.id === service.id
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => setService(service)}
              className={`w-full text-left rounded-xl border p-4 transition-all duration-150 ${
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-white hover:border-border-strong"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  {service.category && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">
                      {service.category}
                    </p>
                  )}
                  <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-ink-primary"}`}>
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="text-xs text-ink-secondary mt-0.5 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-ink-secondary">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
                    </span>
                    <span>{formatCLP(service.price)}</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "bg-primary border-primary"
                      : "border-border bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </div>
            </button>
          )
        })}

        {visible.length === 0 && (
          <p className="text-sm text-ink-secondary text-center py-8">
            No hay servicios en esta categoría.
          </p>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedService}
          className="btn-island w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
