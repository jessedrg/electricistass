import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export const maxDuration = 300

// Generate real Unsplash images for cities
function generateCityImageUrls(cityName: string) {
  const searchTerms = [
    `${cityName} spain city`,
    `${cityName} spain architecture`,
    `${cityName} spain street`,
    `electrician work`,
    `electrical repair`,
  ]
  
  const hero = `https://source.unsplash.com/1200x800/?${encodeURIComponent(searchTerms[0])}`
  const gallery = searchTerms.slice(1).map((term, i) => 
    `https://source.unsplash.com/800x600/?${encodeURIComponent(term)}&sig=${i}`
  )
  
  return { hero, gallery }
}

// GET - Count pages with broken/missing images
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  // Find pages with null/empty hero_image_url
  const { data: pagesWithoutImages, error } = await supabase
    .from("pages")
    .select("id", { count: "exact" })
    .or("hero_image_url.is.null,hero_image_url.eq.")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    pagesWithoutImages: pagesWithoutImages?.length || 0 
  })
}

// POST - Fix images and optionally publish
export async function POST(request: Request) {
  const session = await verifyAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()
  const body = await request.json()
  const { publish = false, limit = 50 } = body

  try {
    // Find pages with missing images
    const { data: pages, error: pagesError } = await supabase
      .from("pages")
      .select(`
        id,
        slug,
        status,
        cities (
          name
        )
      `)
      .or("hero_image_url.is.null,hero_image_url.eq.")
      .limit(limit)

    if (pagesError) {
      // Try simpler query without join
      const { data: simplePages, error: simpleError } = await supabase
        .from("pages")
        .select("id, slug, status, city_id")
        .or("hero_image_url.is.null,hero_image_url.eq.")
        .limit(limit)

      if (simpleError) {
        return NextResponse.json({ error: simpleError.message }, { status: 500 })
      }

      // Get city names separately
      const cityIds = [...new Set(simplePages?.map(p => p.city_id).filter(Boolean))]
      const { data: cities } = await supabase
        .from("cities")
        .select("id, name")
        .in("id", cityIds)

      const cityMap = new Map(cities?.map(c => [c.id, c.name]) || [])
      
      const results = {
        fixed: 0,
        published: 0,
        failed: 0,
        errors: [] as string[]
      }

      for (const page of simplePages || []) {
        try {
          // Extract city name from slug or city data
          const cityName = cityMap.get(page.city_id) || 
            page.slug.replace("electricista-", "").replace(/-/g, " ")
          
          const images = generateCityImageUrls(cityName)

          const updateData: Record<string, unknown> = {
            hero_image_url: images.hero,
            gallery_images: images.gallery,
            updated_at: new Date().toISOString()
          }

          // If publish flag is true and page is draft, publish it
          if (publish && (page.status === "draft" || page.status === "generating")) {
            updateData.status = "published"
            updateData.published_at = new Date().toISOString()
          }

          const { error: updateError } = await supabase
            .from("pages")
            .update(updateData)
            .eq("id", page.id)

          if (updateError) {
            results.failed++
            results.errors.push(`${page.slug}: ${updateError.message}`)
          } else {
            results.fixed++
            if (publish && (page.status === "draft" || page.status === "generating")) {
              results.published++
            }
          }
        } catch (err) {
          results.failed++
          results.errors.push(`${page.slug}: ${err instanceof Error ? err.message : "Unknown error"}`)
        }
      }

      return NextResponse.json(results)
    }

    // Process with city join data
    const results = {
      fixed: 0,
      published: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const page of pages || []) {
      try {
        const cityData = page.cities as { name: string } | null
        const cityName = cityData?.name || 
          page.slug.replace("electricista-", "").replace(/-/g, " ")
        
        const images = generateCityImageUrls(cityName)

        const updateData: Record<string, unknown> = {
          hero_image_url: images.hero,
          gallery_images: images.gallery,
          updated_at: new Date().toISOString()
        }

        if (publish && (page.status === "draft" || page.status === "generating")) {
          updateData.status = "published"
          updateData.published_at = new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from("pages")
          .update(updateData)
          .eq("id", page.id)

        if (updateError) {
          results.failed++
          results.errors.push(`${page.slug}: ${updateError.message}`)
        } else {
          results.fixed++
          if (publish && (page.status === "draft" || page.status === "generating")) {
            results.published++
          }
        }
      } catch (err) {
        results.failed++
        results.errors.push(`${page.slug}: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    }

    return NextResponse.json(results)

  } catch (error) {
    console.error("Error fixing images:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 })
  }
}
