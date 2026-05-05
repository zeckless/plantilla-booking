import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const { serviceId, datetime, name, lastName, rut, email, phone, notes, paymentReceived } = body

  if (!serviceId || !datetime || !name || !phone) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } })
  if (!service || !service.isActive) {
    return NextResponse.json({ error: "Servicio no disponible" }, { status: 404 })
  }

  const appointmentDate = new Date(datetime)
  if (isNaN(appointmentDate.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
  }

  // Check for conflicts
  const dayStart = new Date(appointmentDate); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)

  const existing = await prisma.appointment.findMany({
    where: { date: { gte: dayStart, lt: dayEnd }, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { service: { select: { duration: true } } },
  })

  const apptEnd = new Date(appointmentDate.getTime() + service.duration * 60_000)
  const conflict = existing.some((a) => {
    const aEnd = new Date(a.date.getTime() + a.service.duration * 60_000)
    return appointmentDate < aEnd && apptEnd > a.date
  })
  if (conflict) {
    return NextResponse.json({ error: "Ya existe una cita en ese horario" }, { status: 409 })
  }

  // Resolve email: use placeholder if not provided
  const resolvedEmail = email?.trim()
    ? email.trim()
    : `tel-${phone.replace(/\D/g, "")}@sin-email.local`

  const user = await prisma.user.upsert({
    where: { email: resolvedEmail },
    update: { name, lastName: lastName || null, rut: rut || null, phone },
    create: { email: resolvedEmail, name, lastName: lastName || null, rut: rut || null, phone },
  })

  const appointment = await prisma.appointment.create({
    data: {
      date: appointmentDate,
      userId: user.id,
      serviceId: service.id,
      notes: notes || null,
      status: "CONFIRMED",
      paymentStatus: paymentReceived ? "DEPOSIT_PAID" : "PENDING",
    },
    include: { user: true, service: true },
  })

  // Mark time slot as booked if it exists
  await prisma.timeSlot.updateMany({
    where: { datetime: appointmentDate, isBooked: false },
    data: { isBooked: true },
  })

  return NextResponse.json({ appointment })
}
