import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ArrowRight, Phone, Clock, Shield, CheckCircle2, Star, Zap } from "lucide-react"
import { Breadcrumbs } from "@/components/seo/breadcrumbs"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Electricista 24 Horas | Servicio Urgente en Toda España | Electricistas 24H",
  description: "Electricista profesional 24 horas. Reparacion de averias, cortocircuitos, instalaciones electricas, boletines. Llama al 900 433 214.",
}

export default async function ElectricistaMainPage() {
  const supabase = await createClient()
  
  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("slug", "electricista")
    .single()

  const { data: pages } = await supabase
    .from("pages")
    .select(`
      slug,
      title,
      cities:city_id(name, slug, province, population)
    `)
    .eq("service_id", service?.id)
    .eq("status", "published")
    .order("created_at", { ascending: false })

  const citiesByProvince: Record<string, { name: string; pageSlug: string; population: number }[]> = {}
  
  pages?.forEach((page) => {
    if (page.cities) {
      const province = page.cities.province || "Otras"
      if (!citiesByProvince[province]) {
        citiesByProvince[province] = []
      }
      citiesByProvince[province].push({
        name: page.cities.name,
        pageSlug: page.slug,
        population: page.cities.population || 0
      })
    }
  })

  const sortedProvinces = Object.keys(citiesByProvince).sort()
  sortedProvinces.forEach(province => {
    citiesByProvince[province].sort((a, b) => b.population - a.population)
  })

  const content = {
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
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs items={[{ label: "Electricista" }]} />
      </div>

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
                  <Zap className="h-32 w-32 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6">
              Electricista de confianza en toda Espana
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          </div>
        </div>
      </section>

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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-4">
            Localidades donde ofrecemos servicio
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Selecciona tu ciudad para ver informacion especifica de nuestro servicio de electricista en tu zona
          </p>
          
          {sortedProvinces.length > 0 ? (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Proximamente disponible en mas ciudades.
              </p>
            </div>
          )}
        </div>
      </section>

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
