"use client"

import { useRef, useState } from "react"
import { Loader2, Upload, X } from "lucide-react"

export default function ImageUpload({
  value,
  onChange,
  aspectHint,
}: {
  value: string
  onChange: (url: string) => void
  aspectHint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const upload = async (file: File) => {
    setUploading(true)
    setError(null)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Error al subir")
    } else {
      onChange(data.url)
    }
    setUploading(false)
  }

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    upload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="w-full max-w-xs space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="preview"
            className={`w-full rounded-xl object-cover border border-black/[0.08] ${aspectHint === "portrait" ? "aspect-[3/4]" : "aspect-video"}`}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-black/[0.10] text-xs font-medium text-ink-secondary hover:text-ink-primary hover:border-black/20 transition-colors disabled:opacity-40"
            >
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Cambiar foto
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="px-3 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full max-w-xs rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-colors ${
            dragging ? "border-ink-primary bg-ink-primary/5" : "border-black/[0.12] hover:border-ink-primary/40 hover:bg-black/[0.02]"
          }`}
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-ink-secondary animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-ink-muted" strokeWidth={1.5} />
              <p className="text-xs text-ink-secondary text-center px-4">
                Arrastra una foto aquí o <span className="font-semibold text-ink-primary">haz clic para elegir</span>
              </p>
              <p className="text-[10px] text-ink-muted">JPG, PNG o WebP — máx. 10 MB</p>
            </>
          )}
        </div>
      )}

      {uploading && value === "" && (
        <p className="text-xs text-ink-secondary flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo imagen...
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
