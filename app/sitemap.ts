import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"

/**
 * Sitemap dinámico - Solo incluye contenido publicado de la base de datos
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.electricistass.com"
  
  try {
    // Usar cliente directo sin SSR para evitar problemas de contexto
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. HOME
    const homePages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ]

    // 2. SERVICIOS con paginas publicadas
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, slug, updated_at")
      .order("name")

    if (servicesError) {
      console.error("Sitemap: Error fetching services:", servicesError)
    }

    // Obtener IDs de servicios con páginas publicadas
    const { data: publishedPageServiceIds, error: serviceIdsError } = await supabase
      .from("pages")
      .select("service_id")
      .eq("status", "published")

    if (serviceIdsError) {
      console.error("Sitemap: Error fetching service IDs:", serviceIdsError)
    }

    const servicesWithPublishedPages = new Set(
      publishedPageServiceIds?.map(p => p.service_id) || []
    )

    const serviceIndexPages: MetadataRoute.Sitemap = (services || [])
      .filter(service => servicesWithPublishedPages.has(service.id))
      .map(service => ({
        url: `${baseUrl}/${service.slug}`,
        lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
        changeFrequency: "weekly" as ChangeFrequency,
        priority: 0.9,
      }))

    // 3. PÁGINAS pSEO PUBLICADAS
    const { data: publishedPages, error: pagesError } = await supabase
      .from("pages")
      .select("slug, published_at, updated_at, sitemap_priority")
      .eq("status", "published")
      .order("published_at", { ascending: false })

    if (pagesError) {
      console.error("Sitemap: Error fetching pages:", pagesError)
    }

    const pagesEntries: MetadataRoute.Sitemap = (publishedPages || []).map(page => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.updated_at 
        ? new Date(page.updated_at) 
        : page.published_at 
          ? new Date(page.published_at) 
          : new Date(),
      changeFrequency: "weekly" as ChangeFrequency,
      priority: page.sitemap_priority ? Number(page.sitemap_priority) : 0.8,
    }))

    // 4. BLOG POSTS (si existe la tabla)
    let blogIndexPages: MetadataRoute.Sitemap = []
    let blogEntries: MetadataRoute.Sitemap = []
    
    try {
      const { data: blogPosts } = await supabase
        .from("blog_posts")
        .select("slug, published_at, updated_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })

      if (blogPosts && blogPosts.length > 0) {
        blogIndexPages = [{
          url: `${baseUrl}/blog`,
          lastModified: blogPosts[0]?.updated_at 
            ? new Date(blogPosts[0].updated_at) 
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }]

        blogEntries = blogPosts.map(post => ({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: post.updated_at 
            ? new Date(post.updated_at) 
            : post.published_at 
              ? new Date(post.published_at) 
              : new Date(),
          changeFrequency: "monthly" as ChangeFrequency,
          priority: 0.7,
        }))
      }
    } catch {
      // Blog table might not exist, skip
    }

    return [
      ...homePages,
      ...serviceIndexPages,
      ...pagesEntries,
      ...blogIndexPages,
      ...blogEntries,
    ]
  } catch (error) {
    console.error("Sitemap: Fatal error:", error)
    // Return at least the home page if everything fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ]
  }
}
