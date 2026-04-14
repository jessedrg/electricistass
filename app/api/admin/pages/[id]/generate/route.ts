import { NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { generatePageContent } from "@/lib/ai/generate-content"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { id } = await params
    const supabase = await createClient()

    // Get page with service and city data
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select(`
        *,
        services:service_id(*),
        cities:city_id(*)
      `)
      .eq("id", id)
      .single()

    if (pageError || !page) {
      return NextResponse.json(
        { error: "Página no encontrada" },
        { status: 404 }
      )
    }

    const service = page.services as Record<string, unknown>
    const city = page.cities as Record<string, unknown>

    if (!service || !city) {
      return NextResponse.json(
        { error: "Servicio o ciudad no encontrados" },
        { status: 400 }
      )
    }

    // Generate content with AI
    const content = await generatePageContent(
      service as Parameters<typeof generatePageContent>[0],
      city as Parameters<typeof generatePageContent>[1]
    )

    if (!content) {
      return NextResponse.json(
        { error: "Error al generar contenido con IA" },
        { status: 500 }
      )
    }

    // Update page with generated content
    const { error: updateError } = await supabase
      .from("pages")
      .update({
        title: content.title,
        meta_description: content.meta_description,
        h1: content.h1,
        h1_variant: content.h1_variant,
        intro_text: content.intro_text,
        content: content.content,
        faqs: content.faqs,
        testimonials: content.testimonials,
        common_problems: content.common_problems,
        cta_primary: content.cta_primary,
        cta_secondary: content.cta_secondary,
        status: "published",
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating page:", updateError)
      return NextResponse.json(
        { error: "Error al guardar el contenido generado" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: "Contenido generado y publicado correctamente" 
    })
  } catch (error) {
    console.error("Error generating content:", error)
    return NextResponse.json(
      { error: "Error al generar contenido" },
      { status: 500 }
    )
  }
}
