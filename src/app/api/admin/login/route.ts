import { NextRequest, NextResponse } from "next/server"
import { checkAdminPassword, setAdminSession } from "@/lib/admin-auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  if (typeof password !== "string" || !checkAdminPassword(password)) {
    return NextResponse.json(
      { error: "Contrasena incorrecta" },
      { status: 401 }
    )
  }
  await setAdminSession()
  return NextResponse.json({ ok: true })
}
