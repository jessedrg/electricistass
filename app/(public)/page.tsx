import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Wrench, 
  Zap, 
  Key, 
  Thermometer, 
  PaintBucket, 
  Hammer,
  ArrowRight,
  Phone,
  Shield,
  Clock,
  Star,
  CheckCircle,
  MapPin
} from "lucide-react"

// Electricistas 24H - Home Page
const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

const serviceIcons: Record<string, React.ElementType> = {
  fontanero: Wrench,
  electricista: Zap,
  cerrajero: Key,
  climatizacion: Thermometer,
  pintor: PaintBucket,
  albanil: Hammer,
}

export default async function HomePage() {
  const supabase = await createClient()
  
  // Get all services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name")

  // Get cities that have at least one published page
  const { data: publishedPages } = await supabase
    .from("pages")
    .select(`
      cities:city_id(*)
    `)
    .eq("status", "published")
    .limit(50)
  
  // Extract unique cities from published pages
  const citiesWithPublishedPages = publishedPages
    ?.map(page => page.cities)
    .filter((city): city is NonNullable<typeof city> => city !== null)
    .filter((city, index, self) => 
      index === self.findIndex(c => (c as { id: string }).id === (city as { id: string }).id)
    )
    .slice(0, 8) || []

  // Get count of published pages
  const { count: publishedCount } = await supabase
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
              <Phone className="h-4 w-4" />
              Llama ahora: {PHONE_DISPLAY}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              <span className="text-emerald-600">Electricistas 24H</span> - Profesionales de Confianza para tu Hogar
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Fontaneros, electricistas, cerrajeros y más profesionales verificados en toda España. Servicio rápido, presupuesto gratis y garantía total.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="gap-2 text-base bg-emerald-600 hover:bg-emerald-700">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-5 w-5" />
                  {PHONE_DISPLAY}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
                <a href="#servicios">
                  Ver Servicios
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" />
                Disponible 24/7
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                Profesionales verificados
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-emerald-600" />
                +{publishedCount || 0} servicios activos
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Contamos con profesionales especializados en cada área para resolver cualquier problema de tu hogar.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service) => {
              const IconComponent = serviceIcons[service.slug] || Wrench
              return (
                <Link key={service.id} href={`/${service.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {service.description || `Servicio profesional de ${service.name.toLowerCase()} en toda España.`}
                      </p>
                      <span className="text-emerald-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Ver ciudades
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Cities Section - Only show if there are published pages */}
      {citiesWithPublishedPages.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Ciudades con Servicio Activo</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Disponemos de profesionales verificados en estas ciudades de España.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {citiesWithPublishedPages.map((city) => {
                const cityData = city as { id: string; slug: string; name: string; province: string }
                return (
                  <Link 
                    key={cityData.id} 
                    href={`/fontanero-${cityData.slug}`}
                    className="group"
                  >
                    <Card className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold group-hover:text-emerald-600 transition-colors">
                            {cityData.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {cityData.province}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            
            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/fontanero-main">
                  Ver todas las ciudades
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Why Us Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Respuesta Rápida</h3>
              <p className="text-muted-foreground">
                Profesionales disponibles en menos de 30 minutos para urgencias en tu zona.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Garantía Total</h3>
              <p className="text-muted-foreground">
                Todos nuestros trabajos tienen garantía. Si no estás satisfecho, lo solucionamos.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold">Presupuesto Gratis</h3>
              <p className="text-muted-foreground">
                Te damos un presupuesto sin compromiso antes de empezar cualquier trabajo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-orange-600 p-8 lg:p-12 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">
              ¿Necesitas ayuda con tu hogar?
            </h2>
            <p className="text-lg opacity-90 mb-4 max-w-2xl mx-auto">
              Llámanos al teléfono gratuito y te atendemos de inmediato.
            </p>
            <p className="text-4xl font-bold mb-8">
              {PHONE_DISPLAY}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="gap-2 text-base bg-white text-emerald-700 hover:bg-gray-100">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
              <Button 
                size="lg" 
                asChild
                className="gap-2 text-base bg-orange-700 hover:bg-orange-800 text-white border-0"
              >
                <a href="#servicios">
                  Ver Servicios
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
