import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    orderBy: { order: "asc" },
  })
  return NextResponse.json({ images })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { url, caption } = await request.json()
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 })

  const count = await prisma.galleryImage.count()
  const image = await prisma.galleryImage.create({
    data: { url, caption: caption ?? null, order: count },
  })
  return NextResponse.json({ image }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })

  await prisma.galleryImage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
