import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleUpdate(request, params)
}

async function handleUpdate(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Only update fields that are provided
    if (body.status !== undefined) updateData.status = body.status
    if (body.title !== undefined) updateData.title = body.title
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description
    if (body.h1 !== undefined) updateData.h1 = body.h1
    if (body.intro_text !== undefined) updateData.intro_text = body.intro_text
    if (body.hero_image_url !== undefined) updateData.hero_image_url = body.hero_image_url
    if (body.faqs !== undefined) updateData.faqs = body.faqs
    if (body.custom_reviews !== undefined) updateData.custom_reviews = body.custom_reviews
    if (body.seo_config !== undefined) updateData.seo_config = body.seo_config
    if (body.layout_config !== undefined) updateData.layout_config = body.layout_config
    if (body.design_variation !== undefined) updateData.design_variation = body.design_variation
    if (body.sitemap_priority !== undefined) updateData.sitemap_priority = body.sitemap_priority
    if (body.sitemap_changefreq !== undefined) updateData.sitemap_changefreq = body.sitemap_changefreq
    if (body.sitemap_exclude !== undefined) updateData.sitemap_exclude = body.sitemap_exclude
    if (body.published_at !== undefined) updateData.published_at = body.published_at
    if (body.service_id !== undefined) updateData.service_id = body.service_id
    if (body.city_id !== undefined) updateData.city_id = body.city_id
    if (body.parent_city_id !== undefined) updateData.parent_city_id = body.parent_city_id
    if (body.is_neighborhood !== undefined) updateData.is_neighborhood = body.is_neighborhood
    // New direct fields
    if (body.latitude !== undefined) updateData.latitude = body.latitude
    if (body.longitude !== undefined) updateData.longitude = body.longitude
    if (body.show_map !== undefined) updateData.show_map = body.show_map
    if (body.cta_button_text !== undefined) updateData.cta_button_text = body.cta_button_text
    if (body.cta_secondary_text !== undefined) updateData.cta_secondary_text = body.cta_secondary_text
    if (body.cta_badge_1 !== undefined) updateData.cta_badge_1 = body.cta_badge_1
    if (body.cta_badge_2 !== undefined) updateData.cta_badge_2 = body.cta_badge_2
    if (body.cta_badge_3 !== undefined) updateData.cta_badge_3 = body.cta_badge_3
    // New AI-generated fields
    if (body.highlight !== undefined) updateData.highlight = body.highlight
    if (body.urgency_message !== undefined) updateData.urgency_message = body.urgency_message
    if (body.final_cta_title !== undefined) updateData.final_cta_title = body.final_cta_title
    if (body.final_cta_subtitle !== undefined) updateData.final_cta_subtitle = body.final_cta_subtitle
    if (body.local_facts !== undefined) updateData.local_facts = body.local_facts
    if (body.extra_section_type !== undefined) updateData.extra_section_type = body.extra_section_type
    if (body.extra_section_content !== undefined) updateData.extra_section_content = body.extra_section_content
    if (body.content_tone !== undefined) updateData.content_tone = body.content_tone

    const { data: page, error } = await supabase
      .from("pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating page:", error)
      return NextResponse.json(
        { error: "Error al actualizar la página" },
        { status: 500 }
      )
    }

    // Revalidar sitemap y la pagina cuando se publica/actualiza
    if (body.status === "published" || page.status === "published") {
      revalidatePath("/sitemap.xml")
      revalidatePath(`/${page.slug}`)
    }

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: page, error } = await supabase
    .from("pages")
    .select(`
      *,
      services:service_id(*),
      cities:city_id(*)
    `)
    .eq("id", id)
    .single()

  if (error || !page) {
    return NextResponse.json({ error: "Página no encontrada" }, { status: 404 })
  }

  return NextResponse.json({ page })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase.from("pages").delete().eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: "Error al eliminar la página" },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
