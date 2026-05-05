"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"

type NavLink = { label: string; href: string }

export default function Navbar({
  businessName,
  showAbout,
  showGallery,
}: {
  businessName: string
  showAbout: boolean
  showGallery: boolean
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links: NavLink[] = [
    { label: "Inicio", href: "#inicio" },
    { label: "Servicios", href: "#servicios" },
    ...(showAbout ? [{ label: "Sobre mí", href: "#sobre-mi" }] : []),
    ...(showGallery ? [{ label: "Galería", href: "#galeria" }] : []),
    { label: "Contacto", href: "#contacto" },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-black/[0.06]" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="#inicio" className="text-sm font-semibold text-ink-primary tracking-tight shrink-0">
          {businessName}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-black/[0.04] transition-all"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <Link
          href="/reservar"
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Reservar Turno
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-black/[0.06] px-6 py-4 space-y-1">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-black/[0.04] transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <Link
              href="/reservar"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink-primary text-white text-sm font-semibold"
            >
              Reservar Turno <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
