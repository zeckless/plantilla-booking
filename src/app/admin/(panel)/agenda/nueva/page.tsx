import { prisma } from "@/lib/prisma"
import NuevaCitaForm from "@/components/admin/NuevaCitaForm"

export default async function NuevaCitaPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, duration: true, price: true, deposit: true },
  })

  return (
    <div className="space-y-6 animate-reveal">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-secondary mb-1">Agenda</p>
        <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">Nueva cita</h1>
        <p className="text-sm text-ink-secondary mt-1">
          Crea una cita manualmente para un cliente que reservó por teléfono o en persona.
        </p>
      </div>

      <NuevaCitaForm services={services} />
    </div>
  )
}
