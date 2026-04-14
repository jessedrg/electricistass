import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const supabase = await createClient()

    // Validate required fields (only name and slug are required for quick creation)
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Nombre y slug son requeridos" },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", body.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una ciudad con ese slug" },
        { status: 400 }
      )
    }

    // Insert city
    const { data: city, error: cityError } = await supabase
      .from("cities")
      .insert({
        name: body.name,
        slug: body.slug,
        province: body.province || "",
        autonomous_community: body.autonomous_community || "",
        population: body.population || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        neighborhoods: body.neighborhoods || [],
        landmarks: body.landmarks || [],
        local_context: body.local_context || null,
        city_image_url: body.city_image_url || null,
      })
      .select()
      .single()

    if (cityError) {
      console.error("Error creating city:", cityError)
      return NextResponse.json(
        { error: "Error al crear la ciudad" },
        { status: 500 }
      )
    }

    // Get all services to create pages
    const { data: services } = await supabase
      .from("services")
      .select("id, slug")

    if (services && services.length > 0) {
      // Create pending pages for each service
      const pages = services.map(service => ({
        service_id: service.id,
        city_id: city.id,
        slug: `${service.slug}/${body.slug}`,
        status: "pending",
        sitemap_priority: 0.8,
        sitemap_changefreq: "weekly",
      }))

      const { error: pagesError } = await supabase
        .from("pages")
        .insert(pages)

      if (pagesError) {
        console.error("Error creating pages:", pagesError)
        // Don't fail the whole operation, city is created
      }
    }

    return NextResponse.json({ 
      success: true, 
      city,
      pagesCreated: services?.length || 0,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET() {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: cities, error } = await supabase
    .from("cities")
    .select("*")
    .order("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Return array directly for consistency
  return NextResponse.json(cities || [])
}
