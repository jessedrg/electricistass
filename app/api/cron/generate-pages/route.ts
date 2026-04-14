import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePageContent, generateDesignVariation, generateCityImageUrls } from "@/lib/ai/generate-content"

// Number of pages to generate per cron execution
const PAGES_PER_EXECUTION = 7

export const maxDuration = 300 // 5 minutes max for Vercel Pro

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  
  try {
    // Get pending pages from queue
    const { data: queueItems, error: queueError } = await supabase
      .from("generation_queue")
      .select(`
        id,
        page_id,
        pages:page_id(
          id,
          slug,
          service_id,
          city_id,
          services:service_id(id, name, slug, description),
          cities:city_id(id, name, slug, province, population, neighborhoods, local_context)
        )
      `)
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(PAGES_PER_EXECUTION)

    if (queueError) {
      console.error("Error fetching queue:", queueError)
      return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 })
    }

    if (!queueItems || queueItems.length === 0) {
      return NextResponse.json({ 
        message: "No pending pages to generate",
        generated: 0 
      })
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const item of queueItems) {
      const page = item.pages as {
        id: string
        slug: string
        service_id: string
        city_id: string
        services: {
          id: string
          name: string
          slug: string
          description: string
        }
        cities: {
          id: string
          name: string
          slug: string
          province: string
          population: number
          neighborhoods: string[]
          local_context: string
        }
      }

      if (!page || !page.services || !page.cities) {
        results.failed++
        results.errors.push(`Missing data for queue item ${item.id}`)
        continue
      }

      try {
        // Mark as generating
        await supabase
          .from("generation_queue")
          .update({ status: "processing" })
          .eq("id", item.id)

        await supabase
          .from("pages")
          .update({ status: "generating" })
          .eq("id", page.id)

        // Generate content with AI
        const content = await generatePageContent(
          {
            name: page.services.name,
            slug: page.services.slug,
            description: page.services.description,
          },
          {
            name: page.cities.name,
            slug: page.cities.slug,
            province: page.cities.province,
            population: page.cities.population,
            neighborhoods: page.cities.neighborhoods || [],
            local_context: page.cities.local_context || "",
          }
        )

        // Generate unique design variation for this page
        const designVariation = generateDesignVariation(page.services.slug, page.cities.slug)
        
        // Generate city images
        const cityImages = generateCityImageUrls(page.cities.name)

        // Update page with generated content AND design variations
        const now = new Date().toISOString()
        const { error: updateError } = await supabase
          .from("pages")
          .update({
            title: content.title,
            meta_description: content.meta_description,
            h1: content.h1,
            h1_variant: content.h1_variant,
            intro_text: content.intro_text,
            intro_highlight: content.intro_highlight,
            services_offered: content.services_offered,
            coverage_zones: content.coverage_zones,
            local_tips: content.local_tips,
            local_tips_list: content.local_tips_list,
            testimonials: content.testimonials,
            faqs: content.faqs,
            price_range: content.price_range,
            why_choose_us: content.why_choose_us,
            common_problems: content.common_problems,
            cta_main: content.cta_main,
            cta_secondary: content.cta_secondary,
            cta_urgency: content.cta_urgency,
            city_specific_content: content.city_specific_content,
            // Design variations
            design_variation: designVariation,
            // Images
            hero_image_url: cityImages.hero,
            gallery_images: cityImages.gallery,
            status: "published",
            published_at: now,
            updated_at: now,
          })
          .eq("id", page.id)

        if (updateError) {
          throw updateError
        }

        // Mark queue item as completed
        await supabase
          .from("generation_queue")
          .update({ 
            status: "completed",
            completed_at: now 
          })
          .eq("id", item.id)

        results.success++
        
      } catch (error) {
        console.error(`Error generating page ${page.slug}:`, error)
        results.failed++
        results.errors.push(`${page.slug}: ${error instanceof Error ? error.message : "Unknown error"}`)

        // Mark as error
        await supabase
          .from("generation_queue")
          .update({ 
            status: "error",
            error_message: error instanceof Error ? error.message : "Unknown error"
          })
          .eq("id", item.id)

        await supabase
          .from("pages")
          .update({ status: "error" })
          .eq("id", page.id)
      }
    }

    return NextResponse.json({
      message: `Generated ${results.success} pages, ${results.failed} failed`,
      ...results,
    })
    
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
