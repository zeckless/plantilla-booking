import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = new URL(request.url).searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?reason=no_token`,
      303
    )
  }

  try {
    const appt = await prisma.appointment.findUnique({ where: { id } })

    if (!appt) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?reason=not_found`,
        303
      )
    }

    if (appt.confirmToken !== token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?reason=invalid_token`,
        303
      )
    }

    if (appt.status === "CANCELLED") {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?reason=already_cancelled`,
        303
      )
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" },
    })

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/book/success?id=${appt.id}`,
      303
    )
  } catch (error) {
    console.error("[confirm] error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?reason=error`,
      303
    )
  }
}
