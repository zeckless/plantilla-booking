import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const slot = await prisma.timeSlot.findUnique({ where: { id } })

  if (!slot) {
    return NextResponse.json({ error: "Slot no encontrado" }, { status: 404 })
  }

  if (slot.isBooked) {
    return NextResponse.json(
      { error: "No se puede eliminar un turno ya reservado" },
      { status: 409 }
    )
  }

  await prisma.timeSlot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
