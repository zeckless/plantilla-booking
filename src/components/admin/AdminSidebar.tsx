"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, Calendar, Scissors, Settings,
  LogOut, Home, AlertTriangle, Sparkles, Mail,
  Users, Layers, BookOpen, ChevronDown, BarChart2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type SubLink = { label: string; href: string; badge?: number }
type NavItem =
  | { type: "link"; href: string; label: string; icon: React.ElementType; exact?: boolean; badge?: number }
  | { type: "group"; label: string; icon: React.ElementType; children: SubLink[] }

function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
        <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-base font-semibold text-ink-primary mb-1">¿Cerrar sesión?</h2>
        <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
          Necesitarás la contraseña para volver a entrar al panel.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-black/10 text-sm font-medium text-ink-primary hover:bg-black/[0.03] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

function NavLink({ href, label, icon: Icon, exact, badge }: {
  href: string; label: string; icon: React.ElementType; exact?: boolean; badge?: number
}) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-ink-primary text-white"
          : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink-primary"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
          isActive ? "bg-white/20 text-white" : "bg-ink-primary text-white"
        )}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  )
}

function NavGroup({ label, icon: Icon, children }: {
  label: string; icon: React.ElementType; children: SubLink[]
}) {
  const pathname = usePathname()
  const isAnyActive = children.some((c) => pathname === c.href || pathname.startsWith(c.href))
  const [open, setOpen] = useState(isAnyActive)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
          isAnyActive
            ? "text-ink-primary"
            : "text-ink-secondary hover:bg-black/[0.04] hover:text-ink-primary"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 shrink-0 text-ink-muted transition-transform duration-200", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="mt-0.5 ml-[22px] pl-3.5 border-l-2 border-black/[0.07] space-y-0.5 pb-1">
          {children.map((child) => {
            const isActive = pathname === child.href ||
              (child.href !== "/admin/agenda" && pathname.startsWith(child.href))
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                  isActive
                    ? "bg-black/[0.05] text-ink-primary font-semibold"
                    : "text-ink-secondary hover:text-ink-primary hover:bg-black/[0.03] font-medium"
                )}
              >
                <span className={cn(
                  "absolute -left-[18px] w-2 h-2 rounded-full border-2 transition-colors bg-white",
                  isActive ? "border-ink-primary" : "border-black/20"
                )} />
                {child.label}
                {child.badge !== undefined && child.badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-ink-primary text-white min-w-[18px] text-center">
                    {child.badge > 99 ? "99+" : child.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminSidebar({
  businessName = "Panel Admin",
  unreadMessages = 0,
}: {
  businessName?: string
  unreadMessages?: number
}) {
  const router = useRouter()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const navItems: NavItem[] = [
    { type: "link", href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { type: "link", href: "/admin/reportes", label: "Reportes", icon: BarChart2 },
    {
      type: "group", label: "Agenda", icon: Calendar,
      children: [
        { label: "Calendario", href: "/admin/agenda" },
        { label: "Nueva cita", href: "/admin/agenda/nueva" },
        { label: "Disponibilidad", href: "/admin/slots" },
        { label: "Recordatorios", href: "/admin/recordatorios" },
      ],
    },
    {
      type: "group", label: "Clientes", icon: Users,
      children: [
        { label: "Listado", href: "/admin/clientes" },
        { label: "Consultas", href: "/admin/consultas", badge: unreadMessages },
      ],
    },
    {
      type: "group", label: "Sitio web", icon: Layers,
      children: [
        { label: "Contenido", href: "/admin/contenido" },
        { label: "Servicios", href: "/admin/services" },
        { label: "Configuración", href: "/admin/settings" },
      ],
    },
    { type: "link", href: "/admin/manual", label: "Manual de uso", icon: BookOpen },
  ]

  return (
    <>
      {showLogout && <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}

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
          <p className="text-sm font-semibold text-ink-primary mt-3 leading-tight truncate">{businessName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) =>
            item.type === "link" ? (
              <NavLink key={item.href} {...item} />
            ) : (
              <NavGroup key={i} label={item.label} icon={item.icon} children={item.children} />
            )
          )}
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
