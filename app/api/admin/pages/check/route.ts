import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const serviceId = searchParams.get("service")
  const cityId = searchParams.get("city")

  if (!serviceId || !cityId) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 })
  }

  const supabase = await createClient()
  
  const { data: page } = await supabase
    .from("pages")
    .select("id")
    .eq("service_id", serviceId)
    .eq("city_id", cityId)
    .single()

  return NextResponse.json({ pageId: page?.id || null })
}
