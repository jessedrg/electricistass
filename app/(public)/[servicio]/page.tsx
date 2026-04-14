import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ArrowRight, Phone, Clock, Shield, CheckCircle2, Star, Wrench, Zap, Droplets, Lock } from "lucide-react"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { ServiceCityPage } from "@/components/pages/service-city-page"
import { Button } from "@/components/ui/button"

// Static content for each service
const serviceContent: Record<string, {
  heroTitle: string
  heroSubtitle: string
  description: string
  benefits: { title: string; description: string }[]
  services: string[]
  urgencyText: string
  ctaText: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  cerrajero: {
    heroTitle: "Cerrajero Profesional 24 Horas",
    heroSubtitle: "Servicio de cerrajeria urgente en toda Espana. Llegamos en 15-30 minutos.",
    description: "Somos especialistas en aperturas de puertas, cambio de cerraduras, instalacion de bombillos de seguridad y todo tipo de trabajos de cerrajeria. Nuestro equipo de cerrajeros profesionales esta disponible las 24 horas del dia, los 365 dias del ano.",
    benefits: [
      { title: "Abrimos sin romper", description: "Tecnicas no destructivas que preservan tu puerta y cerradura siempre que sea posible" },
      { title: "Llegada rapida", description: "Nuestros cerrajeros llegan en 15-30 minutos a cualquier punto de la ciudad" },
      { title: "Precio cerrado", description: "Te damos el precio antes de empezar. Sin sorpresas ni costes ocultos" },
      { title: "Garantia 2 anos", description: "Todos nuestros trabajos incluyen garantia de 2 anos por escrito" },
    ],
    services: [
      "Apertura de puertas urgente",
      "Cambio de cerraduras y bombillos",
      "Cerraduras de seguridad antibumping",
      "Apertura de cajas fuertes",
      "Cerrajeria de vehiculos",
      "Instalacion de cerrojos",
      "Copias de llaves de seguridad",
      "Reparacion de persianas metalicas",
    ],
    urgencyText: "Te has quedado fuera de casa?",
    ctaText: "Llama ahora y abrimos tu puerta",
    icon: Lock,
  },
  electricista: {
    heroTitle: "Electricista Profesional 24 Horas",
    heroSubtitle: "Servicio de electricidad urgente y programado en toda Espana.",
    description: "Resolvemos cualquier problema electrico de forma rapida y segura. Desde averias urgentes como cortocircuitos y apagones, hasta instalaciones completas, boletines electricos y certificados. Electricistas autorizados y con todas las garantias.",
    benefits: [
      { title: "Electricistas autorizados", description: "Todos nuestros profesionales tienen la certificacion oficial requerida" },
      { title: "Urgencias 24h", description: "Atendemos emergencias electricas a cualquier hora del dia o la noche" },
      { title: "Boletines oficiales", description: "Emitimos boletines electricos y certificados de instalacion" },
      { title: "Seguridad garantizada", description: "Cumplimos con toda la normativa vigente REBT" },
    ],
    services: [
      "Reparacion de averias electricas",
      "Cortocircuitos y apagones",
      "Instalacion de enchufes y puntos de luz",
      "Cuadros electricos y diferenciales",
      "Boletines electricos",
      "Instalaciones electricas completas",
      "Revision de instalaciones antiguas",
      "Instalacion de puntos de recarga",
    ],
    urgencyText: "Te has quedado sin luz?",
    ctaText: "Llama ahora y solucionamos tu averia",
    icon: Zap,
  },
  fontanero: {
    heroTitle: "Fontanero Profesional 24 Horas",
    heroSubtitle: "Servicio de fontaneria urgente y reparaciones en toda Espana.",
    description: "Solucionamos cualquier problema de fontaneria: fugas de agua, atascos, reparacion de tuberias, instalacion de sanitarios y mucho mas. Nuestros fontaneros profesionales trabajan con las mejores herramientas y materiales del mercado.",
    benefits: [
      { title: "Deteccion de fugas", description: "Localizamos fugas ocultas sin necesidad de obras con tecnologia avanzada" },
      { title: "Desatascos urgentes", description: "Solucionamos atascos en tuberias, desagues y bajantes rapidamente" },
      { title: "Sin obras", description: "Reparamos tuberias con tecnicas que evitan romper paredes siempre que sea posible" },
      { title: "Presupuesto gratis", description: "Te damos presupuesto sin compromiso antes de empezar cualquier trabajo" },
    ],
    services: [
      "Reparacion de fugas de agua",
      "Desatascos de tuberias y desagues",
      "Instalacion de sanitarios",
      "Reparacion de cisternas",
      "Cambio de griferia",
      "Instalacion de calentadores",
      "Reparacion de bajantes",
      "Localizacion de fugas ocultas",
    ],
    urgencyText: "Tienes una fuga o atasco urgente?",
    ctaText: "Llama ahora y lo solucionamos",
    icon: Droplets,
  },
}

interface PageProps {
  params: Promise<{
    servicio: string
  }>
}

// Use dynamic rendering
export const dynamic = "force-dynamic"

// Helper to check if this slug is a direct page (not a service)
async function getDirectPage(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const { data: page } = await supabase
    .from("pages")
    .select(`
      *,
      services:service_id(*),
      cities:city_id(*)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()
  
  return page
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { servicio } = await params
  const supabase = await createClient()
  
  // First check if this is a direct page slug
  const directPage = await getDirectPage(supabase, servicio)
  if (directPage) {
    const serviceName = directPage.services?.name || "Servicio"
    const cityName = directPage.cities?.name || ""
    return {
      title: directPage.title || `${serviceName}${cityName ? ` en ${cityName}` : ""} | Electricistas 24H`,
      description: directPage.meta_description || `Servicio profesional de ${serviceName.toLowerCase()}${cityName ? ` en ${cityName}` : ""}. Llama al 900 433 214.`,
      alternates: {
        canonical: `/${servicio}`,
      },
    }
  }
  
  // Otherwise check for service
  const { data: service } = await supabase
    .from("services")
    .select("name, description")
    .eq("slug", servicio)
    .single()
  
  if (!service) {
    return {
      title: "Servicio no encontrado",
    }
  }

  return {
    title: `${service.name} - Servicio Profesional en Toda España | Electricistas 24H`,
    description: service.description || `Encuentra profesionales de ${service.name} en tu ciudad. Llama al 900 433 214. Servicio garantizado y presupuesto gratis.`,
    alternates: {
      canonical: `/${servicio}`,
    },
  }
}

export default async function ServiceIndexPage({ params }: PageProps) {
  const { servicio } = await params
  const supabase = await createClient()
  
  // FIRST: Check if this slug matches a direct page
  const directPage = await getDirectPage(supabase, servicio)
  if (directPage) {
    // Render the page directly using ServiceCityPage component
    const serviceData = directPage.services || {
      id: "default",
      name: directPage.title?.split(" ")[0] || "Servicio",
      slug: servicio,
      description: "",
      icon: "wrench",
      hero_image_url: null,
    }
    
    const cityData = directPage.cities || undefined
    
    // Build h1 simple: "Cerrajero en Badalona"
    const serviceName = serviceData.name || "Servicio"
    const cityName = cityData?.name || ""
    const simpleH1 = cityName ? `${serviceName} en ${cityName}` : serviceName
    
    // El campo h1 de la DB se usa como subtitulo (H2), el H1 siempre es simple
    const subtitleFromDB = directPage.h1 && directPage.h1 !== simpleH1 ? directPage.h1 : undefined

    const pageData = {
      title: directPage.title || simpleH1,
      h1: simpleH1,
      subtitle: subtitleFromDB,
      meta_description: directPage.meta_description || "",
      intro_text: directPage.intro_text || "",
      hero_image_url: directPage.hero_image_url,
      faqs: directPage.faqs || [],
      testimonials: directPage.custom_reviews || [],
      layout_config: directPage.layout_config || {},
      sections_config: directPage.sections_config || {},
      images_config: directPage.images_config || {},
      style_overrides: directPage.style_overrides || {},
      city_specific_content: directPage.city_specific_content || "",
      // New AI-generated fields
      highlight: directPage.highlight,
      urgency_message: directPage.urgency_message,
      final_cta_title: directPage.final_cta_title,
      final_cta_subtitle: directPage.final_cta_subtitle,
      local_facts: directPage.local_facts as {
        population_approx?: string
        famous_for?: string
        local_landmark?: string
        interesting_fact?: string
        nearby_areas?: string[]
        local_problem?: string
      } | undefined,
      extra_section_type: directPage.extra_section_type,
      extra_section_content: directPage.extra_section_content,
      content_tone: directPage.content_tone,
      cta_button_text: directPage.cta_button_text,
      cta_secondary_text: directPage.cta_secondary_text,
      cta_badge_1: directPage.cta_badge_1,
      cta_badge_2: directPage.cta_badge_2,
      cta_badge_3: directPage.cta_badge_3,
    }

    return (
      <ServiceCityPage
        page={pageData}
        service={serviceData}
        city={cityData}
        baseUrl="https://www.electricistass.com"
      />
    )
  }
  
  // SECOND: Check if this is a service slug
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", servicio)
    .single()
  
  if (!service) {
    notFound()
  }

  // Get published pages for this service
  const { data: pages } = await supabase
    .from("pages")
    .select(`
      slug,
      title,
      h1,
      cities:city_id(name, slug, province, population)
    `)
    .eq("service_id", service.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  // Group cities by province (for pages with city_id)
  const citiesByProvince: Record<string, { name: string; slug: string; pageSlug: string; population: number }[]> = {}
  // Pages without city_id (custom slugs)
  const customPages: { title: string; slug: string }[] = []
  
  pages?.forEach((page) => {
    const city = page.cities as { name: string; slug: string; province: string; population: number } | null
    if (city) {
      const province = city.province || "Otras ciudades"
      if (!citiesByProvince[province]) {
        citiesByProvince[province] = []
      }
      citiesByProvince[province].push({
        name: city.name,
        slug: city.slug,
        pageSlug: page.slug,
        population: city.population || 0,
      })
    } else {
      // Page without city - show as custom page
      customPages.push({
        title: page.h1 || page.title || page.slug,
        slug: page.slug,
      })
    }
  })

  // Sort provinces alphabetically and cities by population
  const sortedProvinces = Object.keys(citiesByProvince).sort()
  sortedProvinces.forEach((province) => {
    citiesByProvince[province].sort((a, b) => b.population - a.population)
  })

  const content = serviceContent[servicio] || {
    heroTitle: `${service.name} Profesional`,
    heroSubtitle: `Servicio de ${service.name.toLowerCase()} en toda Espana.`,
    description: service.description || `Encuentra profesionales de ${service.name} en tu ciudad.`,
    benefits: [],
    services: [],
    urgencyText: "Necesitas ayuda urgente?",
    ctaText: "Llama ahora",
    icon: Wrench,
  }

  const IconComponent = content.icon

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: service.name }]} />
      </div>

      {/* Hero Section */}
      <section className="py-12 lg:py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4" />
                Disponible 24 horas - 365 dias
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-balance">
                {content.heroTitle}
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                {content.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700" asChild>
                  <a href="tel:900433214">
                    <Phone className="h-5 w-5" />
                    900 433 214
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="gap-2" asChild>
                  <a href="https://wa.me/34711267223" target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sin recargos nocturnos
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  2 anos de garantia
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-green-600" />
                  +2.000 servicios/ano
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-emerald-600 to-amber-500 rounded-3xl p-12 shadow-2xl">
                  <IconComponent className="h-32 w-32 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">
              {service.name} de confianza en toda Espana
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      {content.benefits.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              Por que elegirnos
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {content.benefits.map((benefit, index) => (
                <Card key={index} className="border-none shadow-lg bg-white">
                  <CardContent className="pt-6">
                    <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6 text-emerald-700" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services List */}
      {content.services.length > 0 && (
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
              Nuestros servicios
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {content.services.map((serviceItem, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm">{serviceItem}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Urgency CTA */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-amber-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            {content.urgencyText}
          </h2>
          <p className="text-white/90 mb-6 text-lg">
            {content.ctaText}
          </p>
          <Button size="lg" variant="secondary" className="gap-2 text-emerald-700 font-semibold" asChild>
            <a href="tel:900433214">
              <Phone className="h-5 w-5" />
              900 433 214 - Llamada gratuita
            </a>
          </Button>
        </div>
      </section>

      {/* Cities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4">
            Localidades donde ofrecemos servicio
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Selecciona tu ciudad para ver informacion especifica de nuestro servicio de {service.name.toLowerCase()} en tu zona
          </p>
          
          {pages && pages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProvinces.map((province) => (
                <Card key={province} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                      {province}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {citiesByProvince[province].map((city) => (
                        <li key={city.pageSlug}>
                          <Link
                            href={`/${city.pageSlug}`}
                            className="flex items-center justify-between text-sm text-muted-foreground hover:text-emerald-700 transition-colors group"
                          >
                            <span>{city.name}</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}

          {/* Custom pages without city */}
          {customPages.length > 0 && (
            <div className={sortedProvinces.length > 0 ? "mt-8" : ""}>
              {sortedProvinces.length > 0 && (
                <h3 className="text-xl font-semibold mb-4">Otras paginas</h3>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/${page.slug}`}
                    className="p-4 border rounded-lg hover:border-orange-500 transition-colors group flex items-center justify-between"
                  >
                    <span>{page.title}</span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {pages && pages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Proximamente disponible en mas ciudades.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Contacta con nosotros
            </h2>
            <p className="text-muted-foreground mb-8">
              Estamos disponibles las 24 horas para atender tu consulta o emergencia
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700" asChild>
                <a href="tel:900433214">
                  <Phone className="h-5 w-5" />
                  Llamar al 900 433 214
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="https://wa.me/34711267223" target="_blank" rel="noopener noreferrer">
                  Enviar WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
