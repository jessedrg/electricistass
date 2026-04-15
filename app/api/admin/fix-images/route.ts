import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

export const maxDuration = 300

// Reliable static Unsplash images for electricians (these URLs always work)
const ELECTRICIAN_IMAGES = {
  hero: [
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=800&fit=crop", // electrician working
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=800&fit=crop", // electrical panel
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1200&h=800&fit=crop", // electrician tools
    "https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?w=1200&h=800&fit=crop", // electrical work
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1200&h=800&fit=crop", // light bulb
  ],
  gallery: [
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&h=600&fit=crop",
  ]
}

// Generate reliable images (random from pool)
function generateReliableImages(slug: string) {
  // Use slug hash for consistent but varied selection
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const heroIndex = hash % ELECTRICIAN_IMAGES.hero.length
  const hero = ELECTRICIAN_IMAGES.hero[heroIndex]
  
  // Shuffle gallery based on hash
  const gallery = ELECTRICIAN_IMAGES.gallery.map((img, i) => {
    const offset = (hash + i) % ELECTRICIAN_IMAGES.gallery.length
    return ELECTRICIAN_IMAGES.gallery[offset]
  })
  
  return { hero, gallery }
}

// Check if URL is a broken Unsplash source URL (deprecated)
function isBrokenImageUrl(url: string | null): boolean {
  if (!url) return true
  if (url === "") return true
  // source.unsplash.com is deprecated and often returns broken images
  if (url.includes("source.unsplash.com")) return true
  return false
}

// GET - Count pages with broken/missing images
export async function GET() {
  const session = await verifyAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  // Find ALL pages and check for broken images
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, hero_image_url")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Count pages with null, empty, or broken image URLs
  const pagesWithBrokenImages = pages?.filter(p => isBrokenImageUrl(p.hero_image_url)) || []

  return NextResponse.json({ 
    pagesWithoutImages: pagesWithBrokenImages.length 
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
    // Find ALL pages and filter for broken/missing images
    const { data: allPages, error: pagesError } = await supabase
      .from("pages")
      .select("id, slug, status, hero_image_url")

    if (pagesError) {
      return NextResponse.json({ error: pagesError.message }, { status: 500 })
    }

    // Filter pages with broken images
    const pagesToFix = (allPages || [])
      .filter(p => isBrokenImageUrl(p.hero_image_url))
      .slice(0, limit)

    if (pagesToFix.length === 0) {
      return NextResponse.json({ 
        fixed: 0, 
        published: 0, 
        failed: 0, 
        errors: [],
        message: "No hay paginas con imagenes rotas"
      })
    }

    const results = {
      fixed: 0,
      published: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const page of pagesToFix) {
      try {
        const images = generateReliableImages(page.slug)

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

  } catch (error) {
    console.error("Error fixing images:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 })
  }
}
