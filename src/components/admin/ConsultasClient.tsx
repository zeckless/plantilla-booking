"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, MailOpen, Trash2, Phone, Tag, MessageSquare } from "lucide-react"

type Message = {
  id: string
  name: string
  email: string | null
  phone: string | null
  service: string | null
  message: string
  read: boolean
  createdAt: Date | string
}

export default function ConsultasClient({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages)
  const [selected, setSelected] = useState<Message | null>(null)

  const markRead = async (id: string, read: boolean) => {
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)))
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, read } : null)
  }

  const deleteMsg = async (id: string) => {
    await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const handleSelect = (msg: Message) => {
    setSelected(msg)
    if (!msg.read) markRead(msg.id, true)
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center">
        <Mail className="w-10 h-10 text-ink-muted mx-auto mb-3" strokeWidth={1} />
        <p className="text-sm font-medium text-ink-primary">Sin consultas todavía</p>
        <p className="text-xs text-ink-secondary mt-1">Aquí aparecerán los mensajes del formulario de contacto</p>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4 items-start">
      {/* Lista */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="px-4 py-3 border-b border-black/[0.06]">
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
            {messages.length} mensaje{messages.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="divide-y divide-black/[0.04] max-h-[600px] overflow-y-auto">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={`w-full text-left px-4 py-3.5 hover:bg-black/[0.02] transition-colors ${
                selected?.id === msg.id ? "bg-black/[0.03]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${msg.read ? "bg-transparent" : "bg-primary"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-sm truncate ${msg.read ? "font-medium text-ink-primary" : "font-semibold text-ink-primary"}`}>
                      {msg.name}
                    </p>
                    <p className="text-[10px] text-ink-muted shrink-0">
                      {format(new Date(msg.createdAt), "d MMM", { locale: es })}
                    </p>
                  </div>
                  {msg.service && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">{msg.service}</p>
                  )}
                  <p className="text-xs text-ink-secondary truncate">{msg.message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detalle */}
      {selected ? (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink-primary">{selected.name}</h2>
              <p className="text-xs text-ink-secondary mt-0.5">
                {format(new Date(selected.createdAt), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => markRead(selected.id, !selected.read)}
                title={selected.read ? "Marcar como no leído" : "Marcar como leído"}
                className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center text-ink-secondary hover:bg-black/[0.04] transition-colors"
              >
                {selected.read ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteMsg(selected.id)}
                className="w-8 h-8 rounded-lg border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {selected.email && (
              <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <Mail className="w-4 h-4 shrink-0 text-ink-muted" strokeWidth={1.5} />
                <a href={`mailto:${selected.email}`} className="hover:text-ink-primary transition-colors">{selected.email}</a>
              </div>
            )}
            {selected.phone && (
              <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <Phone className="w-4 h-4 shrink-0 text-ink-muted" strokeWidth={1.5} />
                <a href={`tel:${selected.phone}`} className="hover:text-ink-primary transition-colors">{selected.phone}</a>
              </div>
            )}
            {selected.service && (
              <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <Tag className="w-4 h-4 shrink-0 text-ink-muted" strokeWidth={1.5} />
                <span>{selected.service}</span>
              </div>
            )}
          </div>

          <div className="border-t border-black/[0.06] pt-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-3">
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.5} />
              Mensaje
            </div>
            <p className="text-sm text-ink-primary leading-relaxed whitespace-pre-line">{selected.message}</p>
          </div>

          {(selected.email || selected.phone) && (
            <div className="flex gap-2 pt-2">
              {selected.email && (
                <a href={`mailto:${selected.email}`}
                  className="flex-1 text-center px-4 py-2.5 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  Responder por email
                </a>
              )}
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 text-center px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ink-primary hover:bg-black/[0.03] transition-colors">
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-16 text-center hidden lg:flex flex-col items-center justify-center">
          <MessageSquare className="w-8 h-8 text-ink-muted mb-3" strokeWidth={1} />
          <p className="text-sm text-ink-secondary">Selecciona un mensaje para verlo</p>
        </div>
      )}
    </div>
  )
}
