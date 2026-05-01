import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

interface HourInput {
  weekday: number
  isOpen: boolean
  openTime: string
  closeTime: string
}

function isValidHHmm(s: unknown): s is string {
  return (
    typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
  )
}

export async function GET() {
  const hours = await prisma.businessHours.findMany({
    orderBy: { weekday: "asc" },
  })
  return NextResponse.json({ hours })
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const body = await request.json()

  if (!Array.isArray(body.hours)) {
    return NextResponse.json(
      { error: "Formato invalido: se espera { hours: [...] }" },
      { status: 400 }
    )
  }

  for (const h of body.hours as HourInput[]) {
    if (
      typeof h.weekday !== "number" ||
      h.weekday < 0 ||
      h.weekday > 6 ||
      typeof h.isOpen !== "boolean" ||
      !isValidHHmm(h.openTime) ||
      !isValidHHmm(h.closeTime)
    ) {
      return NextResponse.json(
        { error: "Entrada invalida en hours" },
        { status: 400 }
      )
    }
    if (h.openTime >= h.closeTime && h.isOpen) {
      return NextResponse.json(
        { error: "openTime debe ser menor que closeTime" },
        { status: 400 }
      )
    }
  }

  await Promise.all(
    (body.hours as HourInput[]).map((h) =>
      prisma.businessHours.upsert({
        where: { weekday: h.weekday },
        create: {
          weekday: h.weekday,
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
        },
        update: {
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
        },
      })
    )
  )

  const hours = await prisma.businessHours.findMany({
    orderBy: { weekday: "asc" },
  })
  return NextResponse.json({ hours })
}
