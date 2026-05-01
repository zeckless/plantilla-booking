"use client"

import { useState } from "react"
import { Save, Loader2 } from "lucide-react"

interface Settings {
  name: string
  address: string
  phone: string
  email: string
  instagram: string
  mapsEmbedUrl: string
}

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [data, setData] = useState<Settings>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof Settings) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => ({ ...d, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
  const labelClass = "block text-sm font-medium text-ink-primary mb-2"

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl animate-reveal">
      <div>
        <h1 className="text-3xl font-semibold text-ink-primary tracking-tight">
          Configuración del negocio
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Estos datos aparecen en la landing y en los emails de confirmación.
        </p>
      </div>

      <div className="bezel-outer">
        <div className="bezel-inner p-8 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-secondary">
            Información general
          </h2>

          <div>
            <label className={labelClass}>Nombre del negocio</label>
            <input type="text" value={data.name} onChange={set("name")} className={inputClass} placeholder="Barbería & Estética" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" value={data.phone} onChange={set("phone")} className={inputClass} placeholder="+56 9 1234 5678" />
            </div>
            <div>
              <label className={labelClass}>Email de contacto</label>
              <input type="email" value={data.email} onChange={set("email")} className={inputClass} placeholder="contacto@tudominio.cl" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Dirección</label>
            <input type="text" value={data.address} onChange={set("address")} className={inputClass} placeholder="Tu dirección, Ciudad" />
          </div>

          <div>
            <label className={labelClass}>Instagram</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-ink-muted">instagram.com/</span>
              <input
                type="text"
                value={data.instagram}
                onChange={set("instagram")}
                className={`${inputClass} flex-1`}
                placeholder="tunegocio"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bezel-outer">
        <div className="bezel-inner p-8 space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-ink-secondary mb-1">
              Google Maps
            </h2>
            <p className="text-xs text-ink-muted mb-4">
              Ve a Google Maps → busca tu dirección → Compartir → Insertar un mapa → copia solo el <code className="bg-black/5 px-1 rounded">src="..."</code> del iframe.
            </p>
            <label className={labelClass}>URL del embed</label>
            <textarea
              rows={3}
              value={data.mapsEmbedUrl}
              onChange={set("mapsEmbedUrl")}
              className={`${inputClass} resize-none font-mono text-xs`}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>

          {data.mapsEmbedUrl && (
            <div className="rounded-xl overflow-hidden border border-border aspect-video">
              <iframe
                src={data.mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button type="submit" disabled={saving} className="btn-island disabled:opacity-50">
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : saved ? (
            <>✓ Guardado</>
          ) : (
            <><Save className="w-4 h-4" /> Guardar cambios</>
          )}
        </button>
        {saved && <p className="text-sm text-green-600">Cambios guardados correctamente.</p>}
      </div>
    </form>
  )
}
