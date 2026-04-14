import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export async function GET(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const fields = searchParams.get("fields")
  
  // If specific fields requested, only select those
  const selectFields = fields || "id,slug,service_id,city_id,title,status"
  
  const { data: pages, error } = await supabase
    .from("pages")
    .select(selectFields)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(pages)
}

export async function POST(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const supabase = await createClient()

  // New simplified flow: create page directly with slug
  if (body.slug) {
    const { 
      slug, service_id, city_id, parent_city_id, is_neighborhood, title, meta_description, h1, intro_text, 
      hero_image_url, status, published_at, sitemap_priority, sitemap_changefreq, faqs, custom_reviews, layout_config,
      // New AI-generated fields
      highlight, urgency_message, final_cta_title, final_cta_subtitle, local_facts, extra_section_type, 
      extra_section_content, content_tone, cta_button_text, cta_secondary_text, cta_badge_1, cta_badge_2, cta_badge_3,
      latitude, longitude, show_map, reviews
    } = body

    // Check if page already exists with this slug
    const { data: existingSlug } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", slug)
      .single()

    if (existingSlug) {
      return NextResponse.json({ error: "Ya existe una página con este slug" }, { status: 400 })
    }

    // Check if page already exists for this service + city combination (if both provided)
    if (service_id && city_id) {
      const { data: existingCombo } = await supabase
        .from("pages")
        .select("id, slug")
        .eq("service_id", service_id)
        .eq("city_id", city_id)
        .single()

      if (existingCombo) {
        return NextResponse.json({ 
          error: `Ya existe una página para este servicio y ciudad (slug: ${existingCombo.slug})` 
        }, { status: 400 })
      }
    }

    // Create new page directly
    const { data: newPage, error } = await supabase
      .from("pages")
      .insert({
        slug,
        service_id: service_id || null,
        city_id: city_id || null,
        parent_city_id: parent_city_id || null,
        is_neighborhood: is_neighborhood || false,
        title: title || "",
        meta_description: meta_description || "",
        h1: h1 || "",
        intro_text: intro_text || "",
        hero_image_url: hero_image_url || null,
        status: status || "pending",
        published_at: published_at || null,
        sitemap_priority: sitemap_priority || 0.8,
        sitemap_changefreq: sitemap_changefreq || "weekly",
        faqs: faqs || [],
        custom_reviews: reviews || custom_reviews || [],
        layout_config: layout_config || {},
        city_specific_content: "",
        // New AI-generated fields
        highlight: highlight || null,
        urgency_message: urgency_message || null,
        final_cta_title: final_cta_title || null,
        final_cta_subtitle: final_cta_subtitle || null,
        local_facts: local_facts || {},
        extra_section_type: extra_section_type || null,
        extra_section_content: extra_section_content || null,
        content_tone: content_tone || null,
        cta_button_text: cta_button_text || null,
        cta_secondary_text: cta_secondary_text || null,
        cta_badge_1: cta_badge_1 || null,
        cta_badge_2: cta_badge_2 || null,
        cta_badge_3: cta_badge_3 || null,
        latitude: latitude || null,
        longitude: longitude || null,
        show_map: show_map !== undefined ? show_map : true,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating page:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ page: newPage })
  }

  // Legacy flow: create page with service_id and city_id
  const { service_id, city_id } = body

  if (!service_id || !city_id) {
    return NextResponse.json({ error: "Faltan parámetros (slug o service_id + city_id)" }, { status: 400 })
  }

  // Get service and city info
  const [{ data: service }, { data: city }] = await Promise.all([
    supabase.from("services").select("*").eq("id", service_id).single(),
    supabase.from("cities").select("*").eq("id", city_id).single(),
  ])

  if (!service || !city) {
    return NextResponse.json({ error: "Servicio o ciudad no encontrado" }, { status: 404 })
  }

  // Check if page already exists
  const { data: existingPage } = await supabase
    .from("pages")
    .select("id")
    .eq("service_id", service_id)
    .eq("city_id", city_id)
    .single()

  if (existingPage) {
    return NextResponse.json({ page: { id: existingPage.id } })
  }

  // Create new page
  const slug = `${service.slug}/${city.slug}`
  const title = `${service.name} en ${city.name}`
  const metaDescription = `Servicio profesional de ${service.name.toLowerCase()} en ${city.name}. Llama al 900 433 214. Presupuesto gratis y atención 24h.`

  const { data: newPage, error } = await supabase
    .from("pages")
    .insert({
      service_id,
      city_id,
      slug,
      title,
      meta_description: metaDescription,
      status: "draft",
      intro_text: "",
      city_specific_content: "",
      faqs: [],
      sitemap_priority: 0.8,
      sitemap_changefreq: "weekly",
    })
    .select("*")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ page: newPage })
}

export async function DELETE(request: NextRequest) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID de pagina requerido" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting page:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
