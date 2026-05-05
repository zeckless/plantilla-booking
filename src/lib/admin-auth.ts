import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export const ADMIN_COOKIE = "admin_session"

// Default hash for "admin1234" — override with ADMIN_PASSWORD_HASH in production
const DEFAULT_HASH = "$2b$12$EEFK9kvM8OfjOEo.e9Du0u1xzZhjTWt8CNUk78MxSMp9Dc5lBb.TG"

function expectedToken(): string {
  return process.env.ADMIN_SESSION_TOKEN || "dev-session-token-change-me"
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const c = await cookies()
  return c.get(ADMIN_COOKIE)?.value === expectedToken()
}

export async function setAdminSession() {
  const c = await cookies()
  c.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearAdminSession() {
  const c = await cookies()
  c.delete(ADMIN_COOKIE)
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH
  return bcrypt.compare(password, hash)
}
