import Link from "next/link"
import { getBusinessSettings } from "@/lib/business-settings"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getBusinessSettings()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Reservas online
            </p>
            <p className="text-base font-semibold text-ink-primary group-hover:text-primary transition-colors">
              {settings.name}
            </p>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-ink-secondary">
            <a href="/#servicios" className="hover:text-ink-primary transition-colors">Servicios</a>
            <a href="/#contacto" className="hover:text-ink-primary transition-colors">Contacto</a>
          </nav>

          <Link href="/reservar" className="btn-island text-xs px-4 py-2">
            Reservar Turno
          </Link>
        </div>
      </header>

      {children}
    </>
  )
}
