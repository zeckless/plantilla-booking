import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import type { Prisma } from "@/generated/prisma/client"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const date = searchParams.get("date")
  const status = searchParams.get("status")
  const range = searchParams.get("range")

  const where: Prisma.AppointmentWhereInput = {}

  if (date) {
    const d = new Date(date)
    const start = new Date(d)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    if (range === "week") {
      end.setDate(end.getDate() + 7)
    } else {
      end.setDate(end.getDate() + 1)
    }
    where.date = { gte: start, lt: end }
  }

  if (status) {
    where.status = status as Prisma.AppointmentWhereInput["status"]
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: { user: true, service: true },
    orderBy: { date: "asc" },
  })

  return NextResponse.json({ appointments })
}
