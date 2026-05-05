"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { MessageCircle, Check, Phone, Clock } from "lucide-react"

type Reminder = {
  id: string
  name: string
  phone: string | null
  service: string
  date: string
  reminderSent: boolean
  whatsappUrl: string | null
}

export default function RecordatoriosClient({ reminders }: { reminders: Reminder[] }) {
  const [sent, setSent] = useState<Set<string>>(
    new Set(reminders.filter((r) => r.reminderSent).map((r) => r.id))
  )

  const markSent = async (id: string) => {
    await fetch("/api/admin/appointments/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderSent: true }),
    })
    setSent((prev) => new Set([...prev, id]))
  }

  if (reminders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
        <MessageCircle className="w-10 h-10 text-ink-muted mx-auto mb-3" strokeWidth={1} />
        <p className="text-sm font-medium text-ink-primary">No hay citas para mañana</p>
        <p className="text-xs text-ink-secondary mt-1">Vuelve a revisar más tarde</p>
      </div>
    )
  }

  const pending = reminders.filter((r) => !sent.has(r.id))
  const done = reminders.filter((r) => sent.has(r.id))

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
          <div className="px-6 py-4 border-b border-black/[0.06] flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Pendientes · {pending.length}
            </p>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="divide-y divide-black/[0.04]">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-primary">{r.name}</p>
                  <p className="text-xs text-ink-secondary">{r.service}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(r.date), "HH:mm")}
                    </span>
                    {r.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {r.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.whatsappUrl ? (
                    <a
                      href={r.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markSent(r.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enviar WhatsApp
                    </a>
                  ) : (
                    <span className="text-xs text-ink-muted">Sin teléfono</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden opacity-60">
          <div className="px-6 py-4 border-b border-black/[0.06]">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Enviados · {done.length}
            </p>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {done.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-primary">{r.name}</p>
                  <p className="text-xs text-ink-secondary">{r.service} · {format(new Date(r.date), "HH:mm")}</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Enviado
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
