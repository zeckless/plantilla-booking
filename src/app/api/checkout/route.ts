import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { webpay } from "@/lib/webpay"

export const runtime = "nodejs"

interface CheckoutBody {
  serviceId: string
  date: string
  time: string
  contactInfo: {
    name: string
    lastName: string
    rut: string
    email: string
    phone: string
    notes?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CheckoutBody
    const { serviceId, date, time, contactInfo } = body

    if (
      !serviceId ||
      !date ||
      !time ||
      !contactInfo?.email ||
      !contactInfo?.name ||
      !contactInfo?.phone
    ) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      )
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Servicio no disponible" },
        { status: 404 }
      )
    }

    const [hh, mm] = time.split(":").map(Number)
    const appointmentDate = new Date(date)
    appointmentDate.setHours(hh, mm, 0, 0)

    if (appointmentDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "No se puede reservar en el pasado" },
        { status: 400 }
      )
    }

    const dayStart = new Date(appointmentDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const sameDay = await prisma.appointment.findMany({
      where: {
        date: { gte: dayStart, lt: dayEnd },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      include: { service: { select: { duration: true } } },
    })

    const slotEnd = new Date(
      appointmentDate.getTime() + service.duration * 60_000
    )
    const conflict = sameDay.some((a) => {
      const aEnd = new Date(a.date.getTime() + a.service.duration * 60_000)
      return appointmentDate < aEnd && slotEnd > a.date
    })
    if (conflict) {
      return NextResponse.json(
        { error: "Ese horario ya no esta disponible" },
        { status: 409 }
      )
    }

    const user = await prisma.user.upsert({
      where: { email: contactInfo.email },
      update: {
        name: contactInfo.name,
        lastName: contactInfo.lastName || null,
        rut: contactInfo.rut || null,
        phone: contactInfo.phone,
      },
      create: {
        email: contactInfo.email,
        name: contactInfo.name,
        lastName: contactInfo.lastName || null,
        rut: contactInfo.rut || null,
        phone: contactInfo.phone,
      },
    })

    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        userId: user.id,
        serviceId: service.id,
        notes: contactInfo.notes,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    })

    const buyOrder = appointment.id.slice(0, 26)
    const sessionId = user.id.slice(0, 61)
    const amount = service.deposit
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const returnUrl = `${baseUrl}/api/checkout/webpay/return`

    const tx = await webpay.create(buyOrder, sessionId, amount, returnUrl)

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { paymentRef: tx.token },
    })

    return NextResponse.json({
      token: tx.token,
      url: tx.url,
      appointmentId: appointment.id,
    })
  } catch (error) {
    console.error("checkout error:", error)
    return NextResponse.json(
      { error: "Error al crear transaccion" },
      { status: 500 }
    )
  }
}
