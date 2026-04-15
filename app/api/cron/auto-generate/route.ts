import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generatePageContent, generateDesignVariation, generateCityImageUrls } from "@/lib/ai/generate-content"

// Configuration
const MIN_POPULATION = 10000 // Minimum population for cities (Spain)
const CITIES_PER_EXECUTION = 10 // How many cities to process per cron run (only Spanish cities)

export const maxDuration = 300 // 5 minutes max

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  
  try {
    // Step 1: Find Spanish cities with 10,000+ population that don't have pages yet
    // Only cities with province (Spanish cities have provinces)
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id, name, slug, province, population, neighborhoods, local_context, landmarks")
      .gte("population", MIN_POPULATION)
      .not("province", "is", null) // Only Spanish cities (have province)
      .order("population", { ascending: false })

    if (citiesError) {
      console.error("[CRON] Error fetching cities:", citiesError)
      return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
    }

    if (!cities || cities.length === 0) {
      return NextResponse.json({ 
        message: "No cities found with population >= 10,000",
        generated: 0 
      })
    }

    // Step 2: Get the main service (electricistas)
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, slug, description")
      .limit(1) // Just electricistas for now

    if (servicesError || !services || services.length === 0) {
      console.error("[CRON] Error fetching services:", servicesError)
      return NextResponse.json({ error: "No services found" }, { status: 500 })
    }

    const service = services[0]

    // Step 3: Find cities that don't have pages for this service yet
    const { data: existingPages, error: pagesError } = await supabase
      .from("pages")
      .select("city_id")
      .eq("service_id", service.id)

    if (pagesError) {
      console.error("[CRON] Error fetching existing pages:", pagesError)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    const citiesWithPages = new Set(existingPages?.map(p => p.city_id) || [])
    
    // Filter to cities without pages
    const citiesWithoutPages = cities.filter(city => !citiesWithPages.has(city.id))

    if (citiesWithoutPages.length === 0) {
      return NextResponse.json({ 
        message: "All cities with 10,000+ population already have pages",
        generated: 0,
        totalCities: cities.length
      })
    }

    // Step 4: Shuffle and take random N cities (super aleatorio!)
    const shuffled = citiesWithoutPages
      .map(city => ({ city, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ city }) => city)
    
    const citiesToProcess = shuffled.slice(0, CITIES_PER_EXECUTION)

    const results = {
      success: 0,
      failed: 0,
      pages: [] as string[],
      errors: [] as string[],
    }

    for (const city of citiesToProcess) {
      try {
        console.log(`[CRON] Generating page for ${service.name} in ${city.name}`)

        // Create the page record first as "generating"
        const pageSlug = `${service.slug}/${city.slug}`
        
        const { data: existingPage } = await supabase
          .from("pages")
          .select("id")
          .eq("slug", pageSlug)
          .single()

        if (existingPage) {
          console.log(`[CRON] Page ${pageSlug} already exists, skipping`)
          continue
        }

        // Insert page as generating
        const { data: newPage, error: insertError } = await supabase
          .from("pages")
          .insert({
            service_id: service.id,
            city_id: city.id,
            slug: pageSlug,
            status: "generating",
            sitemap_priority: 0.8,
            sitemap_changefreq: "weekly",
          })
          .select("id")
          .single()

        if (insertError || !newPage) {
          throw new Error(`Failed to create page record: ${insertError?.message}`)
        }

        // Generate content with AI using GPT
        const content = await generatePageContent(
          {
            name: service.name,
            slug: service.slug,
            description: service.description || "",
          },
          {
            name: city.name,
            slug: city.slug,
            province: city.province || "",
            population: city.population || 0,
            neighborhoods: city.neighborhoods || [],
            local_context: city.local_context || "",
            landmarks: city.landmarks || [],
          }
        )

        // Generate design variation
        const designVariation = generateDesignVariation(service.slug, city.slug)
        const cityImages = generateCityImageUrls(city.name)

        // Update page with generated content - set as DRAFT
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
            design_variation: designVariation,
            hero_image_url: cityImages.hero,
            gallery_images: cityImages.gallery,
            status: "draft", // Set as draft, NOT published
            updated_at: now,
          })
          .eq("id", newPage.id)

        if (updateError) {
          throw updateError
        }

        results.success++
        results.pages.push(`${city.name} (${city.population?.toLocaleString()} hab)`)
        console.log(`[CRON] Successfully generated draft page for ${city.name}`)

      } catch (error) {
        console.error(`[CRON] Error generating page for ${city.name}:`, error)
        results.failed++
        results.errors.push(`${city.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return NextResponse.json({
      message: `Generated ${results.success} draft pages, ${results.failed} failed`,
      ...results,
      remainingCities: citiesWithoutPages.length - results.success,
      totalCitiesWithPopulation: cities.length,
    })
    
  } catch (error) {
    console.error("[CRON] Auto-generate job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
