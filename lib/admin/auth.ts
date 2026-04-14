import { cookies, headers } from "next/headers"

const ADMIN_COOKIE_NAME = "admin_session"
const SESSION_DURATION = 60 * 60 * 24 // 24 hours in seconds

export async function verifyAdminSession(): Promise<boolean> {
  try {
    // Check for dev bypass header (only in development)
    if (process.env.NODE_ENV === "development") {
      const headersList = await headers()
      const devBypass = headersList.get("x-admin-dev-bypass")
      if (devBypass === process.env.ADMIN_PASSWORD) {
        return true
      }
    }
    
    const cookieStore = await cookies()
    const session = cookieStore.get(ADMIN_COOKIE_NAME)
    
    if (!session?.value) {
      return false
    }
    
    const decoded = Buffer.from(session.value, "base64").toString()
    const [password, timestamp] = decoded.split(":")
    const sessionTime = parseInt(timestamp, 10)
    
    // Check if session is expired
    if (Date.now() - sessionTime > SESSION_DURATION * 1000) {
      return false
    }
    
    // Verify password
    return password === process.env.ADMIN_PASSWORD
  } catch {
    return false
  }
}

export async function createAdminSession(): Promise<string> {
  const sessionData = `${process.env.ADMIN_PASSWORD}:${Date.now()}`
  return Buffer.from(sessionData).toString("base64")
}

export function getSessionCookieOptions() {
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_DURATION,
    path: "/",
  }
}
