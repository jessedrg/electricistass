import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET() {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  const { data: pages, error } = await supabase
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
    `)
    .order("updated_at", { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ pages })
}
