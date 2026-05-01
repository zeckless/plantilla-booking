import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { webpay } from "@/lib/webpay"
import { sendConfirmationEmail } from "@/lib/email"

export const runtime = "nodejs"

const baseUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"

interface IncomingTokens {
  tokenWs: string | null
  tbkToken: string | null
  tbkOrden: string | null
  tbkSesion: string | null
}

async function readTokens(request: NextRequest): Promise<IncomingTokens> {
  const url = new URL(request.url)
  // GET case: tokens come as query string
  let tokenWs = url.searchParams.get("token_ws")
  let tbkToken = url.searchParams.get("TBK_TOKEN")
  let tbkOrden = url.searchParams.get("TBK_ORDEN_COMPRA")
  let tbkSesion = url.searchParams.get("TBK_ID_SESION")

  // POST case: tokens come as form data
  if (request.method === "POST") {
    try {
      const formData = await request.formData()
      tokenWs = (formData.get("token_ws") as string | null) ?? tokenWs
      tbkToken = (formData.get("TBK_TOKEN") as string | null) ?? tbkToken
      tbkOrden =
        (formData.get("TBK_ORDEN_COMPRA") as string | null) ?? tbkOrden
      tbkSesion =
        (formData.get("TBK_ID_SESION") as string | null) ?? tbkSesion
    } catch (e) {
      console.error("[webpay] failed to read formData:", e)
    }
  }

  return { tokenWs, tbkToken, tbkOrden, tbkSesion }
}

async function handle(request: NextRequest) {
  console.log(
    "[webpay] return hit — method=",
    request.method,
    "url=",
    request.url
  )

  const { tokenWs, tbkToken, tbkOrden, tbkSesion } = await readTokens(request)
  console.log("[webpay] tokens:", {
    tokenWs,
    tbkToken,
    tbkOrden,
    tbkSesion,
  })

  // User clicked "anular" / cancel inside Webpay form
  if (!tokenWs && tbkToken) {
    const appt = await prisma.appointment.findFirst({
      where: { paymentRef: tbkToken },
    })
    if (appt) {
      await prisma.appointment.update({
        where: { id: appt.id },
        data: { status: "CANCELLED" },
      })
    }
    return NextResponse.redirect(`${baseUrl()}/book/cancel?reason=user`, 303)
  }

  // Aborted/timeout: no useful tokens at all
  if (!tokenWs) {
    console.warn(
      "[webpay] no token_ws received — Webpay returned with no tokens"
    )
    return NextResponse.redirect(
      `${baseUrl()}/book/cancel?reason=timeout`,
      303
    )
  }

  // Normal flow: commit transaction
  try {
    const result = await webpay.commit(tokenWs)
    console.log("[webpay] commit result:", {
      response_code: result.response_code,
      status: result.status,
      amount: result.amount,
      buy_order: result.buy_order,
      authorization_code: result.authorization_code,
    })

    const appt = await prisma.appointment.findFirst({
      where: { paymentRef: tokenWs },
    })

    if (!appt) {
      console.error("[webpay] appointment not found for token:", tokenWs)
      return NextResponse.redirect(
        `${baseUrl()}/book/cancel?reason=not_found`,
        303
      )
    }

    if (result.response_code === 0) {
      const confirmed = await prisma.appointment.update({
        where: { id: appt.id },
        data: { status: "CONFIRMED", paymentStatus: "DEPOSIT_PAID" },
        include: { service: true, user: true },
      })

      // Send confirmation email (non-blocking)
      sendConfirmationEmail({
        to: confirmed.user.email,
        clientName: confirmed.user.name.split(" ")[0],
        serviceName: confirmed.service.name,
        date: confirmed.date,
        depositPaid: confirmed.service.deposit,
        balanceDue: confirmed.service.price - confirmed.service.deposit,
        appointmentId: confirmed.id,
      }).catch(() => {}) // already logged inside

      return NextResponse.redirect(
        `${baseUrl()}/book/success?id=${appt.id}`,
        303
      )
    }

    console.warn(
      "[webpay] transaction rejected. response_code=",
      result.response_code,
      "status=",
      result.status
    )
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { status: "CANCELLED" },
    })
    return NextResponse.redirect(
      `${baseUrl()}/book/cancel?reason=rejected`,
      303
    )
  } catch (error) {
    console.error("[webpay] commit error:", error)
    return NextResponse.redirect(`${baseUrl()}/book/cancel?reason=error`, 303)
  }
}

export async function POST(request: NextRequest) {
  return handle(request)
}

export async function GET(request: NextRequest) {
  return handle(request)
}
