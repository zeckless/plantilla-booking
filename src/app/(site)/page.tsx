import { prisma } from "@/lib/prisma"
import { getBusinessSettings } from "@/lib/business-settings"
import Image from "next/image"
import Link from "next/link"
import { Clock, ArrowRight, MapPin, Phone, Mail } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import ContactForm from "@/components/ContactForm"

export default async function Home() {
  const [services, settings] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    getBusinessSettings(),
  ])

  return (
    <div className="min-h-[100dvh] bg-canvas">
      {/* ── HERO ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
          Agenda online · Pago seguro
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink-primary leading-tight">
          Reserva tu cita<br className="hidden sm:block" /> en segundos
        </h1>
        <p className="text-base text-ink-secondary mt-5 max-w-xl mx-auto leading-relaxed">
          Elige el servicio que necesitas, selecciona fecha y hora, y paga la
          seña online. Te confirmamos al instante.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/reservar" className="btn-island px-8 py-3 text-sm w-full sm:w-auto justify-center">
            Reservar Turno
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#contacto" className="btn-island-secondary px-8 py-3 text-sm w-full sm:w-auto justify-center">
            Contacto
          </a>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="max-w-3xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Servicios</p>
            <h2 className="text-2xl font-semibold text-ink-primary">¿Qué necesitas hoy?</h2>
          </div>
          <p className="text-xs text-ink-secondary">
            {services.length} {services.length === 1 ? "servicio" : "servicios"}
          </p>
        </div>

        {services.length === 0 ? (
          <div className="bezel-outer">
            <div className="bezel-inner p-12 text-center">
              <p className="text-sm text-ink-secondary">Todavía no hay servicios disponibles. Vuelve pronto.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <Link key={service.id} href="/reservar" className="group block bezel-outer hover:border-primary transition-colors">
                <div className="bezel-inner p-5 md:p-6 flex gap-5 items-center">
                  {service.imageUrl ? (
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0">
                      <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="80px" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary-soft shrink-0 flex items-center justify-center">
                      <span className="text-primary text-2xl font-semibold">{service.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {service.category && (
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">{service.category}</p>
                    )}
                    <h3 className="text-base md:text-lg font-semibold text-ink-primary truncate">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-ink-secondary mt-0.5 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-ink-secondary">
                      <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {service.duration} min</span>
                      <span>Total {formatCLP(service.price)}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                        Seña {formatCLP(service.deposit)}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary shrink-0 group-hover:gap-2 transition-all">
                    Reservar <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/reservar" className="btn-island px-8 py-3 text-sm">
            Ver todos y reservar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="bg-white border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Contacto</p>
            <h2 className="text-3xl font-semibold text-ink-primary">¿Tienes alguna consulta?</h2>
            <p className="text-sm text-ink-secondary mt-2 max-w-md mx-auto">
              Completa el formulario y te respondemos pronto.
            </p>
          </div>
          <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Dirección</p>
                    <p className="text-sm text-ink-primary">{settings.address || "Tu dirección aquí, Ciudad"}</p>
                  </div>
                </div>
                {settings.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Teléfono</p>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-sm text-ink-primary hover:text-primary">{settings.phone}</a>
                  </div>
                </div>
                )}
                {settings.email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-sm text-ink-primary hover:text-primary">{settings.email}</a>
                  </div>
                </div>
                )}
              </div>
              <div className="rounded-2xl overflow-hidden border border-border aspect-video bg-canvas flex items-center justify-center">
                {settings.mapsEmbedUrl ? (
                  <iframe src={settings.mapsEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                ) : (
                  <p className="text-xs text-ink-muted text-center px-4">Agrega el embed de Google Maps en Configuración</p>
                )}
              </div>
            </div>
            <ContactForm services={services.map((s) => ({ name: s.name }))} />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-ink-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">{settings.name}</p>
              <p className="text-sm text-white/70 leading-relaxed">
                Reservas online con pago de seña seguro mediante Webpay Plus · Transbank.
              </p>
              {settings.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs text-white/50 hover:text-white/80 transition-colors"
                >
                  @{settings.instagram}
                </a>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Servicios</p>
              <ul className="space-y-2">
                {services.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <Link href="/reservar" className="text-sm text-white/70 hover:text-white transition-colors">{s.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">Contacto</p>
              <ul className="space-y-2 text-sm text-white/70">
                {settings.address && <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 shrink-0" /> {settings.address}</li>}
                {settings.phone && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" /> {settings.phone}</li>}
                {settings.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" /> {settings.email}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
            <p>© {new Date().getFullYear()} {settings.name}. Todos los derechos reservados.</p>
            <Link href="/admin/login" className="hover:text-white/70 transition-colors">Acceso staff</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
