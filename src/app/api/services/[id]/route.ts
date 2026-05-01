import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) {
    return NextResponse.json(
      { error: "Servicio no encontrado" },
      { status: 404 }
    )
  }
  return NextResponse.json({ service })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await params
  const body = await request.json()

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = String(body.name)
  if (body.description !== undefined) data.description = body.description
  if (body.category !== undefined) data.category = body.category || null
  if (body.duration !== undefined) data.duration = Number(body.duration)
  if (body.price !== undefined) data.price = Number(body.price)
  if (body.deposit !== undefined) data.deposit = Number(body.deposit)
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl || null
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

  const service = await prisma.service.update({ where: { id }, data })
  return NextResponse.json({ service })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await params
  await prisma.service.update({
    where: { id },
    data: { isActive: false },
  })
  return NextResponse.json({ ok: true })
}
