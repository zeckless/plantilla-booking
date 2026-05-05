import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { name, email, phone, service, message } = await request.json()
  if (!name || !message) {
    return NextResponse.json({ error: "Nombre y mensaje requeridos" }, { status: 400 })
  }
  await prisma.contactMessage.create({
    data: { name, email: email || null, phone: phone || null, service: service || null, message },
  })
  return NextResponse.json({ ok: true })
}
