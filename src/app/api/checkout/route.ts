import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createKhipuPayment } from "@/lib/khipu"
import { randomBytes } from "crypto"

export const runtime = "nodejs"

function generateToken(): string {
  return randomBytes(32).toString("hex")
}

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

    // Upsert user fuera de la transacción (no afecta la disponibilidad del slot)
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

    const confirmToken = generateToken()
    const cancelToken = generateToken()

    // Transacción atómica: verificar disponibilidad + crear cita + bloquear slot
    // Si dos personas reservan el mismo horario al mismo instante, solo una gana
    const appointment = await prisma.$transaction(async (tx) => {
      // Re-verificar dentro de la transacción para evitar race condition
      const slotConflict = await tx.appointment.findFirst({
        where: {
          date: appointmentDate,
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      })
      if (slotConflict) {
        throw new Error("SLOT_TAKEN")
      }

      const newAppointment = await tx.appointment.create({
        data: {
          date: appointmentDate,
          userId: user.id,
          serviceId: service.id,
          notes: contactInfo.notes,
          status: "PENDING",
          paymentStatus: "PENDING",
          confirmToken,
          cancelToken,
        },
      })

      await tx.timeSlot.updateMany({
        where: { datetime: appointmentDate, isBooked: false },
        data: { isBooked: true },
      })

      return newAppointment
    })

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"
    const returnUrl = `${baseUrl}/api/checkout/khipu/return`
    const cancelUrl = `${baseUrl}/book/cancel?reason=user&aid=${appointment.id}`
    const isLocal = baseUrl.includes("localhost")

    let paymentUrl: string
    let paymentId: string
    try {
      ;({ paymentUrl, paymentId } = await createKhipuPayment({
        amount: service.deposit,
        subject: `Abono ${service.name} - ${contactInfo.name}${contactInfo.lastName ? ` ${contactInfo.lastName}` : ""}`,
        appointmentId: appointment.id,
        payerName: `${contactInfo.name}${contactInfo.lastName ? ` ${contactInfo.lastName}` : ""}`,
        payerEmail: contactInfo.email,
        returnUrl,
        cancelUrl,
        notifyUrl: isLocal ? undefined : `${baseUrl}/api/checkout/khipu/notify`,
      }))
    } catch (khipuError) {
      // Si falla el pago, revertir: eliminar cita y liberar el slot
      await prisma.appointment.delete({ where: { id: appointment.id } })
      await prisma.timeSlot.updateMany({
        where: { datetime: appointmentDate },
        data: { isBooked: false },
      })
      throw khipuError
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { paymentRef: paymentId },
    })

    return NextResponse.json({
      paymentUrl,
      paymentId,
      appointmentId: appointment.id,
    })
  } catch (error) {
    if (error instanceof Error && error.message === "SLOT_TAKEN") {
      return NextResponse.json(
        { error: "Ese horario acaba de ser reservado por otra persona. Por favor elige otro." },
        { status: 409 }
      )
    }
    console.error("checkout error:", error)
    return NextResponse.json(
      { error: "Error al crear transaccion" },
      { status: 500 }
    )
  }
}
