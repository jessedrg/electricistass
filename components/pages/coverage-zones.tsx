import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverageZone {
  name: string
  description?: string
  zip_codes?: string[]
  highlight?: string | null
}

interface CoverageZonesProps {
  zones: CoverageZone[]
  cityName: string
  title?: string
  className?: string
  colorScheme?: string
}

const colorVariants: Record<string, { icon: string; bg: string; highlight: string }> = {
  blue: { icon: "text-blue-600", bg: "bg-blue-50", highlight: "bg-blue-100 text-blue-700" },
  green: { icon: "text-green-600", bg: "bg-green-50", highlight: "bg-green-100 text-green-700" },
  orange: { icon: "text-emerald-700", bg: "bg-emerald-50", highlight: "bg-orange-100 text-orange-700" },
  teal: { icon: "text-teal-600", bg: "bg-teal-50", highlight: "bg-teal-100 text-teal-700" },
  indigo: { icon: "text-indigo-600", bg: "bg-indigo-50", highlight: "bg-indigo-100 text-indigo-700" },
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", highlight: "bg-emerald-100 text-emerald-700" },
  amber: { icon: "text-amber-600", bg: "bg-amber-50", highlight: "bg-amber-100 text-amber-700" },
  cyan: { icon: "text-cyan-600", bg: "bg-cyan-50", highlight: "bg-cyan-100 text-cyan-700" },
}

export function CoverageZones({ 
  zones, 
  cityName,
  title,
  className = "",
  colorScheme = "blue"
}: CoverageZonesProps) {
  if (!zones || zones.length === 0) return null

  const colors = colorVariants[colorScheme] || colorVariants.blue

  return (
    <div className={cn("max-w-5xl mx-auto", className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <MapPin className={cn("h-6 w-6", colors.icon)} />
        </div>
        <h2 className="text-2xl font-bold text-balance">
          {title || `Zonas de Cobertura en ${cityName}`}
        </h2>
      </div>
      <p className="text-muted-foreground mb-8">
        Ofrecemos servicio en los siguientes barrios y zonas de {cityName}:
      </p>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone, index) => (
          <div 
            key={index}
            className={cn(
              "p-5 rounded-xl border bg-card hover:shadow-md transition-all duration-300",
              zone.highlight && "ring-2 ring-offset-2",
              zone.highlight && colors.icon.replace("text-", "ring-")
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-1.5 rounded-md mt-0.5", colors.bg)}>
                <CheckCircle className={cn("h-4 w-4", colors.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{zone.name}</h3>
                {zone.highlight && (
                  <Badge className={cn("mt-1 text-xs", colors.highlight)}>
                    {zone.highlight}
                  </Badge>
                )}
                {zone.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {zone.description}
                  </p>
                )}
                {zone.zip_codes && zone.zip_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {zone.zip_codes.map((code, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-normal">
                        {code}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
