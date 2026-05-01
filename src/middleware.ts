import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

const ADMIN_COOKIE = "admin_session"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const expected =
    process.env.ADMIN_SESSION_TOKEN || "dev-session-token-change-me"
  const session = request.cookies.get(ADMIN_COOKIE)?.value
  const isAuthed = session === expected

  if (path.startsWith("/admin") && path !== "/admin/login") {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Prevent browser from caching admin pages — ensures back button
    // forces a new server request (and thus re-checks auth)
    const response = NextResponse.next()
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate")
    response.headers.set("Pragma", "no-cache")
    return response
  }

  if (path === "/admin/login" && isAuthed) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
