"use client"

import { MapPin } from "lucide-react"

interface GoogleMapsEmbedProps {
  cityName: string
  latitude: number
  longitude: number
  className?: string
  height?: number
  zoom?: number
}

export function GoogleMapsEmbed({ 
  cityName, 
  latitude, 
  longitude, 
  className = "",
  height = 400,
  zoom = 12,
}: GoogleMapsEmbedProps) {
  // Google Maps embed using place search (no API key needed)
  const searchQuery = encodeURIComponent(`${cityName}, España`)
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`
  const googleMapsLink = `https://www.google.com/maps/search/${searchQuery}`
  
  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-lg border bg-muted ${className}`}>
      <iframe
        title={`Mapa de cobertura en ${cityName}`}
        src={googleMapsEmbedUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/95 to-transparent p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Cobertura en {cityName}
              </p>
              <p className="text-sm text-muted-foreground">
                Servicio disponible en toda la ciudad
              </p>
            </div>
          </div>
          <a 
            href={googleMapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
          >
            Ver en Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
