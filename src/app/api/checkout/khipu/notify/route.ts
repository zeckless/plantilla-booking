import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyKhipuSignature } from "@/lib/khipu"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature =
      request.headers.get("x-signature") ||
      request.headers.get("X-Signature") ||
      ""

    if (!verifyKhipuSignature(rawBody, signature)) {
      console.warn("[khipu] invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const data = JSON.parse(rawBody)
    console.log("[khipu] notify:", data)

    const { id: paymentId, status, amount, custom } = data

    if (status === "done" && paymentId && custom) {
      await prisma.appointment.update({
        where: { id: custom },
        data: { status: "CONFIRMED", paymentStatus: "DEPOSIT_PAID" },
      })
    }

    if (status === "failed" && custom) {
      await prisma.appointment.update({
        where: { id: custom },
        data: { status: "CANCELLED" },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[khipu] notify error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
