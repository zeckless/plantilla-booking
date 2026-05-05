import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } })
  return NextResponse.json({ messages })
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id, read } = await request.json()
  const msg = await prisma.contactMessage.update({ where: { id }, data: { read } })
  return NextResponse.json({ message: msg })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await request.json()
  await prisma.contactMessage.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
