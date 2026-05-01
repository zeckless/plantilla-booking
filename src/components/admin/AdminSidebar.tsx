"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Clock,
  Settings,
  LogOut,
  Home,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/agenda", label: "Agenda", icon: Calendar },
  { href: "/admin/services", label: "Servicios", icon: Scissors },
  { href: "/admin/business-hours", label: "Horarios", icon: Clock },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-8 max-w-sm w-full mx-4 animate-reveal">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-ink-primary mb-1">¿Cerrar sesión?</h2>
        <p className="text-sm text-ink-secondary mb-6">
          Serás redirigido al login. Necesitarás la contraseña para volver a entrar.
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
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
          >
            Sí, cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <>
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}

      <aside className="w-64 border-r border-black/5 bg-surface-inner h-[100dvh] sticky top-0 flex flex-col">
        <div className="p-6 border-b border-black/5">
          <p className="eyebrow w-max">Panel Admin</p>
          <h1 className="font-serif text-2xl mt-3 text-ink-primary">
            Administración
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href)
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-fluid",
                  isActive
                    ? "bg-ink-primary text-white"
                    : "text-ink-secondary hover:bg-black/[0.03] hover:text-ink-primary"
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="font-medium">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-black/5 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink-secondary hover:bg-black/[0.03] hover:text-ink-primary transition-all"
          >
            <Home className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium">Ver sitio</span>
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-ink-secondary hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
