"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"

export default function MobileMenu({ links }: { links: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
        aria-label="Menú"
      >
        {open ? <X className="w-5 h-5 text-ink-primary" /> : <Menu className="w-5 h-5 text-ink-primary" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[69px] bg-white border-b border-border shadow-lg px-6 py-4 space-y-1 z-50">
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
          <div className="pt-2 border-t border-border mt-2">
            <Link
              href="/reservar"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-ink-primary text-white text-sm font-semibold"
            >
              Reservar Turno <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
