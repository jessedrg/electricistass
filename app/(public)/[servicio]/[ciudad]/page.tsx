import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ServiceCityPage } from "@/components/pages/service-city-page"

interface PageProps {
  params: Promise<{
    servicio: string
    ciudad: string
  }>
}

// Dynamic rendering - pages are generated on-demand
// This ensures fresh data from the database on each request
export const dynamic = "force-dynamic"

// Uncomment to enable static generation for published pages:
// export async function generateStaticParams() {
//   const supabase = createServiceClient()
//   const { data: pages } = await supabase
//     .from("pages")
//     .select("slug")
//     .eq("status", "published")
//     .limit(100)
//   if (!pages) return []
//   return pages.map((page) => {
//     const [servicio, ciudad] = page.slug.split("/")
//     return { servicio, ciudad }
//   })
// }

// SEO Config interface for type safety
interface SeoConfig {
  title_override?: string
  meta_title?: string
  meta_description_override?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_type?: string
  twitter_card?: "summary" | "summary_large_image" | "app" | "player"
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  canonical_url?: string
  keywords?: string[]
  robots?: string
  author?: string
  schema_type?: string
  no_index?: boolean
  no_follow?: boolean
}

const PHONE_DISPLAY = "900 433 214"
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.electricistass.com"

// Generate metadata for SEO - All configurable from database
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { servicio, ciudad } = await params
  const supabase = await createClient()
  
  const { data: page } = await supabase
    .from("pages")
    .select(`
      title,
      meta_description,
      hero_image_url,
      seo_config,
      images_config,
      services:service_id(name, hero_image_url, keywords),
      cities:city_id(name, province)
    `)
    .eq("slug", `${servicio}/${ciudad}`)
    .eq("status", "published")
    .single()
  
  if (!page) {
    return {
      title: "Página no encontrada | Electricistas 24H",
      description: "La página que buscas no existe o no está disponible.",
      robots: { index: false, follow: false },
    }
  }
  
  const serviceName = (page.services as { name: string })?.name || servicio
  const cityName = (page.cities as { name: string })?.name || ciudad
  const province = (page.cities as { province?: string })?.province || ""
  const serviceKeywords = (page.services as { keywords?: string[] })?.keywords || []
  
  // Parse SEO config from database
  const seoConfig = (page.seo_config as SeoConfig) || {}
  const imagesConfig = (page.images_config as { og_image?: string; hero_image?: string }) || {}
  
  // Build title with fallbacks: seo_config.title_override > page.title > generated
  const defaultTitle = `${serviceName} en ${cityName} | Electricistas 24H - ${PHONE_DISPLAY}`
  const title = seoConfig.title_override || seoConfig.meta_title || page.title || defaultTitle
  
  // Build description with fallbacks
  const defaultDescription = `Servicio profesional de ${serviceName.toLowerCase()} en ${cityName}${province ? `, ${province}` : ""}. Llama al ${PHONE_DISPLAY}. Presupuesto gratis, atención 24h y garantía total. Profesionales verificados.`
  const description = seoConfig.meta_description_override || page.meta_description || defaultDescription
  
  // Build image URL with fallbacks: seo_config.og_image > images_config.og_image > hero_image
  const imageUrl = seoConfig.og_image || imagesConfig.og_image || page.hero_image_url || `${baseUrl}/og-default.jpg`
  
  // Build keywords from service + custom
  const keywords = [
    ...(seoConfig.keywords || []),
    ...serviceKeywords,
    serviceName.toLowerCase(),
    `${serviceName.toLowerCase()} ${cityName.toLowerCase()}`,
    `${serviceName.toLowerCase()} urgente ${cityName.toLowerCase()}`,
    cityName.toLowerCase(),
    province.toLowerCase(),
    "24 horas",
    "presupuesto gratis",
    "900 433 214",
  ].filter(Boolean)
  
  // Canonical URL
  const canonicalUrl = seoConfig.canonical_url || `${baseUrl}/${servicio}/${ciudad}`
  
  // Robots directives
  const robotsDirectives = {
    index: !seoConfig.no_index,
    follow: !seoConfig.no_follow,
    googleBot: {
      index: !seoConfig.no_index,
      follow: !seoConfig.no_follow,
      "max-video-preview": -1,
      "max-image-preview": "large" as const,
      "max-snippet": -1,
    },
  }

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: seoConfig.author ? [{ name: seoConfig.author }] : [{ name: "Electricistas 24H" }],
    creator: "Electricistas 24H",
    publisher: "Electricistas 24H",
    robots: robotsDirectives,
    openGraph: {
      title: seoConfig.og_title || title,
      description: seoConfig.og_description || description,
      type: (seoConfig.og_type as "website" | "article") || "website",
      url: canonicalUrl,
      siteName: "Electricistas 24H",
      locale: "es_ES",
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${serviceName} en ${cityName} - Electricistas 24H`,
        }
      ] : undefined,
    },
    twitter: {
      card: seoConfig.twitter_card || "summary_large_image",
      title: seoConfig.twitter_title || seoConfig.og_title || title,
      description: seoConfig.twitter_description || seoConfig.og_description || description,
      images: seoConfig.twitter_image || imageUrl ? [seoConfig.twitter_image || imageUrl] : undefined,
      creator: "@ManitasPL",
      site: "@ManitasPL",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "es-ES": canonicalUrl,
      },
    },
    category: "servicios del hogar",
    other: {
      "geo.region": "ES",
      "geo.placename": cityName,
      "og:locale": "es_ES",
      "og:phone_number": "+34900433214",
    },
  }
}

export default async function ServiceCityPageRoute({ params }: PageProps) {
  const { servicio, ciudad } = await params
  const supabase = await createClient()
  
  // Fetch page with related service and city data - ONLY published pages
  const { data: pageData } = await supabase
    .from("pages")
    .select(`
      *,
      services:service_id(*),
      cities:city_id(*)
    `)
    .eq("slug", `${servicio}/${ciudad}`)
    .eq("status", "published")
    .single()
  
  if (!pageData) {
    notFound()
  }

  const service = pageData.services as {
    id: string
    slug: string
    name: string
    description: string
    hero_image_url: string | null
  }
  
  const city = pageData.cities as {
    id: string
    slug: string
    name: string
    province: string
    latitude: number
    longitude: number
  }

  // Titulo simple para H1: "Cerrajero en Badalona"
  const simpleTitle = `${service.name} en ${city.name}`
  
  const page = {
    title: pageData.title || simpleTitle,
    // H1 simple: siempre "Servicio en Ciudad"
    h1: simpleTitle,
    // H2/Subtitulo: el campo h1 de la DB (que tiene el texto largo) o h1_variant
    subtitle: pageData.h1 && pageData.h1 !== simpleTitle ? pageData.h1 : pageData.h1_variant,
    h1_variant: pageData.h1_variant,
    meta_description: pageData.meta_description || "",
    intro_text: pageData.intro_text || "",
    intro_highlight: pageData.intro_highlight,
    hero_image_url: pageData.hero_image_url,
    gallery_images: pageData.gallery_images as string[] | undefined,
    services_offered: pageData.services_offered as { name: string; description: string; icon?: string; price_from?: number | null; duration?: string | null }[] | undefined,
    coverage_zones: pageData.coverage_zones as { name: string; description?: string; zip_codes?: string[]; highlight?: string | null }[] | undefined,
    local_tips: pageData.local_tips,
    local_tips_list: pageData.local_tips_list as { tip: string; explanation: string }[] | undefined,
    testimonials: pageData.custom_reviews as { name: string; location?: string; text: string; rating?: number; service_type?: string; date_ago?: string }[] | undefined,
    faqs: pageData.faqs as { question: string; answer: string; category?: string }[] | undefined,
    price_range: pageData.price_range as { min: number; max: number; currency: string; unit: string; factors?: string[] } | undefined,
    why_choose_us: pageData.why_choose_us as { title: string; description: string; icon?: string }[] | undefined,
    common_problems: pageData.common_problems as { problem: string; description: string; solution: string }[] | undefined,
    cta_main: pageData.cta_main,
    cta_secondary: pageData.cta_secondary,
    cta_urgency: pageData.cta_urgency,
    city_specific_content: pageData.city_specific_content,
    design_variation: pageData.design_variation as {
      layout_variant?: string
      color_scheme?: string
      hero_style?: string
      cta_style?: string
      testimonial_style?: string
      faq_style?: string
      spacing_variant?: string
    } | undefined,
    // New AI-generated fields
    highlight: pageData.highlight,
    urgency_message: pageData.urgency_message,
    final_cta_title: pageData.final_cta_title,
    final_cta_subtitle: pageData.final_cta_subtitle,
    local_facts: pageData.local_facts as {
      population_approx?: string
      famous_for?: string
      local_landmark?: string
      interesting_fact?: string
      nearby_areas?: string[]
      local_problem?: string
    } | undefined,
    extra_section_type: pageData.extra_section_type,
    extra_section_content: pageData.extra_section_content,
    content_tone: pageData.content_tone,
    cta_button_text: pageData.cta_button_text,
    cta_secondary_text: pageData.cta_secondary_text,
    cta_badge_1: pageData.cta_badge_1,
    cta_badge_2: pageData.cta_badge_2,
    cta_badge_3: pageData.cta_badge_3,
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.electricistass.com"

  // Get city image from cities table
  const cityData = pageData.cities as {
    id: string
    slug: string
    name: string
    province: string
    latitude: number
    longitude: number
    city_image_url?: string
  }

  return (
    <ServiceCityPage
      page={page}
      service={{
        name: service.name,
        slug: service.slug,
        description: service.description || "",
        hero_image_url: service.hero_image_url || undefined,
      }}
      city={{
        name: city.name,
        slug: city.slug,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
        province: city.province,
        city_image_url: cityData.city_image_url,
      }}
      baseUrl={baseUrl}
    />
  )
}
