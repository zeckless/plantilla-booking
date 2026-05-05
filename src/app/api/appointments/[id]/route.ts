import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

const ALLOWED_STATUS = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const

type Status = (typeof ALLOWED_STATUS)[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  if (body.status && !ALLOWED_STATUS.includes(body.status)) {
    return NextResponse.json({ error: "Estado invalido" }, { status: 400 })
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status as Status } : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
      ...(body.reminderSent !== undefined ? { reminderSent: body.reminderSent } : {}),
    },
    include: { user: true, service: true },
  })

  // If cancelled, free up the time slot so it can be booked again
  if (body.status === "CANCELLED" || body.status === "NO_SHOW") {
    await prisma.timeSlot.updateMany({
      where: { datetime: updated.date, isBooked: true },
      data: { isBooked: false },
    })
  }

  return NextResponse.json({ appointment: updated })
}
