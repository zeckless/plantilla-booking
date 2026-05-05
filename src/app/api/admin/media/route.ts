import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isAdminAuthenticated } from "@/lib/admin-auth"

export const runtime = "nodejs"

function parseMediaUrl(url: string): { platform: string; embedUrl: string } | null {
  // Instagram post: /p/{id}
  const igPost = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/)
  if (igPost) return { platform: "instagram", embedUrl: `https://www.instagram.com/p/${igPost[1]}/embed/` }

  // Instagram reel: /reel/{id}
  const igReel = url.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/)
  if (igReel) return { platform: "instagram", embedUrl: `https://www.instagram.com/reel/${igReel[1]}/embed/` }

  // TikTok: /video/{id}
  const tt = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/)
  if (tt) return { platform: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${tt[1]}` }

  return null
}

export async function GET() {
  const posts = await prisma.mediaPost.findMany({ orderBy: { order: "asc" } })
  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { url, caption } = await request.json()
  if (!url) return NextResponse.json({ error: "URL requerida" }, { status: 400 })

  const parsed = parseMediaUrl(url.trim())
  if (!parsed) {
    return NextResponse.json(
      { error: "URL no reconocida. Pega un link de Instagram (post o reel) o TikTok." },
      { status: 400 }
    )
  }

  const count = await prisma.mediaPost.count()
  const post = await prisma.mediaPost.create({
    data: { url: url.trim(), embedUrl: parsed.embedUrl, platform: parsed.platform, caption: caption || null, order: count },
  })
  return NextResponse.json({ post }, { status: 201 })
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id, caption, isPublic } = await request.json()
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 })
  const post = await prisma.mediaPost.update({
    where: { id },
    data: {
      ...(caption !== undefined && { caption: caption || null }),
      ...(isPublic !== undefined && { isPublic }),
    },
  })
  return NextResponse.json({ post })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  const { id } = await request.json()
  await prisma.mediaPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
