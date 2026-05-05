"use client"

import { useState } from "react"
import { Check, Loader2, Plus, Trash2, Image as ImageIcon, Video, User, Type, Share2, Pencil, Eye, EyeOff, X } from "lucide-react"
import ImageUpload from "./ImageUpload"

type Settings = {
  heroTitle: string | null
  heroSubtitle: string | null
  heroImageUrl: string | null
  showAbout: boolean
  aboutTitle: string | null
  aboutText: string | null
  aboutImageUrl: string | null
  showVideo: boolean
  videoUrl: string | null
  videoCaption: string | null
} | null

type GalleryImage = {
  id: string
  url: string
  caption: string | null
  order: number
}

type MediaPost = {
  id: string
  url: string
  embedUrl: string
  platform: string
  caption: string | null
  isPublic: boolean
  order: number
}

type Tab = "hero" | "about" | "gallery" | "social" | "video"

// ── Social Tab ────────────────────────────────────────────────────────────────
function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "tiktok") {
    return (
      <div className="shrink-0 w-8 h-8 rounded-lg bg-black flex items-center justify-center">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.75a4.85 4.85 0 01-1.02-.06z"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    </div>
  )
}

function SocialTab({ initialPosts }: { initialPosts: MediaPost[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState("")
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setAdding(true)
    setAddError(null)
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, caption }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAddError(data.error ?? "URL no reconocida")
    } else if (data.post) {
      setPosts((prev) => [...prev, data.post])
      setUrl("")
      setCaption("")
    }
    setAdding(false)
  }

  const startEdit = (post: MediaPost) => {
    setEditingId(post.id)
    setEditCaption(post.caption ?? "")
  }

  const saveEdit = async (id: string) => {
    setSaving(id)
    const res = await fetch("/api/admin/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, caption: editCaption }),
    })
    const data = await res.json()
    if (data.post) {
      setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)))
    }
    setEditingId(null)
    setSaving(null)
  }

  const toggleVisibility = async (post: MediaPost) => {
    setSaving(post.id)
    const res = await fetch("/api/admin/media", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, isPublic: !post.isPublic }),
    })
    const data = await res.json()
    if (data.post) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? data.post : p)))
    }
    setSaving(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">
        TikTok se muestra como video reproducible. Instagram aparece como tarjeta con link. Puedes ocultar publicaciones sin eliminarlas.
      </p>

      {/* Formulario agregar */}
      <form onSubmit={handleAdd} className="space-y-3 p-4 rounded-xl bg-black/[0.02] border border-black/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">Agregar publicación</p>
        <InputField
          label="URL del post / reel / video *"
          value={url}
          onChange={(v) => { setUrl(v); setAddError(null) }}
          placeholder="https://www.instagram.com/p/... o https://www.tiktok.com/@..."
        />
        <InputField
          label="Descripción (opcional)"
          value={caption}
          onChange={setCaption}
          placeholder="Resultado increíble..."
        />
        {addError && <p className="text-xs text-red-500">{addError}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !url}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
        </div>
      </form>

      {/* Lista */}
      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 py-12 text-center">
          <Share2 className="w-8 h-8 text-ink-muted mx-auto mb-2" strokeWidth={1} />
          <p className="text-sm text-ink-muted">Aún no hay publicaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className={`rounded-xl border p-3 transition-colors ${post.isPublic ? "border-black/[0.06] bg-black/[0.02]" : "border-black/[0.04] bg-black/[0.01] opacity-60"}`}
            >
              {editingId === post.id ? (
                /* Modo edición */
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} />
                  <input
                    autoFocus
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Descripción..."
                    className="flex-1 rounded-lg border border-black/[0.08] px-3 py-1.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40"
                  />
                  <button
                    onClick={() => saveEdit(post.id)}
                    disabled={saving === post.id}
                    className="w-7 h-7 rounded-lg bg-ink-primary text-white flex items-center justify-center hover:opacity-80 disabled:opacity-40"
                  >
                    {saving === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="w-7 h-7 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black/[0.04]"
                  >
                    <X className="w-3.5 h-3.5 text-ink-secondary" />
                  </button>
                </div>
              ) : (
                /* Modo vista */
                <div className="flex items-center gap-3">
                  <PlatformIcon platform={post.platform} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest ${post.platform === "tiktok" ? "text-ink-primary" : "text-[#ee2a7b]"}`}>
                        {post.platform === "tiktok" ? "TikTok" : "Instagram"}
                      </span>
                      {!post.isPublic && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">Oculto</span>
                      )}
                    </div>
                    <p className="text-xs text-ink-secondary truncate mt-0.5">
                      {post.caption || <span className="text-ink-muted italic">Sin descripción</span>}
                    </p>
                    <p className="text-[10px] text-ink-muted truncate">{post.url}</p>
                  </div>
                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Editar descripción */}
                    <button
                      onClick={() => startEdit(post)}
                      title="Editar descripción"
                      className="w-7 h-7 rounded-lg border border-black/[0.08] flex items-center justify-center hover:bg-black/[0.04] text-ink-secondary"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {/* Ocultar / Publicar */}
                    <button
                      onClick={() => toggleVisibility(post)}
                      disabled={saving === post.id}
                      title={post.isPublic ? "Ocultar del sitio" : "Publicar en el sitio"}
                      className="w-7 h-7 rounded-lg border border-black/[0.08] flex items-center justify-center hover:bg-black/[0.04] text-ink-secondary disabled:opacity-40"
                    >
                      {saving === post.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : post.isPublic
                        ? <Eye className="w-3.5 h-3.5" />
                        : <EyeOff className="w-3.5 h-3.5 text-amber-500" />}
                    </button>
                    {/* Eliminar */}
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deleting === post.id}
                      title="Eliminar"
                      className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-40"
                    >
                      {deleting === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "hero", label: "Hero", icon: Type },
  { id: "about", label: "Sobre mí", icon: User },
  { id: "gallery", label: "Galería", icon: ImageIcon },
  { id: "social", label: "Redes sociales", icon: Share2 },
  { id: "video", label: "Video YouTube", icon: Video },
]

function SaveButton({ loading, saved }: { loading: boolean; saved: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
      ) : saved ? (
        <><Check className="w-4 h-4" /> Guardado</>
      ) : "Guardar cambios"}
    </button>
  )
}

function InputField({ label, value, onChange, placeholder, multiline = false }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  multiline?: boolean
}) {
  const base = "w-full rounded-xl border border-black/[0.08] px-3.5 py-2.5 text-sm text-ink-primary focus:outline-none focus:border-ink-primary/40 transition-colors placeholder:text-ink-muted"
  return (
    <div>
      <label className="text-xs text-ink-secondary mb-1.5 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={base + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
        />
      )}
    </div>
  )
}

function Toggle({ label, description, checked, onChange }: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-ink-primary">{label}</p>
        {description && <p className="text-xs text-ink-secondary mt-0.5">{description}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-ink-primary" : "bg-black/10"}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </div>
    </label>
  )
}

// ── Hero Tab ──────────────────────────────────────────────────────────────────
function HeroTab({ settings }: { settings: Settings }) {
  const [heroTitle, setHeroTitle] = useState(settings?.heroTitle ?? "")
  const [heroSubtitle, setHeroSubtitle] = useState(settings?.heroSubtitle ?? "")
  const [heroImageUrl, setHeroImageUrl] = useState(settings?.heroImageUrl ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroTitle, heroSubtitle, heroImageUrl }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-xs text-ink-muted">
        El hero es lo primero que ven tus clientes. Si pones una foto, el layout cambia a dos columnas (texto + foto).
      </p>
      <InputField
        label="Título principal"
        value={heroTitle}
        onChange={setHeroTitle}
        placeholder="Reserva tu cita en segundos"
      />
      <InputField
        label="Subtítulo"
        value={heroSubtitle}
        onChange={setHeroSubtitle}
        placeholder="Elige el servicio, fecha y hora..."
        multiline
      />
      <div>
        <label className="text-xs text-ink-secondary mb-1.5 block">Foto del hero (opcional — aparece a la derecha del texto)</label>
        <ImageUpload value={heroImageUrl} onChange={setHeroImageUrl} aspectHint="portrait" />
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton loading={loading} saved={saved} />
      </div>
    </form>
  )
}

// ── About Tab ─────────────────────────────────────────────────────────────────
function AboutTab({ settings }: { settings: Settings }) {
  const [showAbout, setShowAbout] = useState(settings?.showAbout ?? false)
  const [aboutTitle, setAboutTitle] = useState(settings?.aboutTitle ?? "")
  const [aboutText, setAboutText] = useState(settings?.aboutText ?? "")
  const [aboutImageUrl, setAboutImageUrl] = useState(settings?.aboutImageUrl ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showAbout, aboutTitle, aboutText, aboutImageUrl }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Toggle
        label="Mostrar sección «Sobre mí»"
        description="Aparece entre los servicios y el contacto"
        checked={showAbout}
        onChange={setShowAbout}
      />
      {showAbout && (
        <>
          <InputField
            label="Título"
            value={aboutTitle}
            onChange={setAboutTitle}
            placeholder="Sobre el barbero"
          />
          <InputField
            label="Descripción"
            value={aboutText}
            onChange={setAboutText}
            placeholder="Cuéntale a tus clientes quién eres, tu experiencia, tu estilo..."
            multiline
          />
          <div>
            <label className="text-xs text-ink-secondary mb-1.5 block">Tu foto</label>
            <ImageUpload value={aboutImageUrl} onChange={setAboutImageUrl} aspectHint="portrait" />
          </div>
        </>
      )}
      <div className="flex justify-end pt-2">
        <SaveButton loading={loading} saved={saved} />
      </div>
    </form>
  )
}

// ── Gallery Tab ───────────────────────────────────────────────────────────────
function GalleryTab({ initialImages }: { initialImages: GalleryImage[] }) {
  const [images, setImages] = useState(initialImages)
  const [url, setUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setAdding(true)
    const res = await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, caption }),
    })
    const data = await res.json()
    if (data.image) {
      setImages((prev) => [...prev, data.image])
      setUrl("")
      setCaption("")
    }
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setImages((prev) => prev.filter((img) => img.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">
        Agrega fotos de tus trabajos. Pega la URL de una imagen (de Google Drive, Instagram, Cloudinary, etc.).
      </p>

      {/* Add form */}
      <form onSubmit={handleAdd} className="space-y-3 p-4 rounded-xl bg-black/[0.02] border border-black/[0.06]">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">Agregar foto</p>
        <InputField label="URL de la imagen *" value={url} onChange={setUrl} placeholder="https://..." />
        <InputField label="Descripción (opcional)" value={caption} onChange={setCaption} placeholder="Corte fade + barba" />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !url}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
        </div>
      </form>

      {/* Grid */}
      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/10 py-12 text-center">
          <ImageIcon className="w-8 h-8 text-ink-muted mx-auto mb-2" strokeWidth={1} />
          <p className="text-sm text-ink-muted">Aún no hay fotos en la galería</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative rounded-xl overflow-hidden aspect-square border border-black/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
                  <p className="text-[10px] text-white truncate">{img.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deleting === img.id}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                {deleting === img.id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Video Tab ─────────────────────────────────────────────────────────────────
function VideoTab({ settings }: { settings: Settings }) {
  const [showVideo, setShowVideo] = useState(settings?.showVideo ?? false)
  const [videoUrl, setVideoUrl] = useState(settings?.videoUrl ?? "")
  const [videoCaption, setVideoCaption] = useState(settings?.videoCaption ?? "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ showVideo, videoUrl, videoCaption }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Toggle
        label="Mostrar sección de video"
        description="Un video de YouTube entre la galería y el contacto"
        checked={showVideo}
        onChange={setShowVideo}
      />
      {showVideo && (
        <>
          <InputField
            label="URL del video de YouTube"
            value={videoUrl}
            onChange={setVideoUrl}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <InputField
            label="Pie de video (opcional)"
            value={videoCaption}
            onChange={setVideoCaption}
            placeholder="Mira cómo trabajamos"
          />
          {embedUrl && (
            <div className="rounded-xl overflow-hidden border border-black/[0.08] aspect-video">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                title="preview"
              />
            </div>
          )}
        </>
      )}
      <div className="flex justify-end pt-2">
        <SaveButton loading={loading} saved={saved} />
      </div>
    </form>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ContenidoClient({
  settings,
  images,
  mediaPosts,
}: {
  settings: Settings
  images: GalleryImage[]
  mediaPosts: MediaPost[]
}) {
  const [activeTab, setActiveTab] = useState<Tab>("hero")

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-black/[0.03] rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white text-ink-primary shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6">
        {activeTab === "hero" && <HeroTab settings={settings} />}
        {activeTab === "about" && <AboutTab settings={settings} />}
        {activeTab === "gallery" && <GalleryTab initialImages={images} />}
        {activeTab === "social" && <SocialTab initialPosts={mediaPosts} />}
        {activeTab === "video" && <VideoTab settings={settings} />}
      </div>
    </div>
  )
}
