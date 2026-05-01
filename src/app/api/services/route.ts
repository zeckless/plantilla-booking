import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const includeInactive = searchParams.get("includeInactive") === "true"
  const where = includeInactive ? {} : { isActive: true }
  const services = await prisma.service.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ services })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const body = await request.json()

  if (
    !body.name ||
    body.duration === undefined ||
    body.price === undefined ||
    body.deposit === undefined
  ) {
    return NextResponse.json(
      { error: "Datos incompletos: name, duration, price, deposit" },
      { status: 400 }
    )
  }

  const service = await prisma.service.create({
    data: {
      name: String(body.name),
      description: body.description ?? null,
      category: body.category || null,
      duration: Number(body.duration),
      price: Number(body.price),
      deposit: Number(body.deposit),
      imageUrl: body.imageUrl || null,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json({ service }, { status: 201 })
}
