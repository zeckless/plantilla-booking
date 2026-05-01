import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2 } from "lucide-react"
import { formatCLP } from "@/lib/utils"

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  const appointment = id
    ? await prisma.appointment.findUnique({
        where: { id },
        include: { service: true, user: true },
      })
    : null

  return (
    <main className="min-h-[100dvh] bg-canvas py-16 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 md:p-10 animate-reveal">
            <div className="w-12 h-12 rounded-full bg-primary-soft flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
              Reserva confirmada
            </h1>
            <p className="text-sm text-ink-secondary mt-2">
              Te enviamos los detalles a tu correo.
            </p>

            {appointment && (
              <div className="mt-6 rounded-xl border border-border p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Servicio</span>
                  <span className="font-medium text-ink-primary">
                    {appointment.service.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Fecha</span>
                  <span className="font-medium text-ink-primary capitalize">
                    {format(
                      appointment.date,
                      "EEEE d 'de' MMMM, HH:mm 'hrs'",
                      { locale: es }
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-ink-secondary">Abono pagado</span>
                  <span className="font-medium text-ink-primary">
                    {formatCLP(appointment.service.deposit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Saldo en local</span>
                  <span className="font-medium text-ink-primary">
                    {formatCLP(
                      appointment.service.price -
                        appointment.service.deposit
                    )}
                  </span>
                </div>
              </div>
            )}

            <Link href="/" className="btn-island w-full mt-6">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
