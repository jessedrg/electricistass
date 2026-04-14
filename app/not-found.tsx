import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Phone, Home, Search, ArrowLeft } from "lucide-react"

const PHONE_NUMBER = "900433214"
const PHONE_DISPLAY = "900 433 214"

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="flex justify-center">
          <Image
            src="/logo.jpg"
            alt="Electricistas 24H"
            width={80}
            height={80}
            className="rounded-xl"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-emerald-600">404</h1>
          <h2 className="text-2xl font-semibold">Página no encontrada</h2>
          <p className="text-muted-foreground">
            Lo sentimos, la página que buscas no existe o ha sido movida. 
            Pero no te preocupes, estamos aquí para ayudarte.
          </p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-6 space-y-3">
          <p className="font-medium text-orange-700">
            ¿Necesitas ayuda urgente?
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            {PHONE_DISPLAY}
          </p>
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <a href={`tel:+34${PHONE_NUMBER}`}>
              <Phone className="h-4 w-4" />
              Llamar Ahora
            </a>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/fontanero-main">
              <Search className="h-4 w-4" />
              Ver Servicios
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          <Link href="/" className="text-emerald-600 hover:underline">
            <ArrowLeft className="h-3 w-3 inline mr-1" />
            Volver a Electricistas 24H
          </Link>
        </p>
      </div>
    </main>
  )
}
