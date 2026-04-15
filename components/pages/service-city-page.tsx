import Image from "next/image"
import { HeroSection } from "./hero-section"
import { ServicesList } from "./services-list"
import { CoverageZones } from "./coverage-zones"
import { Testimonials } from "./testimonials"
import { CTASection } from "./cta-section"
import { FAQSection } from "@/components/seo/faq-section"
import { GoogleMapsEmbed } from "@/components/seo/google-maps-embed"
import { Breadcrumbs, generateBreadcrumbJsonLd } from "@/components/seo/breadcrumbs"
import { StructuredData } from "@/components/seo/structured-data"
import { WhyChooseUs } from "./why-choose-us"
import { CommonProblems } from "./common-problems"
import { LocalTips } from "./local-tips"
import { ImageGallery } from "./image-gallery"
import { cn } from "@/lib/utils"

// Configuración de layout desde la DB
interface LayoutConfig {
  hero_height?: "small" | "medium" | "large" | "full"
  hero_overlay_opacity?: number
  content_max_width?: "narrow" | "medium" | "wide" | "full"
  section_spacing?: "compact" | "standard" | "spacious" | "generous"
  show_breadcrumbs?: boolean
  show_map?: boolean
  show_prices?: boolean
  sections_order?: string[]
  // Map custom settings
  map_latitude?: number
  map_longitude?: number
  map_zoom?: number
  // CTA config
  cta_config?: {
    phone_number?: string
    phone_display?: string
    button_text?: string
    secondary_button_text?: string
    badge_1?: string
    badge_2?: string
    badge_3?: string
  }
}

// Configuración SEO desde la DB
interface SeoConfig {
  title_template?: string
  canonical_url?: string
  og_image?: string
  og_type?: string
  twitter_card?: string
  noindex?: boolean
  schema_type?: string
  keywords?: string[]
}

// Reviews personalizadas desde la DB
interface CustomReview {
  name: string
  avatar?: string
  location: string
  rating: number
  text: string
  service_type?: string
  date: string
  verified?: boolean
  helpful_count?: number
}

// Configuración de imágenes desde la DB
interface ImagesConfig {
  hero_image?: string
  hero_image_alt?: string
  gallery?: {
    url: string
    alt: string
    caption?: string
  }[]
  logo_override?: string
  og_image?: string
}

// Configuración de secciones desde la DB
interface SectionsConfig {
  hero?: {
    enabled?: boolean
    variant?: string
    height?: string
    overlay?: number
  }
  intro?: {
    enabled?: boolean
    show_highlight?: boolean
    columns?: number
  }
  services?: {
    enabled?: boolean
    layout?: "grid" | "list" | "cards"
    show_prices?: boolean
    show_duration?: boolean
  }
  testimonials?: {
    enabled?: boolean
    layout?: "carousel" | "grid" | "masonry"
    max_display?: number
  }
  faq?: {
    enabled?: boolean
    layout?: "accordion" | "grid" | "simple"
    show_categories?: boolean
  }
  map?: {
    enabled?: boolean
    height?: number
    zoom?: number
  }
  cta?: {
    enabled?: boolean
    variant?: "banner" | "card" | "minimal"
    position?: "bottom" | "floating"
  }
}

// Overrides de estilos desde la DB
interface StyleOverrides {
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  text_color?: string
  border_radius?: string
  font_heading?: string
  font_body?: string
  custom_css?: string
}

interface DesignVariation {
  layout_variant?: string
  color_scheme?: string
  hero_style?: string
  cta_style?: string
  testimonial_style?: string
  faq_style?: string
  spacing_variant?: string
}

interface PageData {
  title: string
  h1: string
  h1_variant?: string
  subtitle?: string
  meta_description: string
  intro_text: string
  intro_highlight?: string
  hero_image_url?: string
  gallery_images?: string[]
  services_offered?: {
    name: string
    description: string
    icon?: string
    price_from?: number | null
    duration?: string | null
  }[]
  coverage_zones?: {
    name: string
    description?: string
    zip_codes?: string[]
    highlight?: string | null
  }[]
  local_tips?: string
  local_tips_list?: {
    tip: string
    explanation: string
  }[]
  testimonials?: {
    name: string
    location?: string
    text: string
    rating?: number
    service_type?: string
    date_ago?: string
  }[]
  faqs?: {
    question: string
    answer: string
    category?: string
  }[]
  price_range?: {
    min: number
    max: number
    currency: string
    unit: string
    factors?: string[]
  }
  why_choose_us?: {
    title: string
    description: string
    icon?: string
  }[]
  common_problems?: {
    problem: string
    description: string
    solution: string
  }[]
  cta_main?: string
  cta_secondary?: string
  cta_urgency?: string
  city_specific_content?: string
  design_variation?: DesignVariation
  // Nuevos campos de configuración
  layout_config?: LayoutConfig
  seo_config?: SeoConfig
  custom_reviews?: CustomReview[]
  images_config?: ImagesConfig
  sections_config?: SectionsConfig
  style_overrides?: StyleOverrides
  // Campos generados por IA
  highlight?: string
  urgency_message?: string
  final_cta_title?: string
  final_cta_subtitle?: string
  local_facts?: {
    population_approx?: string
    famous_for?: string
    local_landmark?: string
    interesting_fact?: string
    nearby_areas?: string[]
    local_problem?: string
  }
  extra_section_type?: string
  extra_section_content?: string
  content_tone?: string
  cta_button_text?: string
  cta_secondary_text?: string
  cta_badge_1?: string
  cta_badge_2?: string
  cta_badge_3?: string
}

interface ServiceData {
  name: string
  slug: string
  description: string
  hero_image_url?: string
}

interface CityData {
  name: string
  slug: string
  latitude: number
  longitude: number
  province: string
  city_image_url?: string
}

interface ServiceCityPageProps {
  page: PageData
  service: ServiceData
  city?: CityData
  baseUrl: string
}

const colorSchemes: Record<string, { 
  bg: string
  bgAlt: string
  border: string
  text: string
  accent: string
  button: string
}> = {
  blue: { 
    bg: "bg-blue-50", 
    bgAlt: "bg-blue-100/50",
    border: "border-blue-200", 
    text: "text-blue-700",
    accent: "text-blue-500",
    button: "bg-blue-600 hover:bg-blue-700"
  },
  green: { 
    bg: "bg-green-50", 
    bgAlt: "bg-green-100/50",
    border: "border-green-200", 
    text: "text-green-700",
    accent: "text-green-500",
    button: "bg-green-600 hover:bg-green-700"
  },
  orange: { 
    bg: "bg-emerald-50", 
    bgAlt: "bg-orange-100/50",
    border: "border-orange-200", 
    text: "text-orange-700",
    accent: "text-emerald-600",
    button: "bg-emerald-600 hover:bg-emerald-700"
  },
  teal: { 
    bg: "bg-teal-50", 
    bgAlt: "bg-teal-100/50",
    border: "border-teal-200", 
    text: "text-teal-700",
    accent: "text-teal-500",
    button: "bg-teal-600 hover:bg-teal-700"
  },
  indigo: { 
    bg: "bg-indigo-50", 
    bgAlt: "bg-indigo-100/50",
    border: "border-indigo-200", 
    text: "text-indigo-700",
    accent: "text-indigo-500",
    button: "bg-indigo-600 hover:bg-indigo-700"
  },
  emerald: { 
    bg: "bg-emerald-50", 
    bgAlt: "bg-emerald-100/50",
    border: "border-emerald-200", 
    text: "text-emerald-700",
    accent: "text-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700"
  },
  amber: { 
    bg: "bg-amber-50", 
    bgAlt: "bg-amber-100/50",
    border: "border-amber-200", 
    text: "text-amber-700",
    accent: "text-amber-500",
    button: "bg-amber-600 hover:bg-amber-700"
  },
  cyan: { 
    bg: "bg-cyan-50", 
    bgAlt: "bg-cyan-100/50",
    border: "border-cyan-200", 
    text: "text-cyan-700",
    accent: "text-cyan-500",
    button: "bg-cyan-600 hover:bg-cyan-700"
  },
}

const heroHeights: Record<string, string> = {
  small: "min-h-[300px]",
  medium: "min-h-[450px]",
  large: "min-h-[600px]",
  full: "min-h-screen",
}

const contentWidths: Record<string, string> = {
  narrow: "max-w-3xl",
  medium: "max-w-4xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
}

const sectionSpacings: Record<string, string> = {
  compact: "py-10 md:py-12",
  standard: "py-14 md:py-20",
  spacious: "py-20 md:py-28",
  generous: "py-24 md:py-32",
}

// Helper to strip HTML tags for plain text
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function ServiceCityPage({ 
  page, 
  service, 
  city, 
  baseUrl 
}: ServiceCityPageProps) {
  // Default city data when not provided
  const cityData: CityData = city || {
    name: "",
    slug: "",
    latitude: 40.4168,
    longitude: -3.7038,
    province: "",
  }
  
  // Configuraciones con defaults
  const layoutConfig = page.layout_config || {}
  const sectionsConfig = page.sections_config || {}
  const imagesConfig = page.images_config || {}
  const styleOverrides = page.style_overrides || {}
  const designVariation = page.design_variation || {}
  
  // Color scheme
  const colorScheme = styleOverrides.primary_color 
    ? "orange" // fallback si hay override
    : (designVariation.color_scheme || "orange")
  const colors = colorSchemes[colorScheme] || colorSchemes.orange
  
  // Layout settings
  const heroHeight = heroHeights[layoutConfig.hero_height || "medium"]
  const contentWidth = contentWidths[layoutConfig.content_max_width || "medium"]
  const sectionSpacing = sectionSpacings[layoutConfig.section_spacing || designVariation.spacing_variant || "standard"]
  const showBreadcrumbs = layoutConfig.show_breadcrumbs !== false
  const showMap = layoutConfig.show_map !== false && sectionsConfig.map?.enabled !== false && !!cityData.name
  const showPrices = layoutConfig.show_prices !== false
  
  // Secciones habilitadas
  const heroEnabled = sectionsConfig.hero?.enabled !== false
  const introEnabled = sectionsConfig.intro?.enabled !== false
  const servicesEnabled = sectionsConfig.services?.enabled !== false
  const testimonialsEnabled = sectionsConfig.testimonials?.enabled !== false
  const faqEnabled = sectionsConfig.faq?.enabled !== false
  const ctaEnabled = sectionsConfig.cta?.enabled !== false

  // Usar reviews personalizadas o las generadas
  const reviews = page.custom_reviews && page.custom_reviews.length > 0
    ? page.custom_reviews.map(r => ({
        name: r.name,
        location: r.location,
        text: r.text,
        rating: r.rating,
        service_type: r.service_type,
        date_ago: r.date,
        verified: r.verified,
      }))
    : page.testimonials

  // Imágenes con fallbacks
  const heroImage = imagesConfig.hero_image || page.hero_image_url || cityData.city_image_url || service.hero_image_url
  const heroImageAlt = imagesConfig.hero_image_alt || (cityData.name ? `${service.name} en ${cityData.name}` : service.name)
  const galleryImages = imagesConfig.gallery?.map(g => g.url) || page.gallery_images

  const breadcrumbItems = cityData.name 
    ? [
        { label: service.name, href: `/${service.slug}` },
        { label: cityData.name }
      ]
    : [
        { label: service.name }
      ]

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems, baseUrl)

  // Custom CSS si existe
  const customStyles = styleOverrides.custom_css ? (
    <style dangerouslySetInnerHTML={{ __html: styleOverrides.custom_css }} />
  ) : null

  return (
    <>
      {customStyles}
      
      <StructuredData
        localBusiness={{
          name: `Electricistas 24H - ${service.name} en ${cityData.name}`,
          description: page.meta_description,
          serviceName: service.name,
          cityName: cityData.name,
          latitude: cityData.latitude,
          longitude: cityData.longitude,
          telephone: "+34900433214",
          priceRange: page.price_range 
            ? `${page.price_range.min}-${page.price_range.max}${page.price_range.currency}`
            : "$$",
          // Pass reviews for rich snippets
          reviews: reviews?.map(r => ({
            name: r.name,
            rating: r.rating || 5,
            text: r.text,
            date: r.date_ago,
            location: r.location
          })),
          // Calculate aggregate rating from reviews
          aggregateRating: reviews && reviews.length > 0 ? {
            ratingValue: reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length,
            reviewCount: reviews.length
          } : undefined
        }}
        service={{
          name: service.name,
          description: service.description,
          provider: "Electricistas 24H",
          areaServed: cityData.name,
          priceRange: page.price_range
        }}
        faqs={page.faqs}
        breadcrumbJsonLd={breadcrumbJsonLd}
        webPage={{
          name: page.title,
          description: page.meta_description,
          url: `${baseUrl}/${service.slug}/${cityData.slug || ''}`.replace(/\/$/, ''),
        }}
        includeOrganization={true}
      />

      <main className="min-h-screen">
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <div className="container mx-auto px-4 py-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        )}

        {/* Hero con configuración din��mica */}
        {heroEnabled && (
          <HeroSection
            title={page.h1}
            titleVariant={page.h1_variant}
            subtitle={page.subtitle}
            showButtons={false}
            highlight={page.highlight || page.intro_highlight}
            imageUrl={heroImage}
            imageAlt={heroImageAlt}
            cityName={cityData.name}
            serviceName={service.name}
            ctaMain={page.cta_button_text || page.cta_main}
            ctaSecondary={page.cta_secondary_text}
            ctaUrgency={page.urgency_message || page.cta_urgency}
ctaConfig={{
  phone_number: layoutConfig.cta_config?.phone_number,
  phone_display: layoutConfig.cta_config?.phone_display,
  button_text: page.cta_button_text || layoutConfig.cta_config?.button_text,
  secondary_button_text: page.cta_secondary_text || layoutConfig.cta_config?.secondary_button_text,
  // Use page badges first (from AI generation), then layoutConfig, then static defaults
  badge_1: page.cta_badge_1 || layoutConfig.cta_config?.badge_1 || undefined,
  badge_2: page.cta_badge_2 || layoutConfig.cta_config?.badge_2 || undefined,
  badge_3: page.cta_badge_3 || layoutConfig.cta_config?.badge_3 || undefined,
  }}
            designVariation={{
              ...designVariation,
              hero_style: sectionsConfig.hero?.variant || designVariation.hero_style,
            }}
            heroHeight={heroHeight}
            overlayOpacity={sectionsConfig.hero?.overlay || layoutConfig.hero_overlay_opacity}
          />
        )}

        <div className="container mx-auto px-4">
          {/* Introduccion extensa */}
          {introEnabled && page.intro_text && (
            <section className={cn(sectionSpacing)}>
              <div className={cn("mx-auto", contentWidth)}>
                {page.intro_highlight && sectionsConfig.intro?.show_highlight !== false && (
                  <div className={cn("p-6 rounded-xl mb-8 border", colors.bg, colors.border)}>
                    <p className={cn("text-lg font-medium", colors.text)}>
                      {page.intro_highlight}
                    </p>
                  </div>
                )}
                {/* Solo mostrar titulo si el hero NO esta habilitado */}
                {!heroEnabled && (
                  <h2 className="text-3xl font-bold mb-8">
                    {service.name} Profesional{cityData.name ? ` en ${cityData.name}` : ""}
                  </h2>
                )}
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-4 prose-p:text-muted-foreground prose-p:mb-4 prose-strong:text-foreground prose-a:text-emerald-700 hover:prose-a:text-orange-700 prose-ul:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: page.intro_text || "" }}
                />
              </div>
            </section>
          )}

          {/* Contenido específico de la ciudad */}
          {page.city_specific_content && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <div className={cn("mx-auto", contentWidth)}>
                <h2 className="text-2xl font-bold mb-8">
                  {service.name}{cityData.name ? ` en ${cityData.name}` : ""}: Lo que necesitas saber
                </h2>
                <div 
                  className="prose prose-lg max-w-none prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-4 prose-p:text-muted-foreground prose-p:mb-4 prose-strong:text-foreground prose-a:text-emerald-700 hover:prose-a:text-orange-700 prose-ul:my-4 prose-li:my-1"
                  dangerouslySetInnerHTML={{ __html: page.city_specific_content || "" }}
                />
              </div>
            </section>
          )}

          {/* Galería de imágenes */}
          {galleryImages && galleryImages.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <ImageGallery 
                images={galleryImages}
                cityName={cityData.name}
                serviceName={service.name}
              />
            </section>
          )}

          {/* Services con precios */}
          {servicesEnabled && page.services_offered && page.services_offered.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <ServicesList 
                services={page.services_offered}
                title={`Servicios de ${service.name} en ${cityData.name}`}
                colorScheme={colorScheme}
                layout={sectionsConfig.services?.layout}
                showPrices={sectionsConfig.services?.show_prices !== false && showPrices}
                showDuration={sectionsConfig.services?.show_duration}
              />
            </section>
          )}

          {/* Por qué elegirnos */}
          {page.why_choose_us && page.why_choose_us.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8", colors.bg)}>
              <WhyChooseUs 
                reasons={page.why_choose_us}
                serviceName={service.name}
                cityName={cityData.name}
                colorScheme={colorScheme}
              />
            </section>
          )}

          {/* Problemas comunes */}
          {page.common_problems && page.common_problems.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <CommonProblems 
                problems={page.common_problems}
                serviceName={service.name}
                cityName={cityData.name}
              />
            </section>
          )}

          {/* Coverage Zones */}
          {page.coverage_zones && page.coverage_zones.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <CoverageZones 
                zones={page.coverage_zones}
                cityName={cityData.name}
                colorScheme={colorScheme}
              />
            </section>
          )}

          {/* Local Tips */}
          {(page.local_tips || page.local_tips_list) && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <LocalTips 
                tips={page.local_tips}
                tipsList={page.local_tips_list}
                cityName={cityData.name}
                serviceName={service.name}
                colorScheme={colorScheme}
              />
            </section>
          )}

          {/* Datos Locales - Seccion generada por IA */}
          {page.local_facts && Object.keys(page.local_facts).length > 0 && (page.local_facts.famous_for || page.local_facts.interesting_fact || page.local_facts.local_landmark || page.local_facts.population_approx) && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <div className={cn("mx-auto", contentWidth)}>
                <div className="border border-gray-200 rounded-2xl bg-muted/30 p-8">
                <h2 className="text-2xl font-bold mb-6">
                  Sobre {cityData.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {page.local_facts.population_approx && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-2xl">🏘️</span>
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">Poblacion</h3>
                        <p className="text-foreground">{page.local_facts.population_approx}</p>
                      </div>
                    </div>
                  )}
                  {page.local_facts.famous_for && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-2xl">⭐</span>
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">Conocida por</h3>
                        <p className="text-foreground">{page.local_facts.famous_for}</p>
                      </div>
                    </div>
                  )}
                  {page.local_facts.local_landmark && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-2xl">📍</span>
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">Lugar emblematico</h3>
                        <p className="text-foreground">{page.local_facts.local_landmark}</p>
                      </div>
                    </div>
                  )}
                  {page.local_facts.interesting_fact && (
                    <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm">
                      <span className="text-2xl">💡</span>
                      <div>
                        <h3 className="font-semibold text-sm text-muted-foreground">Dato curioso</h3>
                        <p className="text-foreground">{page.local_facts.interesting_fact}</p>
                      </div>
                    </div>
                  )}
                </div>
                {page.local_facts.local_problem && (
                  <div className="mt-6 p-4 bg-emerald-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800">
                      <strong>Problema comun en {cityData.name}:</strong> {page.local_facts.local_problem}
                    </p>
                  </div>
                )}
                {page.local_facts.nearby_areas && page.local_facts.nearby_areas.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Tambien damos servicio en zonas cercanas:</h3>
                    <div className="flex flex-wrap gap-2">
                      {page.local_facts.nearby_areas.map((area, idx) => (
                        <span key={idx} className={cn("px-3 py-1 rounded-full text-sm", colors.bg, colors.text)}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                </div>
              </div>
            </section>
          )}

          {/* Seccion Extra - Generada por IA */}
          {page.extra_section_type && page.extra_section_type !== 'ninguno' && page.extra_section_content && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <div className={cn("mx-auto", contentWidth)}>
                {page.extra_section_type === 'testimonial_destacado' && (
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-8 rounded-2xl border border-orange-100">
                    <h2 className="text-2xl font-bold mb-4">Testimonio destacado</h2>
                    <div 
                      className="prose prose-lg max-w-none italic text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: page.extra_section_content }}
                    />
                  </div>
                )}
                {page.extra_section_type === 'dato_curioso' && (
                  <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <span>💡</span> Sabias que...
                    </h2>
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: page.extra_section_content }}
                    />
                  </div>
                )}
                {page.extra_section_type === 'proceso_trabajo' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Como trabajamos</h2>
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: page.extra_section_content }}
                    />
                  </div>
                )}
                {page.extra_section_type === 'zona_cobertura' && (
                  <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <span>🗺️</span> Zona de cobertura
                    </h2>
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: page.extra_section_content }}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Testimonials / Reviews personalizadas */}
          {testimonialsEnabled && reviews && reviews.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <Testimonials 
                testimonials={reviews}
                title={`Opiniones de clientes en ${cityData.name}`}
                style={sectionsConfig.testimonials?.layout || designVariation.testimonial_style}
                colorScheme={colorScheme}
                maxDisplay={sectionsConfig.testimonials?.max_display}
              />
            </section>
          )}

          {/* Google Maps y Foto de la ciudad */}
          {showMap && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <div className={cn("mx-auto", contentWidth)}>
                <h2 className="text-2xl font-bold mb-6">
                  Zona de cobertura en {cityData.name}
                </h2>
                <p className="text-muted-foreground mb-8">
                  Ofrecemos servicio de {service.name.toLowerCase()} en {cityData.name} y toda la provincia de {cityData.province}. 
                  Llegamos a todos los barrios y zonas de la ciudad.
                </p>
                <div className={cn("grid gap-6", cityData.city_image_url ? "lg:grid-cols-2" : "grid-cols-1")}>
                  <div>
                    <GoogleMapsEmbed
                      cityName={cityData.name}
                      latitude={layoutConfig.map_latitude || cityData.latitude}
                      longitude={layoutConfig.map_longitude || cityData.longitude}
                      height={sectionsConfig.map?.height || "350px"}
                      zoom={layoutConfig.map_zoom || sectionsConfig.map?.zoom}
                    />
                  </div>
                  {cityData.city_image_url && (
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <Image
                        src={cityData.city_image_url}
                        alt={`Vista de ${cityData.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <p className="text-white font-semibold text-lg">{cityData.name}</p>
                        {cityData.province && (
                          <p className="text-white/80 text-sm">{cityData.province}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Precios indicativos */}
          {showPrices && page.price_range && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <div className={cn("mx-auto", contentWidth)}>
                <h2 className="text-2xl font-bold mb-6">
                  Precios de {service.name}{cityData.name ? ` en ${cityData.name}` : ""}
                </h2>
                <div className={cn("p-8 rounded-2xl border", colors.bg, colors.border)}>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold">{page.price_range.min}€</span>
                    <span className="text-2xl text-muted-foreground">-</span>
                    <span className="text-4xl font-bold">{page.price_range.max}€</span>
                    <span className="text-muted-foreground">/ {page.price_range.unit}</span>
                  </div>
                  {page.price_range.factors && page.price_range.factors.length > 0 && (
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-3">Factores que afectan al precio:</p>
                      <ul className="grid sm:grid-cols-2 gap-2">
                        {page.price_range.factors.map((factor, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={cn("h-1.5 w-1.5 rounded-full", colors.text.replace("text-", "bg-"))} />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* FAQs */}
          {faqEnabled && page.faqs && page.faqs.length > 0 && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              <FAQSection 
                faqs={page.faqs}
                title={`Preguntas frecuentes sobre ${service.name} en ${cityData.name}`}
                style={sectionsConfig.faq?.layout || designVariation.faq_style}
                showCategories={sectionsConfig.faq?.show_categories}
              />
            </section>
          )}

          {/* CTA Final Personalizado */}
          {ctaEnabled && (
            <section className={cn(sectionSpacing, "border-t mt-8")}>
              {/* Si hay titulo/subtitulo personalizado del CTA final */}
              {(page.final_cta_title || page.final_cta_subtitle) && (
                <div className={cn("mx-auto text-center mb-8", contentWidth)}>
                  {page.final_cta_title && (
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{page.final_cta_title}</h2>
                  )}
                  {page.final_cta_subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{page.final_cta_subtitle}</p>
                  )}
                </div>
              )}
              <CTASection
                cityName={cityData.name}
                serviceName={service.name}
                ctaText={page.cta_button_text || page.cta_main || "Solicitar Presupuesto Gratis"}
                ctaSecondary={page.cta_secondary_text || page.cta_secondary}
                urgencyText={page.urgency_message || page.cta_urgency}
                priceFrom={page.price_range?.min}
                colorScheme={colorScheme}
                style={sectionsConfig.cta?.variant || designVariation.cta_style}
                badges={[page.cta_badge_1, page.cta_badge_2, page.cta_badge_3].filter(Boolean) as string[]}
              />
            </section>
          )}
        </div>
      </main>
    </>
  )
}
