"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Heart, User, Calendar, Check } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCLP } from "@/lib/utils"
import { useBookingStore, type BookingService } from "@/stores/booking-store"
import StepZero from "./StepZero"
import StepOne from "./StepOne"
import StepTwo from "./StepTwo"
import StepThree from "./StepThree"

const STEPS = ["Tratamiento", "Fecha y Hora", "Tus Datos", "Confirmación"]

function ProgressBar({ step, onGoToStep }: { step: number; onGoToStep: (s: number) => void }) {
  const total = STEPS.length
  const pct = Math.round(((step - 1) / (total - 1)) * 100)

  return (
    <div className="mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          Paso {step} de {total}
        </span>
        <span className="text-xs text-ink-secondary">{pct}% completado</span>
      </div>
      <div className="h-1 bg-border rounded-full mb-5">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const idx = i + 1
          const done = idx < step
          const current = idx === step
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
              <button
                type="button"
                disabled={!done}
                onClick={() => done && onGoToStep(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  done
                    ? "bg-primary text-white hover:opacity-80 cursor-pointer"
                    : current
                    ? "bg-primary text-white ring-4 ring-primary/20 cursor-default"
                    : "bg-canvas border border-border text-ink-muted cursor-default"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : idx}
              </button>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  done || current ? "text-ink-primary" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BookingSummary({ businessName }: { businessName: string }) {
  const { selectedService, selectedDate, selectedTime, contactInfo } =
    useBookingStore()

  return (
    <aside className="bezel-outer h-max">
      <div className="bezel-inner p-6 space-y-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">
          Resumen del turno
        </p>

        {/* Service */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            {selectedService ? (
              <>
                <p className="text-sm font-medium text-ink-primary truncate">
                  {selectedService.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-ink-muted italic">Sin servicio</p>
            )}
          </div>
        </div>

        {/* Professional */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-ink-muted" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">
              Profesional
            </p>
            <p className="text-sm text-ink-primary">{businessName}</p>
          </div>
        </div>

        {/* Date/time */}
        {selectedDate && selectedTime && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-primary capitalize">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-xs text-ink-secondary">{selectedTime} hs</p>
            </div>
          </div>
        )}

        {/* Pricing */}
        {selectedService && (
          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-ink-secondary">
              <Clock className="w-3.5 h-3.5" />
              <span>Duración total</span>
              <span className="ml-auto text-ink-primary font-medium">
                {selectedService.duration} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary">Total</span>
              <span className="font-semibold text-ink-primary">
                {formatCLP(selectedService.price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-secondary">Abono online</span>
              <span className="font-bold text-primary text-base">
                {formatCLP(selectedService.deposit)}
              </span>
            </div>
          </div>
        )}

        {/* Contact info */}
        {contactInfo && (
          <div className="border-t border-border pt-4 text-xs text-ink-secondary space-y-0.5">
            <p className="font-medium text-ink-primary text-sm">
              {contactInfo.name} {contactInfo.lastName}
            </p>
            <p>{contactInfo.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default function BookingFlowFull({
  services,
  businessName,
  onClose,
  embedded = false,
}: {
  services: BookingService[]
  businessName: string
  onClose?: () => void
  embedded?: boolean
}) {
  const [step, setStep] = useState(1)
  const { selectedService } = useBookingStore()

  return (
    <div className={embedded ? "" : "min-h-[100dvh] bg-canvas"}>
      {/* Header — hidden when inside modal */}
      {!embedded && (
        <div className="border-b border-border bg-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <span className="text-border">·</span>
            <span className="text-sm font-semibold text-ink-primary">
              Reservar Turno
            </span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto py-8 md:py-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Main wizard */}
          <div className="bezel-outer">
            <div className="bezel-inner p-8 md:p-10">
              <ProgressBar step={step} onGoToStep={setStep} />

              {step === 1 && (
                <StepZero services={services} onNext={() => setStep(2)} />
              )}
              {step === 2 && selectedService && (
                <StepOne
                  service={selectedService}
                  onNext={() => setStep(3)}
                />
              )}
              {step === 3 && (
                <StepTwo onNext={() => setStep(4)} onBack={() => setStep(2)} />
              )}
              {step === 4 && selectedService && (
                <StepThree
                  service={selectedService}
                  onBack={() => setStep(3)}
                />
              )}
            </div>
          </div>

          {/* Summary sidebar */}
          <BookingSummary businessName={businessName} />
        </div>
      </div>
    </div>
  )
}
