import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

// GET - Obtener estado del cron
export async function GET() {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "cron_enabled")
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Si no existe, el cron está habilitado por defecto
  const enabled = data?.value ?? true

  return NextResponse.json({ enabled })
}

// POST - Actualizar estado del cron
export async function POST(request: Request) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { enabled } = await request.json()

  const supabase = await createClient()

  const { error } = await supabase
    .from("settings")
    .upsert({
      key: "cron_enabled",
      value: enabled,
      updated_at: new Date().toISOString()
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, enabled })
}
