import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET() {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  const [
    { count: citiesCount },
    { count: servicesCount },
    { count: totalPages },
    { count: publishedPages },
    { count: pendingPages },
    { count: draftPages },
    { data: recentPages },
  ] = await Promise.all([
    supabase.from("cities").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("pages").select("*", { count: "exact", head: true }),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("pages").select("*", { count: "exact", head: true }).eq("status", "draft"),
    supabase
      .from("pages")
      .select(`
        id,
        slug,
        status,
        title,
        updated_at,
        services:service_id(name),
        cities:city_id(name)
      `)
      .order("updated_at", { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    pages: {
      total: totalPages || 0,
      published: publishedPages || 0,
      pending: pendingPages || 0,
      draft: draftPages || 0,
    },
    cities: citiesCount || 0,
    services: servicesCount || 0,
    recentPages: recentPages || [],
  })
}
