import Link from "next/link"
import { redirect } from "next/navigation"
import { XCircle, CheckCircle2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getKhipuPaymentStatus } from "@/lib/khipu"

const reasonText: Record<string, string> = {
  user: "Saliste del proceso de pago antes de que se confirmara.",
  rejected: "Tu pago fue rechazado.",
  timeout: "La sesión de pago expiró.",
  not_found: "No pudimos encontrar tu reserva.",
  error: "Ocurrió un error al procesar el pago.",
  no_payment: "No se recibió confirmación del pago.",
  no_token: "Token de confirmación no proporcionado.",
  invalid_token: "Token de confirmación inválido.",
  already_cancelled: "Esta cita ya fue cancelada.",
}

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; aid?: string }>
}) {
  const { reason, aid } = await searchParams

  // If we have an appointmentId, check if the payment actually went through
  if (aid) {
    const appt = await prisma.appointment.findUnique({
      where: { id: aid },
    })

    // Already confirmed (e.g. notify_url ran in production) → redirect to success
    if (appt?.status === "CONFIRMED") {
      redirect(`/book/success?id=${aid}`)
    }

    // Appointment is pending and has a paymentRef → ask Khipu if payment is done
    if (appt?.status === "PENDING" && appt.paymentRef) {
      const khipuStatus = await getKhipuPaymentStatus(appt.paymentRef)

      if (khipuStatus === "done") {
        // Confirm the appointment now
        await prisma.appointment.update({
          where: { id: aid },
          data: { status: "CONFIRMED", paymentStatus: "DEPOSIT_PAID" },
        })
        redirect(`/book/success?id=${aid}`)
      }
    }
  }

  const message = reason && reasonText[reason] ? reasonText[reason] : "El pago no se completó."

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

            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
              <p className="font-medium">¿Realizaste el pago pero llegaste aquí?</p>
              <p className="mt-1 text-amber-700">
                Si completaste la transferencia en Khipu, tu reserva puede tardar unos minutos en confirmarse. Revisa tu correo electrónico o intenta nuevamente.
              </p>
            </div>

            <Link href="/" className="btn-island w-full mt-6">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
