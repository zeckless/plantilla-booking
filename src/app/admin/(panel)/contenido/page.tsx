import { prisma } from "@/lib/prisma"
import ContenidoClient from "@/components/admin/ContenidoClient"

export default async function ContenidoPage() {
  const [settings, images, mediaPosts] = await Promise.all([
    prisma.businessSettings.findFirst(),
    prisma.galleryImage.findMany({ orderBy: { order: "asc" } }),
    prisma.mediaPost.findMany({ orderBy: { order: "asc" } }),
  ])

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Panel</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Contenido del sitio</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Edita los textos, la sección sobre ti, la galería de trabajos y las redes sociales.
        </p>
      </div>

      <ContenidoClient settings={settings} images={images} mediaPosts={mediaPosts} />
    </div>
  )
}
