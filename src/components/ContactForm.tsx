"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"

export default function ContactForm({ services }: { services: { name: string }[] }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  if (status === "error") {
    return (
      <div className="bezel-outer">
        <div className="bezel-inner p-8 text-center space-y-3">
          <p className="font-semibold text-red-600">Error al enviar</p>
          <p className="text-sm text-ink-secondary">Intenta de nuevo o escríbenos directamente.</p>
          <button onClick={() => setStatus("idle")} className="text-sm text-primary hover:underline">Reintentar</button>
        </div>
      </div>
    )
  }

  if (status === "sent") {
    return (
      <div className="bezel-outer">
        <div className="bezel-inner p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mx-auto">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <p className="font-semibold text-ink-primary">¡Mensaje enviado!</p>
          <p className="text-sm text-ink-secondary">Te respondemos pronto.</p>
          <button
            onClick={() => { setStatus("idle"); setForm({ name: "", email: "", phone: "", service: "", message: "" }) }}
            className="text-sm text-primary hover:underline"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bezel-outer">
      <div className="bezel-inner p-6 md:p-8 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
            Nombre *
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="Tu nombre completo"
            className="input-field"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="tu@email.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+56 9 ..."
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
            Servicio de interés
          </label>
          <select value={form.service} onChange={set("service")} className="input-field bg-white">
            <option value="">Seleccionar servicio</option>
            {services.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1.5">
            Mensaje
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={set("message")}
            placeholder="¿En qué podemos ayudarte?"
            className="input-field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-island w-full disabled:opacity-50"
        >
          {status === "sending" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
          ) : (
            <>Enviar mensaje <Send className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </form>
  )
}
