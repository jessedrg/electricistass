import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"
import { generatePageContent, generateDesignVariation, generateCityImageUrls } from "@/lib/ai/generate-content"

// Manual endpoint to trigger page generation
// Usage: POST /api/admin/generate-pages?count=5&secret=your-secret
// Or use admin session authentication from the dashboard

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const count = parseInt(searchParams.get("count") || "5")
  const secret = searchParams.get("secret")
  const authHeader = request.headers.get("authorization")
  
  // Check admin session first (for dashboard use)
  const isAdminSession = await verifyAdminSession()
  
  // Require secret via query param OR Authorization header OR admin session
  const isAuthorized = 
    isAdminSession ||
    secret === process.env.CRON_SECRET || 
    authHeader === `Bearer ${process.env.CRON_SECRET}`
  
  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  
  const supabase = await createClient()
  const results: { success: string[]; errors: string[] } = { success: [], errors: [] }
  
  try {
    // Get pending pages from queue
    const { data: pendingPages, error: queueError } = await supabase
      .from("generation_queue")
      .select(`
        id,
        page_id,
        pages!inner (
          id,
          slug,
          status,
          services!inner (id, slug, name, description),
          cities!inner (id, slug, name, province, population, neighborhoods, local_context, landmarks)
        )
      `)
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(count)

    if (queueError) {
      return NextResponse.json({ error: queueError.message }, { status: 500 })
    }

    if (!pendingPages || pendingPages.length === 0) {
      return NextResponse.json({ 
        message: "No pending pages to generate",
        generated: 0 
      })
    }

    // Process each page
    for (const item of pendingPages) {
      const page = item.pages as any
      
      try {
        // Mark as processing
        await supabase
          .from("generation_queue")
          .update({ status: "processing", started_at: new Date().toISOString() })
          .eq("id", item.id)

        // Generate content
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
            landmarks: page.cities.landmarks || [],
          }
        )

        // Generate design variation
        const designVariation = generateDesignVariation(page.services.slug, page.cities.slug)
        const cityImages = generateCityImageUrls(page.cities.name)

        // Update page
        const now = new Date().toISOString()
        await supabase
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
            design_variation: designVariation,
            hero_image_url: cityImages.hero,
            gallery_images: cityImages.gallery,
            status: "published",
            published_at: now,
            updated_at: now,
          })
          .eq("id", page.id)

        // Mark queue item as completed
        await supabase
          .from("generation_queue")
          .update({ status: "completed", completed_at: now })
          .eq("id", item.id)

        results.success.push(page.slug)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error"
        results.errors.push(`${page.slug}: ${errorMsg}`)
        
        // Mark as failed
        await supabase
          .from("generation_queue")
          .update({ status: "failed", error: errorMsg })
          .eq("id", item.id)
      }
    }

    return NextResponse.json({
      message: `Generated ${results.success.length} pages`,
      generated: results.success.length,
      failed: results.errors.length,
      success: results.success,
      errors: results.errors,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// GET endpoint to check queue status
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  const authHeader = request.headers.get("authorization")
  const isAdminSession = await verifyAdminSession()
  
  const isAuthorized = 
    isAdminSession ||
    secret === process.env.CRON_SECRET || 
    authHeader === `Bearer ${process.env.CRON_SECRET}`
  
  if (!isAuthorized) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  
  const supabase = await createClient()
  
  // Get queue stats
  const { data: stats } = await supabase
    .from("generation_queue")
    .select("status")
  
  const counts = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  }
  
  stats?.forEach((item) => {
    if (item.status in counts) {
      counts[item.status as keyof typeof counts]++
    }
  })
  
  // Get page stats
  const { data: pageStats } = await supabase
    .from("pages")
    .select("status")
  
  const pageCounts = {
    pending: 0,
    generating: 0,
    published: 0,
    error: 0,
  }
  
  pageStats?.forEach((item) => {
    if (item.status in pageCounts) {
      pageCounts[item.status as keyof typeof pageCounts]++
    }
  })

  return NextResponse.json({
    queue: counts,
    pages: pageCounts,
    total_pages: pageStats?.length || 0,
  })
}
