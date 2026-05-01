import Link from "next/link"
import { XCircle } from "lucide-react"

const reasonText: Record<string, string> = {
  user: "Cancelaste el pago en Webpay.",
  rejected: "Tu pago fue rechazado por el banco.",
  timeout: "La sesion de pago expiro.",
  not_found: "No pudimos encontrar tu reserva.",
  error: "Ocurrio un error al procesar el pago.",
}

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const message =
    reason && reasonText[reason]
      ? reasonText[reason]
      : "El pago no se completo."

  return (
    <main className="min-h-[100dvh] bg-canvas py-16 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="bezel-outer">
          <div className="bezel-inner p-8 md:p-10 animate-reveal">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <XCircle className="w-6 h-6 text-red-600" strokeWidth={2} />
            </div>

            <h1 className="text-2xl font-semibold text-ink-primary tracking-tight">
              Pago no completado
            </h1>
            <p className="text-sm text-ink-secondary mt-2">{message}</p>
            <p className="text-sm text-ink-secondary mt-1">
              Tu reserva no fue confirmada. Puedes intentarlo de nuevo.
            </p>

            <Link href="/" className="btn-island w-full mt-6">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
