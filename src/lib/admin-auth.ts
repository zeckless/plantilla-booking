import { cookies } from "next/headers"

export const ADMIN_COOKIE = "admin_session"

function expectedToken(): string {
  return process.env.ADMIN_SESSION_TOKEN || "dev-session-token-change-me"
}

function expectedPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin1234"
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

export function checkAdminPassword(password: string): boolean {
  return password === expectedPassword()
}
