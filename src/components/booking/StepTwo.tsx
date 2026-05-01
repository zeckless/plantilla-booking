"use client"

import { useState } from "react"
import { useBookingStore } from "@/stores/booking-store"
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react"

// ── Validators ──────────────────────────────────────────────

function validarRut(rut: string): boolean {
  const clean = rut.replace(/[.\-\s]/g, "").toUpperCase()
  if (clean.length < 2) return false
  const num = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(num)) return false

  let suma = 0
  let multiplo = 2
  for (let i = num.length - 1; i >= 0; i--) {
    suma += parseInt(num[i]) * multiplo
    multiplo = multiplo < 7 ? multiplo + 1 : 2
  }
  const dvEsperado = 11 - (suma % 11)
  const dvStr = dvEsperado === 11 ? "0" : dvEsperado === 10 ? "K" : String(dvEsperado)
  return dv === dvStr
}

function formatRut(value: string): string {
  const clean = value.replace(/[^\dkK]/g, "").toUpperCase()
  if (clean.length === 0) return ""
  const num = clean.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  const dv = clean.slice(-1)
  return clean.length === 1 ? clean : `${num}-${dv}`
}

function validarTelefono(phone: string): boolean {
  const clean = phone.replace(/\s/g, "")
  return /^9\d{8}$/.test(clean)
}

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

const DOMAIN_FIXES: Record<string, string> = {
  // Gmail
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com",
  "gmail.co": "gmail.com", "gmail.cm": "gmail.com", "gmail.cmo": "gmail.com",
  "gmail.con": "gmail.com", "gimail.com": "gmail.com", "gmal.com": "gmail.com",
  // Gmail .cl (chilenos que confunden)
  "gmail.cl": "gmail.com",
  // Hotmail
  "hotmai.com": "hotmail.com", "hotmal.com": "hotmail.com", "hotmial.com": "hotmail.com",
  "hotmail.cl": "hotmail.com",
  // Outlook
  "outlok.com": "outlook.com", "outloo.com": "outlook.com", "outlook.cl": "outlook.com",
  // Yahoo
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.cl": "yahoo.com",
  // iCloud
  "iclud.com": "icloud.com", "icloud.cl": "icloud.com",
}

const TLD_FIXES: Record<string, string> = {
  // .com typos
  ".con": ".com", ".cmo": ".com", ".ocm": ".com", ".vom": ".com",
  ".cpm": ".com", ".xom": ".com", ".coom": ".com", ".comm": ".com",
  ".co m": ".com", ".c0m": ".com",
  // .cl typos
  ".cll": ".cl", ".clm": ".cl", ".lc": ".cl", ".cl ": ".cl",
  // .net / .org
  ".ner": ".net", ".nет": ".net", ".og": ".org",
}

function sugerirEmail(email: string): string | null {
  if (!email.includes("@")) return null
  const [local, domain] = email.split("@")
  if (!domain) return null

  if (DOMAIN_FIXES[domain.toLowerCase()]) {
    return `${local}@${DOMAIN_FIXES[domain.toLowerCase()]}`
  }

  for (const [typo, fix] of Object.entries(TLD_FIXES)) {
    if (domain.toLowerCase().endsWith(typo)) {
      const corrected = domain.slice(0, -typo.length) + fix
      return `${local}@${corrected}`
    }
  }

  return null
}

// ── Field component ──────────────────────────────────────────

type FieldState = "idle" | "valid" | "error"

function FieldIcon({ state }: { state: FieldState }) {
  if (state === "valid") return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
  if (state === "error") return <XCircle className="w-4 h-4 text-red-500 shrink-0" />
  return null
}

function fieldBorder(state: FieldState) {
  if (state === "valid") return "border-green-400 focus:border-green-500 focus:ring-green-200"
  if (state === "error") return "border-red-400 focus:border-red-500 focus:ring-red-200"
  return "border-border focus:border-primary focus:ring-primary/20"
}

interface FieldProps {
  label: string
  hint?: string
  state: FieldState
  error?: string
  children: React.ReactNode
}

function Field({ label, hint, state, error, children }: FieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary">
          {label}
        </label>
        {hint && <span className="text-[10px] text-ink-muted">{hint}</span>}
      </div>
      <div className="relative flex items-center">
        {children}
        <div className="absolute right-3 pointer-events-none">
          <FieldIcon state={state} />
        </div>
      </div>
      {state === "error" && error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────

interface FormValues {
  name: string
  lastName: string
  rut: string
  email: string
  phone: string
  notes: string
}

interface TouchedFields {
  name: boolean
  lastName: boolean
  rut: boolean
  email: boolean
  phone: boolean
}

function getFieldState(touched: boolean, isValid: boolean, value: string, optional = false): FieldState {
  if (!touched || value === "") return "idle"
  if (optional && value === "") return "idle"
  return isValid ? "valid" : "error"
}

export default function StepTwo({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { contactInfo, setContactInfo } = useBookingStore()

  const [values, setValues] = useState<FormValues>({
    name: contactInfo?.name ?? "",
    lastName: contactInfo?.lastName ?? "",
    rut: contactInfo?.rut ?? "",
    email: contactInfo?.email ?? "",
    phone: contactInfo?.phone ?? "",
    notes: contactInfo?.notes ?? "",
  })

  const [touched, setTouched] = useState<TouchedFields>({
    name: false,
    lastName: false,
    rut: false,
    email: false,
    phone: false,
  })

  const set = (k: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let val = e.target.value
    if (k === "rut") val = formatRut(val)
    if (k === "phone") val = val.replace(/[^\d\s]/g, "").slice(0, 11)
    setValues((v) => ({ ...v, [k]: val }))
  }

  const blur = (k: keyof TouchedFields) => () =>
    setTouched((t) => ({ ...t, [k]: true }))

  // Validations
  const emailSuggestion = touched.email && values.email ? sugerirEmail(values.email) : null

  const valid = {
    name: values.name.trim().length >= 2,
    lastName: values.lastName.trim().length >= 2,
    rut: values.rut === "" || validarRut(values.rut), // opcional
    email: validarEmail(values.email),
    phone: validarTelefono(values.phone),
  }

  const allValid = Object.values(valid).every(Boolean) && !emailSuggestion

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    // Mark all as touched to show all errors
    setTouched({ name: true, lastName: true, rut: true, email: true, phone: true })
    if (!allValid) return
    setContactInfo({
      name: values.name.trim(),
      lastName: values.lastName.trim(),
      rut: values.rut,
      email: values.email.trim().toLowerCase(),
      phone: values.phone.replace(/\s/g, ""),
      notes: values.notes.trim() || undefined,
    })
    onNext()
  }

  return (
    <div className="animate-reveal">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-ink-primary">Tus datos</h2>
        <p className="text-sm text-ink-secondary mt-1">
          Completa tus datos para confirmar el turno.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Nombre + Apellido */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="Nombre *"
            state={getFieldState(touched.name, valid.name, values.name)}
            error="Ingresá un nombre válido"
          >
            <input
              type="text"
              value={values.name}
              onChange={set("name")}
              onBlur={blur("name")}
              placeholder="Tu nombre"
              className={`input-field pr-9 ${fieldBorder(getFieldState(touched.name, valid.name, values.name))}`}
            />
          </Field>

          <Field
            label="Apellido *"
            state={getFieldState(touched.lastName, valid.lastName, values.lastName)}
            error="Ingresá un apellido válido"
          >
            <input
              type="text"
              value={values.lastName}
              onChange={set("lastName")}
              onBlur={blur("lastName")}
              placeholder="Tu apellido"
              className={`input-field pr-9 ${fieldBorder(getFieldState(touched.lastName, valid.lastName, values.lastName))}`}
            />
          </Field>
        </div>

        {/* RUT */}
        <Field
          label="RUT"
          hint="Opcional · Ej: 12.345.678-9"
          state={values.rut === "" ? "idle" : getFieldState(touched.rut, valid.rut, values.rut)}
          error="El RUT ingresado no es válido"
        >
          <input
            type="text"
            value={values.rut}
            onChange={set("rut")}
            onBlur={blur("rut")}
            placeholder="12.345.678-9"
            maxLength={12}
            className={`input-field pr-9 ${fieldBorder(values.rut === "" ? "idle" : getFieldState(touched.rut, valid.rut, values.rut))}`}
          />
        </Field>

        {/* Email + Teléfono */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Field
              label="Email *"
              state={emailSuggestion ? "error" : getFieldState(touched.email, valid.email, values.email)}
              error={emailSuggestion ? undefined : "Ingresá un email válido"}
            >
              <input
                type="email"
                value={values.email}
                onChange={set("email")}
                onBlur={blur("email")}
                placeholder="tu@email.com"
                className={`input-field pr-9 ${fieldBorder(emailSuggestion ? "error" : getFieldState(touched.email, valid.email, values.email))}`}
              />
            </Field>
            {emailSuggestion && (
              <p className="mt-1 text-xs text-amber-700">
                ¿Quisiste decir{" "}
                <button
                  type="button"
                  className="font-semibold underline hover:text-amber-900"
                  onClick={() => {
                    setValues((v) => ({ ...v, email: emailSuggestion }))
                    setTouched((t) => ({ ...t, email: true }))
                  }}
                >
                  {emailSuggestion}
                </button>
                ?
              </p>
            )}
          </div>

          <Field
            label="Teléfono *"
            hint="9 dígitos"
            state={getFieldState(touched.phone, valid.phone, values.phone)}
            error="Formato: 912345678 (sin +56)"
          >
            <input
              type="tel"
              value={values.phone}
              onChange={set("phone")}
              onBlur={blur("phone")}
              placeholder="912345678"
              className={`input-field pr-9 ${fieldBorder(getFieldState(touched.phone, valid.phone, values.phone))}`}
            />
          </Field>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
            Notas <span className="normal-case font-normal text-ink-muted">(opcional)</span>
          </label>
          <textarea
            rows={3}
            value={values.notes}
            onChange={set("notes")}
            placeholder="Algún requerimiento especial..."
            className="input-field resize-none"
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>

          <button type="submit" className="btn-island">
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
