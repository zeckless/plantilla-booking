import { prisma } from "@/lib/prisma"
import { getBusinessSettings } from "@/lib/business-settings"
import Link from "next/link"
import { Clock, ArrowRight, MapPin, Phone, Mail } from "lucide-react"
import { formatCLP } from "@/lib/utils"
import ContactForm from "@/components/ContactForm"

export default async function Home() {
  const [services, settings, galleryImages, mediaPosts] = await Promise.all([
    prisma.service.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }),
    getBusinessSettings(),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" } }),
    prisma.mediaPost.findMany({ where: { isPublic: true }, orderBy: { order: "asc" } }),
  ])

  const heroTitle = settings.heroTitle || "Reserva tu cita en segundos"
  const heroSubtitle =
    settings.heroSubtitle ||
    "Elige el servicio que necesitas, selecciona fecha y hora, y paga el abono online. Te confirmamos al instante."

  const getEmbedUrl = (url: string) => {
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    return yt ? `https://www.youtube.com/embed/${yt[1]}` : null
  }

  const showAbout = settings.showAbout && !!(settings.aboutText || settings.aboutImageUrl)
  const showGallery = galleryImages.length > 0
  const showVideo = settings.showVideo && !!settings.videoUrl && !!getEmbedUrl(settings.videoUrl ?? "")

  return (
    <div className="min-h-[100dvh] bg-canvas">
      {/* ── HERO ── */}
      <section
        id="inicio"
        className={`max-w-6xl mx-auto px-6 pt-16 pb-20 ${settings.heroImageUrl ? "grid md:grid-cols-2 gap-12 items-center" : "text-center"}`}
      >
        {/* Text */}
        <div className={settings.heroImageUrl ? "" : "max-w-3xl mx-auto"}>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Turnos disponibles
          </span>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-ink-primary leading-tight mb-5">
            {heroTitle}
          </h1>
          <p className={`text-base text-ink-secondary leading-relaxed mb-8 ${settings.heroImageUrl ? "" : "max-w-xl mx-auto"}`}>
            {heroSubtitle}
          </p>
          <div className={`flex flex-col sm:flex-row gap-3 ${settings.heroImageUrl ? "" : "justify-center"}`}>
            <Link
              href="/reservar"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Reservar Turno
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl border border-black/10 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:border-black/20 transition-all"
            >
              Ver servicios
            </a>
          </div>
        </div>

        {/* Hero image */}
        {settings.heroImageUrl && (
          <div className="relative flex justify-center md:justify-end">
            <div className="w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-black/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.heroImageUrl}
                alt={settings.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" className="max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Servicios</p>
          <h2 className="text-3xl font-semibold text-ink-primary">¿Qué necesitas hoy?</h2>
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
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
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
                      <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{service.duration} min</span>
                      <span>Total {formatCLP(service.price)}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                        Abono {formatCLP(service.deposit)}
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
          <Link href="/reservar" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Reservar ahora <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── SOBRE MÍ ── */}
      {showAbout && (
        <section id="sobre-mi" className="bg-[#e8ddd6] border-t border-black/[0.06]">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className={`flex flex-col gap-10 ${settings.aboutImageUrl ? "md:flex-row md:items-center" : ""}`}>
              {/* Foto */}
              {settings.aboutImageUrl && (
                <div className="shrink-0 flex justify-center md:justify-start">
                  <div className="w-64 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden shadow-xl border-4 border-white/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.aboutImageUrl}
                      alt={settings.aboutTitle ?? "Sobre mí"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              {/* Texto */}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary/70 mb-3">
                  Sobre {settings.aboutTitle ? "la profesional" : "mí"}
                </p>
                {settings.aboutTitle && (
                  <h2 className="text-3xl md:text-4xl font-semibold text-ink-primary mb-5 leading-tight">
                    {settings.aboutTitle}
                  </h2>
                )}
                {settings.aboutText && (
                  <p className="text-base text-ink-primary/80 leading-relaxed whitespace-pre-line max-w-xl">
                    {settings.aboutText}
                  </p>
                )}
                <div className="mt-8">
                  <Link
                    href="/reservar"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ink-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Reservar turno <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── GALERÍA ── */}
      {showGallery && (
        <section id="galeria" className="border-t border-border">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Galería</p>
              <h2 className="text-3xl font-semibold text-ink-primary">Nuestros trabajos</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryImages.map((img) => (
                <div key={img.id} className="rounded-2xl overflow-hidden aspect-square border border-border group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption ?? ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {img.caption && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-xs text-white font-medium">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REDES SOCIALES ── */}
      {mediaPosts.length > 0 && (
        <section id="resultados" className="border-t border-border bg-canvas">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Redes sociales</p>
              <h2 className="text-3xl font-semibold text-ink-primary">Síguenos</h2>
              {settings.instagram && (
                <a
                  href={`https://instagram.com/${settings.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-ink-secondary hover:text-primary transition-colors"
                >
                  @{settings.instagram}
                </a>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {mediaPosts.map((post) =>
                post.platform === "tiktok" ? (
                  /* TikTok — embed inline */
                  <div key={post.id} className="w-[325px] rounded-2xl overflow-hidden border border-border shadow-sm">
                    <div className="aspect-[9/16]">
                      <iframe
                        src={post.embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                        scrolling="no"
                        title={post.caption ?? "TikTok"}
                      />
                    </div>
                    {post.caption && (
                      <div className="px-3 py-2 bg-white border-t border-border">
                        <p className="text-xs text-ink-secondary truncate">{post.caption}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Instagram — tarjeta con link */
                  <a
                    key={post.id}
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[280px] rounded-2xl border border-border shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
                  >
                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-ink-primary">Instagram</span>
                    </div>
                    <div className="flex-1 px-4 py-3">
                      {post.caption ? (
                        <p className="text-sm text-ink-secondary line-clamp-3">{post.caption}</p>
                      ) : (
                        <p className="text-sm text-ink-muted italic">Ver publicación</p>
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-border">
                      <span className="text-xs font-semibold text-[#ee2a7b] group-hover:underline">
                        Ver en Instagram →
                      </span>
                    </div>
                  </a>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── VIDEO ── */}
      {showVideo && (
        <section className="border-t border-border bg-canvas">
          <div className="max-w-4xl mx-auto px-6 py-20">
            {settings.videoCaption && (
              <div className="text-center mb-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Video</p>
                <h2 className="text-3xl font-semibold text-ink-primary">{settings.videoCaption}</h2>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden border border-border aspect-video shadow-sm">
              <iframe
                src={getEmbedUrl(settings.videoUrl!)!}
                className="w-full h-full"
                allowFullScreen
                title={settings.videoCaption ?? "Video"}
              />
            </div>
          </div>
        </section>
      )}

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
            <div className="space-y-6">
              {settings.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Dirección</p>
                    <p className="text-sm text-ink-primary">{settings.address}</p>
                  </div>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Teléfono</p>
                    <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="text-sm text-ink-primary hover:text-primary transition-colors">{settings.phone}</a>
                  </div>
                </div>
              )}
              {settings.email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-muted mb-0.5">Email</p>
                    <a href={`mailto:${settings.email}`} className="text-sm text-ink-primary hover:text-primary transition-colors">{settings.email}</a>
                  </div>
                </div>
              )}
              {settings.mapsEmbedUrl && (
                <div className="rounded-2xl overflow-hidden border border-border aspect-video">
                  <iframe src={settings.mapsEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                </div>
              )}
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
                Reservas online con pago de abono seguro.
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
                {settings.address && <li className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{settings.address}</li>}
                {settings.phone && <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 shrink-0" />{settings.phone}</li>}
                {settings.email && <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 shrink-0" />{settings.email}</li>}
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
