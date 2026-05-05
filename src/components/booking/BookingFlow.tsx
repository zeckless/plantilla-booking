"use client"

import { useState } from "react"
import StepOne from "./StepOne"
import StepTwo from "./StepTwo"
import StepThree from "./StepThree"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, Heart, User, Calendar } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import { useBookingStore, type BookingService } from "@/stores/booking-store"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Check } from "lucide-react"

export type { BookingService }

const STEPS = ["Tratamiento", "Fecha y Hora", "Tus Datos", "Confirmación"]

function ProgressBar({ step }: { step: number }) {
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

      {/* Bar */}
      <div className="h-1 bg-border rounded-full mb-5">
        <div
          className="h-1 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step circles */}
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const idx = i + 1
          const done = idx < step
          const current = idx === step
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? "bg-primary text-white"
                    : current
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-canvas border border-border text-ink-muted"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : idx}
              </div>
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

function BookingSummary({ service }: { service: BookingService }) {
  const { selectedDate, selectedTime, contactInfo } = useBookingStore()

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
            <p className="text-sm font-medium text-ink-primary truncate">
              {service.name}
            </p>
            {service.imageUrl && (
              <div className="relative w-full h-24 rounded-lg overflow-hidden mt-2">
                <Image
                  src={service.imageUrl}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="260px"
                />
              </div>
            )}
          </div>
        </div>

        {/* Professional placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center shrink-0">
            <User className="w-3.5 h-3.5 text-ink-muted" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-ink-muted font-semibold">
              Profesional
            </p>
            <p className="text-sm text-ink-primary">Barbería & Estética</p>
          </div>
        </div>

        {/* Date/time (shown once selected) */}
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
        <div className="border-t border-border pt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-ink-secondary">
            <Clock className="w-3.5 h-3.5" />
            <span>Duración total</span>
            <span className="ml-auto text-ink-primary font-medium">
              {service.duration} min
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-secondary">Total</span>
            <span className="font-semibold text-ink-primary">
              {formatCLP(service.price)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-ink-secondary">Abono online</span>
            <span className="font-bold text-primary text-base">
              {formatCLP(service.deposit)}
            </span>
          </div>
        </div>

        {/* Contact info (shown once filled) */}
        {contactInfo && (
          <div className="border-t border-border pt-4 text-xs text-ink-secondary space-y-0.5">
            <p className="font-medium text-ink-primary text-sm">{contactInfo.name}</p>
            <p>{contactInfo.email}</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default function BookingFlow({ service }: { service: BookingService }) {
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-[100dvh] bg-canvas">
      {/* Top header */}
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

      <div className="max-w-5xl mx-auto py-10 md:py-12 px-4 md:px-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Main content */}
          <div className="bezel-outer">
            <div className="bezel-inner p-8 md:p-10">
              <ProgressBar step={step} />

              {step === 1 && (
                <StepOne service={service} onNext={() => setStep(2)} />
              )}
              {step === 2 && (
                <StepTwo onNext={() => setStep(3)} onBack={() => setStep(1)} />
              )}
              {step === 3 && (
                <StepThree service={service} onBack={() => setStep(2)} />
              )}
            </div>
          </div>

          {/* Summary sidebar */}
          <BookingSummary service={service} />
        </div>
      </div>
    </div>
  )
}
