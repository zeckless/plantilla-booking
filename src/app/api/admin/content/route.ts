import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function GET() {
  const settings = await prisma.businessSettings.findFirst()
  return NextResponse.json({ settings })
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()

  // Solo actualiza los campos que vienen en el body (cada tab guarda solo los suyos)
  const data: Record<string, unknown> = {}
  if ("heroTitle"     in body) data.heroTitle     = body.heroTitle     || null
  if ("heroSubtitle"  in body) data.heroSubtitle  = body.heroSubtitle  || null
  if ("heroImageUrl"  in body) data.heroImageUrl  = body.heroImageUrl  || null
  if ("showAbout"     in body) data.showAbout     = Boolean(body.showAbout)
  if ("aboutTitle"    in body) data.aboutTitle    = body.aboutTitle    || null
  if ("aboutText"     in body) data.aboutText     = body.aboutText     || null
  if ("aboutImageUrl" in body) data.aboutImageUrl = body.aboutImageUrl || null
  if ("showVideo"     in body) data.showVideo     = Boolean(body.showVideo)
  if ("videoUrl"      in body) data.videoUrl      = body.videoUrl      || null
  if ("videoCaption"  in body) data.videoCaption  = body.videoCaption  || null

  const existing = await prisma.businessSettings.findFirst()

  const settings = existing
    ? await prisma.businessSettings.update({ where: { id: existing.id }, data })
    : await prisma.businessSettings.create({ data: { name: "Mi Negocio", ...data } })

  return NextResponse.json({ settings })
}
