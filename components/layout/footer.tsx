import Link from "next/link"
import { Phone, Mail, MapPin, Zap, ArrowRight, Clock, Shield, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

const electricalServices = [
  { name: "Averías Eléctricas", href: "/#servicios" },
  { name: "Instalaciones", href: "/#servicios" },
  { name: "Cuadros Eléctricos", href: "/#servicios" },
  { name: "Iluminación", href: "/#servicios" },
  { name: "Boletines Eléctricos", href: "/#servicios" },
  { name: "Urgencias 24h", href: "/#contacto" },
]

async function getFooterData() {
  const supabase = await createClient()
  
  const { data: cities } = await supabase
    .from("cities")
    .select("name, slug")
    .order("population", { ascending: false, nullsFirst: false })
    .limit(6)
  
  return {
    cities: cities || []
  }
}

export async function Footer() {
  const { cities } = await getFooterData()
  
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-full bg-white/10">
              <Zap className="h-6 w-6 text-yellow-300" />
            </div>
            <div>
              <span className="text-lg font-semibold block">¿Necesitas un electricista urgente?</span>
              <span className="text-emerald-100 text-sm">Respondemos en menos de 30 minutos</span>
            </div>
          </div>
          <a 
            href={`tel:+34${PHONE_NUMBER}`}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3 rounded-full hover:bg-emerald-50 transition-colors shadow-lg"
          >
            <Phone className="h-4 w-4" />
            Llama al {PHONE_DISPLAY}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + Contact */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600 text-white">
                <Zap className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-white">Electricistas 24H</span>
            </Link>
            <p className="text-sm text-gray-400 mb-5 leading-relaxed">
              Servicio profesional de electricidad en toda España. Urgencias 24 horas, instalaciones, averías y certificados eléctricos.
            </p>
            <div className="space-y-3 text-sm">
              <a href={`tel:+34${PHONE_NUMBER}`} className="flex items-center gap-2.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                <Phone className="h-4 w-4" />
                {PHONE_DISPLAY}
              </a>
              <a href="mailto:info@instalacioneselectricasjj.com" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail className="h-4 w-4" />
                info@instalacioneselectricasjj.com
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4" />
                Toda España
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Servicios</h3>
            <ul className="space-y-2.5">
              {electricalServices.map((service) => (
                <li key={service.name}>
                  <Link 
                    href={service.href}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    <Zap className="h-3 w-3" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Ciudades</h3>
            <ul className="space-y-2.5">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link 
                    href={`/electricista-${city.slug}`}
                    className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    Electricista en {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/electricista-main"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  Ver todas las ciudades
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Info + Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Información</h3>
            <ul className="space-y-2.5 mb-6">
              <li>
                <Link href="/blog" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
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
            </ul>
            
            {/* Trust badges */}
            <div className="space-y-2 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                Servicio 24/7
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Profesionales certificados
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                Garantía en trabajos
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Electricistas 24H. Todos los derechos reservados.</p>
          <a href="https://www.instalacioneselectricasjj.com" className="hover:text-emerald-400 transition-colors">
            www.instalacioneselectricasjj.com
          </a>
        </div>
      </div>
    </footer>
  )
}
