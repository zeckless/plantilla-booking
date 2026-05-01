import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!start || !end) {
    return NextResponse.json({ error: "start y end requeridos" }, { status: 400 })
  }

  const slots = await prisma.timeSlot.findMany({
    where: {
      datetime: {
        gte: new Date(start),
        lt: new Date(end),
      },
    },
    orderBy: { datetime: "asc" },
  })

  return NextResponse.json({ slots })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { datetime } = await request.json()
  if (!datetime) {
    return NextResponse.json({ error: "datetime requerido" }, { status: 400 })
  }

  const dt = new Date(datetime)
  if (isNaN(dt.getTime())) {
    return NextResponse.json({ error: "datetime inválido" }, { status: 400 })
  }

  try {
    const slot = await prisma.timeSlot.create({ data: { datetime: dt } })
    return NextResponse.json({ slot })
  } catch {
    return NextResponse.json({ error: "Ese horario ya existe" }, { status: 409 })
  }
}
