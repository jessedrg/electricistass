import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Zap, 
  ArrowRight,
  Phone,
  Shield,
  Clock,
  Star,
  CheckCircle,
  MapPin,
  Lightbulb,
  Plug,
  Cable,
  CircuitBoard,
  AlertTriangle,
  Home,
  Building2,
  Wrench
} from "lucide-react"

const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

const electricalServices = [
  {
    icon: AlertTriangle,
    title: "Averías Eléctricas",
    description: "Reparación urgente de cortocircuitos, apagones y fallos eléctricos en menos de 30 minutos."
  },
  {
    icon: Plug,
    title: "Instalaciones Eléctricas",
    description: "Instalación de enchufes, interruptores, cuadros eléctricos y tomas de corriente."
  },
  {
    icon: Lightbulb,
    title: "Iluminación",
    description: "Instalación y reparación de sistemas de iluminación LED, halógenos y decorativos."
  },
  {
    icon: CircuitBoard,
    title: "Cuadros Eléctricos",
    description: "Revisión, reparación y sustitución de cuadros eléctricos y diferenciales."
  },
  {
    icon: Cable,
    title: "Cableado y Recableado",
    description: "Renovación completa del cableado eléctrico de tu hogar o negocio."
  },
  {
    icon: Home,
    title: "Boletines Eléctricos",
    description: "Certificados de instalación eléctrica (CIE) y boletines para alta de luz."
  }
]

const benefits = [
  {
    icon: Clock,
    title: "Disponible 24/7",
    description: "Atendemos emergencias eléctricas las 24 horas del día, los 365 días del año."
  },
  {
    icon: Zap,
    title: "Respuesta en 30 min",
    description: "Electricistas en tu puerta en menos de 30 minutos para urgencias."
  },
  {
    icon: Shield,
    title: "Profesionales Certificados",
    description: "Todos nuestros electricistas están titulados y asegurados."
  },
  {
    icon: CheckCircle,
    title: "Presupuesto Gratis",
    description: "Te damos presupuesto sin compromiso antes de empezar el trabajo."
  }
]

export default async function HomePage() {
  const supabase = await createClient()

  // Get cities that have at least one published page for electricista
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
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-sm font-medium backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              Electricistas Urgentes 24 Horas
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-tight">
              Electricistas Profesionales <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-yellow-400">
                en Toda España
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 max-w-2xl mx-auto text-pretty leading-relaxed">
              Servicio de electricidad urgente las 24 horas. Averías, instalaciones, reparaciones y certificados eléctricos con garantía total.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="gap-2 text-lg h-14 px-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/25">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-5 w-5" />
                  {PHONE_DISPLAY}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-lg h-14 px-8 rounded-full !bg-white !text-gray-900 !border-white hover:!bg-gray-100" asChild>
                <a href="#servicios">
                  Ver Servicios
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-8 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Disponible ahora
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                4.9/5 valoración media
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                +{publishedCount || 100} zonas cubiertas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="bg-emerald-600 py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-white text-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <benefit.icon className="h-6 w-6 text-emerald-200" />
                <span className="font-semibold text-sm">{benefit.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
              Nuestros Servicios
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Servicios de Electricidad
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Ofrecemos soluciones eléctricas completas para hogares y negocios en toda España.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {electricalServices.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                      <service.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{service.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button asChild size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-full">
              <a href={`tel:+34${PHONE_NUMBER}`}>
                <Phone className="h-5 w-5" />
                Solicitar Servicio
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                Por Qué Elegirnos
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
                Electricistas de Confianza para tu Hogar
              </h2>
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Somos tu servicio de electricidad de referencia en España. Nuestros profesionales están cualificados y comprometidos con la excelencia.
              </p>
              
              <div className="space-y-4">
                {[
                  "Electricistas titulados y con experiencia",
                  "Servicio urgente en menos de 30 minutos",
                  "Presupuesto gratuito y sin compromiso",
                  "Garantía en todos los trabajos",
                  "Precios transparentes y competitivos",
                  "Atención personalizada 24/7"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <Button asChild size="lg" className="gap-2 mt-8 bg-emerald-600 hover:bg-emerald-700 rounded-full">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-5 w-5" />
                  Llámanos Ahora
                </a>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">24h</div>
                    <div className="text-sm text-gray-600">Disponibilidad</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">30&apos;</div>
                    <div className="text-sm text-gray-600">Tiempo llegada</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">100%</div>
                    <div className="text-sm text-gray-600">Garantía</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-1">0€</div>
                    <div className="text-sm text-gray-600">Presupuesto</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section - Only show if there are published pages */}
      {citiesWithPublishedPages.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                Cobertura Nacional
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
                Electricistas en tu Ciudad
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Contamos con electricistas profesionales en las principales ciudades de España.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {citiesWithPublishedPages.map((city) => {
                const cityData = city as { id: string; slug: string; name: string; province: string }
                return (
                  <Link 
                    key={cityData.id} 
                    href={`/electricista-${cityData.slug}`}
                    className="group"
                  >
                    <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1 border-0 bg-white">
                      <CardContent className="py-6 px-4">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <span className="font-semibold group-hover:text-emerald-600 transition-colors text-gray-900">
                            {cityData.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {cityData.province}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
            
            <div className="text-center mt-10">
              <Button variant="outline" asChild className="gap-2 rounded-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                <Link href="/electricista-main">
                  Ver todas las ciudades
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Urgency Section */}
      <section className="py-16 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-amber-100">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">¿Tienes una emergencia eléctrica?</h3>
                <p className="text-gray-600">Apagones, cortocircuitos, olor a quemado... ¡Actuamos de inmediato!</p>
              </div>
            </div>
            <Button asChild size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg">
              <a href={`tel:+34${PHONE_NUMBER}`}>
                <Phone className="h-5 w-5" />
                Urgencias: {PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contacto" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Zap className="h-12 w-12 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-balance">
              ¿Necesitas un Electricista?
            </h2>
            <p className="text-xl text-gray-400 mb-4">
              Llámanos gratis y te atendemos de inmediato
            </p>
            <p className="text-5xl font-bold text-emerald-400 mb-8">
              {PHONE_DISPLAY}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gap-2 text-lg h-14 px-8 bg-emerald-500 hover:bg-emerald-600 rounded-full">
                <a href={`tel:+34${PHONE_NUMBER}`}>
                  <Phone className="h-5 w-5" />
                  Llamar Ahora
                </a>
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              Disponible 24 horas · 365 días al año · Sin compromiso
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
