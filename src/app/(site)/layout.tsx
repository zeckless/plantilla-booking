import Link from "next/link"
import { getBusinessSettings } from "@/lib/business-settings"
import MobileMenu from "@/components/MobileMenu"

const NAV_LINKS = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Sobre mí", href: "/#sobre-mi" },
  { label: "Resultados", href: "/#galeria" },
  { label: "Contacto", href: "/#contacto" },
]

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getBusinessSettings()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link href="/" className="group shrink-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary">
              Reservas online
            </p>
            <p className="text-base font-semibold text-ink-primary group-hover:text-primary transition-colors">
              {settings.name}
            </p>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-black/[0.04] transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/reservar" className="btn-island text-xs px-4 py-2 hidden sm:inline-flex">
              Reservar Turno
            </Link>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </div>
      </header>

      {children}
    </>
  )
}
