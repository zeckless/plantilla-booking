import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAvailableSlots } from "@/lib/availability"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get("serviceId")
  const dateStr = searchParams.get("date")

  if (!serviceId || !dateStr) {
    return NextResponse.json(
      { error: "Parametros requeridos: serviceId, date" },
      { status: 400 }
    )
  }

  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Fecha invalida" }, { status: 400 })
  }

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  })
  if (!service) {
    return NextResponse.json(
      { error: "Servicio no encontrado" },
      { status: 404 }
    )
  }

  const businessHours = await prisma.businessHours.findMany()

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: dayStart, lt: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { service: { select: { duration: true } } },
  })

  const slots = getAvailableSlots({
    date,
    serviceDuration: service.duration,
    businessHours,
    appointments: appointments.map((a) => ({
      date: a.date,
      duration: a.service.duration,
    })),
  })

  return NextResponse.json({ slots })
}
