"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react"

interface ServiceData {
  name: string
  description: string
  category: string
  duration: number
  price: number
  deposit: number
  imageUrl: string
  isActive: boolean
}

interface Props {
  initial?: ServiceData & { id: string }
  mode: "create" | "edit"
  existingCategories?: string[]
}

export default function ServiceForm({ initial, mode, existingCategories = [] }: Props) {
  const router = useRouter()
  const [data, setData] = useState<ServiceData>({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    category: initial?.category ?? "",
    duration: initial?.duration ?? 30,
    price: initial?.price ?? 10000,
    deposit: initial?.deposit ?? 5000,
    imageUrl: initial?.imageUrl ?? "",
    isActive: initial?.isActive ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategoryText, setNewCategoryText] = useState("")

  // Merge hardcoded defaults with any categories already in DB
  const DEFAULT_CATEGORIES = ["Corte", "Barba", "Tratamiento", "Combo"]
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...existingCategories])]

  const update = <K extends keyof ServiceData>(
    key: K,
    value: ServiceData[K]
  ) => setData((d) => ({ ...d, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (data.deposit > data.price) {
      setError("El abono no puede ser mayor al precio total")
      setSaving(false)
      return
    }

    try {
      const url =
        mode === "create"
          ? "/api/services"
          : `/api/services/${initial!.id}`
      const method = mode === "create" ? "POST" : "PATCH"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || "Error al guardar")
        setSaving(false)
        return
      }
      router.push("/admin/services")
      router.refresh()
    } catch {
      setError("Error de conexion")
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!initial) return
    if (
      !confirm(
        "Seguro que quieres desactivar este servicio? No aparecera en la tienda pero las citas pasadas se mantienen."
      )
    )
      return
    setDeleting(true)
    try {
      const res = await fetch(`/api/services/${initial.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/admin/services")
        router.refresh()
      } else {
        setError("Error al desactivar")
        setDeleting(false)
      }
    } catch {
      setError("Error de conexion")
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-reveal max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/services"
          className="p-2 rounded-full hover:bg-black/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-ink-primary" />
        </Link>
        <div>
          <p className="eyebrow w-max mb-2">
            {mode === "create" ? "Nuevo" : "Editar"}
          </p>
          <h1 className="font-serif text-3xl tracking-tight text-ink-primary">
            {mode === "create" ? "Nuevo servicio" : data.name}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-primary mb-2">
                Nombre del servicio
              </label>
              <input
                required
                type="text"
                value={data.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="Ej: Corte clasico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-primary mb-2">
                Categoría <span className="text-ink-muted font-normal">(opcional)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const selected = data.category === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => update("category", selected ? "" : cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        selected
                          ? "bg-ink-primary text-white border-ink-primary"
                          : "bg-white border-black/10 text-ink-secondary hover:border-ink-primary hover:text-ink-primary"
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}

                {/* Nueva categoría */}
                {showNewCategoryInput ? (
                  <div className="flex gap-2 w-full mt-1">
                    <input
                      autoFocus
                      type="text"
                      value={newCategoryText}
                      onChange={(e) => setNewCategoryText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          const val = newCategoryText.trim()
                          if (val) { update("category", val); setShowNewCategoryInput(false) }
                        }
                        if (e.key === "Escape") setShowNewCategoryInput(false)
                      }}
                      className="flex-1 bg-white/50 border border-black/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                      placeholder="Nombre de la categoría"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newCategoryText.trim()
                        if (val) { update("category", val); setShowNewCategoryInput(false) }
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-ink-primary text-white rounded-lg"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(false)}
                      className="px-3 py-1.5 text-sm text-ink-secondary border border-black/10 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setShowNewCategoryInput(true); setNewCategoryText("") }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-black/20 text-ink-muted hover:border-ink-primary hover:text-ink-primary transition-colors"
                  >
                    + Nueva
                  </button>
                )}
              </div>

              {data.category && (
                <p className="mt-2 text-xs text-ink-secondary">
                  Seleccionada: <span className="font-medium text-ink-primary">{data.category}</span>
                  <button type="button" onClick={() => update("category", "")} className="ml-2 text-ink-muted hover:text-red-600">✕</button>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-primary mb-2">
                Descripcion
              </label>
              <textarea
                value={data.description}
                onChange={(e) => update("description", e.target.value)}
                rows={3}
                className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                placeholder="Detalle de lo que incluye"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Duracion (min)
                </label>
                <input
                  required
                  type="number"
                  min={5}
                  step={5}
                  value={data.duration}
                  onChange={(e) =>
                    update("duration", Number(e.target.value))
                  }
                  className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Precio (CLP)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={data.price}
                  onChange={(e) => update("price", Number(e.target.value))}
                  className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-primary mb-2">
                  Abono (CLP)
                </label>
                <input
                  required
                  type="number"
                  min={0}
                  step={1000}
                  value={data.deposit}
                  onChange={(e) => update("deposit", Number(e.target.value))}
                  className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-primary mb-2">
                URL de imagen (opcional)
              </label>
              <input
                type="url"
                value={data.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                placeholder="https://..."
              />
            </div>

            <label className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                checked={data.isActive}
                onChange={(e) => update("isActive", e.target.checked)}
                className="w-4 h-4 accent-ink-primary"
              />
              <span className="text-sm text-ink-primary">
                Visible en la tienda
              </span>
            </label>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          {mode === "edit" ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? "Desactivando..." : "Desactivar"}
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn-island justify-center disabled:opacity-50"
          >
            <span>{saving ? "Guardando..." : "Guardar"}</span>
            <div className="btn-island-inner-icon">
              {saving ? (
                <Loader2
                  className="w-5 h-5 text-white animate-spin"
                  strokeWidth={1.5}
                />
              ) : (
                <Save className="w-5 h-5 text-white" strokeWidth={1.5} />
              )}
            </div>
          </button>
        </div>
      </form>
    </div>
  )
}
