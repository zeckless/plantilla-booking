import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendConfirmationEmail } from "@/lib/email"

export const runtime = "nodejs"

const baseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

// Khipu v3 redirects to return_url?payment_id=xxx after successful payment
// and to cancel_url directly when user cancels (no params)
async function handle(request: NextRequest) {
  const url = new URL(request.url)
  const paymentId = url.searchParams.get("payment_id")

  console.log("[khipu] return hit — params:", Object.fromEntries(url.searchParams))

  if (!paymentId) {
    // No payment_id means something went wrong or user got here incorrectly
    return NextResponse.redirect(`${baseUrl()}/book/cancel?reason=no_payment`, 303)
  }

  try {
    const appt = await prisma.appointment.findFirst({
      where: { paymentRef: paymentId },
    })

    if (!appt) {
      console.error("[khipu] appointment not found for paymentId:", paymentId)
      return NextResponse.redirect(`${baseUrl()}/book/cancel?reason=not_found`, 303)
    }

    // Avoid double-confirming if notify already ran
    if (appt.status === "CONFIRMED") {
      return NextResponse.redirect(`${baseUrl()}/book/success?id=${appt.id}`, 303)
    }

    const confirmed = await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "CONFIRMED", paymentStatus: "DEPOSIT_PAID" },
      include: { service: true, user: true },
    })

    sendConfirmationEmail({
      to: confirmed.user.email,
      clientName: confirmed.user.name,
      serviceName: confirmed.service.name,
      date: confirmed.date,
      depositPaid: confirmed.service.deposit,
      balanceDue: confirmed.service.price - confirmed.service.deposit,
      appointmentId: confirmed.id,
      duration: confirmed.service.duration,
      confirmToken: confirmed.confirmToken || "",
      cancelToken: confirmed.cancelToken || "",
    }).catch(() => {})

    return NextResponse.redirect(`${baseUrl()}/book/success?id=${appt.id}`, 303)
  } catch (error) {
    console.error("[khipu] error confirming:", error)
    return NextResponse.redirect(`${baseUrl()}/book/cancel?reason=error`, 303)
  }
}

export async function GET(request: NextRequest) {
  return handle(request)
}
