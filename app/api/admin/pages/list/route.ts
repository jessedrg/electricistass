import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET(request: Request) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const status = searchParams.get("status") || "all"
  const search = searchParams.get("search") || ""
  const hasImage = searchParams.get("hasImage") // "true", "false", or null for all

  const supabase = await createClient()
  const offset = (page - 1) * limit

  // Build the query
  let query = supabase
    .from("pages")
    .select(`
      id,
      slug,
      title,
      status,
      sitemap_priority,
      published_at,
      updated_at,
      hero_image_url,
      services:service_id(name, slug),
      cities:city_id(name, slug, population)
    `, { count: "exact" })

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

  // Apply search filter (search in slug)
  if (search) {
    query = query.ilike("slug", `%${search}%`)
  }

  // Apply ordering and pagination
  const { data: pages, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Calculate pagination info
  const totalPages = Math.ceil((count || 0) / limit)

  return NextResponse.json({ 
    pages,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages,
      hasMore: page < totalPages
    }
  })
}
