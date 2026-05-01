import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")

  if (!dateStr) {
    return NextResponse.json({ error: "date requerido" }, { status: 400 })
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 })
  }

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setDate(dayEnd.getDate() + 1)

  const now = new Date()

  const timeSlots = await prisma.timeSlot.findMany({
    where: {
      datetime: { gte: dayStart < now ? now : dayStart, lt: dayEnd },
      isBooked: false,
    },
    orderBy: { datetime: "asc" },
  })

  const slots = timeSlots.map((s) => {
    const d = new Date(s.datetime)
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  })

  return NextResponse.json({ slots })
}
