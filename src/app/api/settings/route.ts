import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getBusinessSettings } from "@/lib/business-settings"

export const runtime = "nodejs"

export async function GET() {
  const settings = await getBusinessSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const settings = await getBusinessSettings()

  const updated = await prisma.businessSettings.update({
    where: { id: settings.id },
    data: {
      name: body.name ?? settings.name,
      address: body.address ?? settings.address,
      phone: body.phone ?? settings.phone,
      email: body.email ?? settings.email,
      instagram: body.instagram ?? settings.instagram,
      mapsEmbedUrl: body.mapsEmbedUrl ?? settings.mapsEmbedUrl,
    },
  })

  revalidatePath("/", "layout")
  return NextResponse.json({ settings: updated })
}
