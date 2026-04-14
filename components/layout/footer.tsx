import Link from "next/link"
import { Phone, Mail, MapPin, Zap, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

async function getFooterData() {
  const supabase = await createClient()
  
  const [servicesResult, citiesResult] = await Promise.all([
    supabase
      .from("services")
      .select("name, slug")
      .order("name")
      .limit(6),
    supabase
      .from("cities")
      .select("name, slug")
      .order("population", { ascending: false, nullsFirst: false })
      .limit(6)
  ])
  
  return {
    services: servicesResult.data || [],
    cities: citiesResult.data || []
  }
}

export async function Footer() {
  const { services, cities } = await getFooterData()
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Banner */}
      <div className="bg-emerald-600">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <Zap className="h-6 w-6 text-yellow-300" />
            <span className="text-lg font-semibold">¿Necesitas un electricista urgente?</span>
          </div>
          <a 
            href={`tel:+34${PHONE_NUMBER}`}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-2.5 rounded-full hover:bg-emerald-50 transition-colors"
          >
            <Phone className="h-4 w-4" />
            Llama al {PHONE_DISPLAY}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main footer grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand + Contact */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-600 text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg text-white">Electricistas 24H</span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Servicio profesional de electricidad en toda España. Urgencias 24 horas, instalaciones, averías y reformas eléctricas.
            </p>
            <div className="space-y-2.5 text-sm">
              <a href={`tel:+34${PHONE_NUMBER}`} className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                <Phone className="h-4 w-4" />
                {PHONE_DISPLAY}
              </a>
              <a href="mailto:info@electricistass.com" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                info@electricistass.com
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4" />
                Toda España
              </span>
            </div>
          </div>

          {/* Services + Cities side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Servicios</h3>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service.slug}>
                    <Link 
                      href={`/${service.slug}`}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Ciudades</h3>
              <ul className="space-y-2">
                {cities.map((city) => (
                  <li key={city.slug}>
                    <Link 
                      href={`/electricista-${city.slug}`}
                      className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                    >
                      {city.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/politica-privacidad" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/aviso-legal" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link href="/politica-cookies" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Electricistas 24H. Todos los derechos reservados.</p>
          <a href="https://www.electricistass.com" className="hover:text-emerald-400 transition-colors">
            www.electricistass.com
          </a>
        </div>
      </div>
    </footer>
  )
}
