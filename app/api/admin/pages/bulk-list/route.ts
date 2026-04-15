import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

// API to get ALL pages for bulk operations (no pagination limit)
export async function GET(request: Request) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") || "all"
  const hasImage = searchParams.get("hasImage") // "true", "false", or null for all
  const fields = searchParams.get("fields") || "id,slug,status,hero_image_url" // Campos minimos por defecto

  const supabase = await createClient()

  // Build minimal query for bulk operations
  let query = supabase
    .from("pages")
    .select(fields)

  // Apply status filter
  if (status && status !== "all") {
    query = query.eq("status", status)
  }

  // Apply image filter
  if (hasImage === "true") {
    query = query.not("hero_image_url", "is", null)
  } else if (hasImage === "false") {
    query = query.is("hero_image_url", null)
  }

  const { data: pages, error, count } = await query
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    pages: pages || [],
    total: pages?.length || 0
  })
}
