import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Pencil, Eye, EyeOff } from "lucide-react"
import { formatCLP } from "@/lib/utils"

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8 animate-reveal">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow w-max mb-4">Catalogo</p>
          <h1 className="font-serif text-4xl tracking-tight text-ink-primary">
            Servicios
          </h1>
        </div>
        <Link href="/admin/services/new" className="btn-island">
          <span>Nuevo servicio</span>
          <div className="btn-island-inner-icon">
            <Plus className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="bezel-outer">
          <div className="bezel-inner p-12 text-center space-y-3">
            <p className="text-ink-secondary">
              Aun no tienes servicios cargados.
            </p>
            <Link
              href="/admin/services/new"
              className="text-sm font-medium text-ink-primary underline"
            >
              Crea el primero
            </Link>
          </div>
        </div>
      ) : (
        <div className="bezel-outer">
          <div className="bezel-inner overflow-hidden">
            <table className="w-full">
              <thead className="bg-black/[0.02] border-b border-black/5">
                <tr className="text-left text-xs uppercase tracking-widest text-ink-secondary">
                  <th className="px-6 py-4 font-medium">Servicio</th>
                  <th className="px-6 py-4 font-medium">Duracion</th>
                  <th className="px-6 py-4 font-medium">Precio</th>
                  <th className="px-6 py-4 font-medium">Abono</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 w-16" />
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink-primary">
                        {s.name}
                      </p>
                      {s.description && (
                        <p className="text-xs text-ink-secondary line-clamp-1 max-w-md">
                          {s.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-secondary">
                      {s.duration} min
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-primary">
                      {formatCLP(s.price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-primary">
                      {formatCLP(s.deposit)}
                    </td>
                    <td className="px-6 py-4">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full font-medium">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary bg-black/5 px-3 py-1 rounded-full font-medium">
                          <EyeOff className="w-3 h-3" /> Oculto
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="p-2 rounded-full hover:bg-black/5 transition-colors inline-flex"
                      >
                        <Pencil className="w-4 h-4 text-ink-primary" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
