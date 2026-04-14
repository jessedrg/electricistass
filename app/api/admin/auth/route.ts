import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createAdminSession, getSessionCookieOptions, verifyAdminSession } from "@/lib/admin/auth"

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD no configurada" },
        { status: 500 }
      )
    }
    
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      )
    }
    
    const session = await createAdminSession()
    const cookieOptions = getSessionCookieOptions()
    
    // Create response with Set-Cookie header
    const response = NextResponse.json({ success: true })
    response.cookies.set(cookieOptions.name, session, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    })
    
    return response
  } catch {
    return NextResponse.json(
      { error: "Error al iniciar sesión" },
      { status: 500 }
    )
  }
}

// GET - Check session
export async function GET(request: NextRequest) {
  // First check the normal cookie-based session
  let isValid = await verifyAdminSession()
  
  // If not valid and in development, check the dev bypass header
  if (!isValid && process.env.NODE_ENV === "development") {
    const devBypass = request.headers.get("x-admin-dev-bypass")
    if (devBypass === process.env.ADMIN_PASSWORD) {
      isValid = true
    }
  }
  
  return NextResponse.json({ authenticated: isValid })
}

// DELETE - Logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return NextResponse.json({ success: true })
}
