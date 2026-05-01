"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Scissors,
  Settings,
  LogOut,
  Home,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/agenda", label: "Agenda", icon: Calendar },
  { href: "/admin/slots", label: "Disponibilidad", icon: CalendarPlus },
  { href: "/admin/services", label: "Servicios", icon: Scissors },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-black/8 shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-ink-primary mb-1">¿Cerrar sesión?</h2>
        <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
          Necesitarás la contraseña para volver a entrar al panel.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ink-primary hover:bg-black/[0.03] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSidebar({ businessName = "Panel Admin" }: { businessName?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <>
      {showLogout && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />
      )}

      <aside className="w-60 shrink-0 border-r border-black/[0.06] bg-white h-[100dvh] sticky top-0 flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-7 pb-6 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-ink-primary flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-secondary">
              Panel admin
            </p>
          </div>
          <p className="text-sm font-semibold text-ink-primary mt-3 leading-tight truncate">
            {businessName}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-ink-primary text-white"
                    : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink-primary"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-black/[0.06] space-y-0.5">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-secondary hover:bg-black/[0.04] hover:text-ink-primary transition-all"
          >
            <Home className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Ver sitio
          </Link>
          <button
            onClick={() => setShowLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-secondary hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
