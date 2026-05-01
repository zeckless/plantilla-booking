"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, ArrowRight, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Error al iniciar sesion")
        setLoading(false)
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Error de conexion")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100dvh] bg-canvas flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bezel-outer">
          <div className="bezel-inner p-10 md:p-12 space-y-8 animate-reveal">
            <div className="space-y-3 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-accent-sage/40 flex items-center justify-center">
                <Lock
                  className="w-6 h-6 text-ink-primary"
                  strokeWidth={1.5}
                />
              </div>
              <div className="eyebrow mx-auto">Panel Admin</div>
              <h1 className="font-serif text-3xl tracking-tight text-ink-primary">
                Iniciar sesion
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-ink-primary mb-2"
                >
                  Contrasena
                </label>
                <input
                  required
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-3 text-ink-primary focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="btn-island w-full justify-center disabled:opacity-50"
              >
                <span>{loading ? "Verificando..." : "Entrar"}</span>
                <div className="btn-island-inner-icon">
                  {loading ? (
                    <Loader2
                      className="w-5 h-5 text-white animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ArrowRight
                      className="w-5 h-5 text-white"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
