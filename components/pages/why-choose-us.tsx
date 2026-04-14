import { Shield, Clock, CheckCircle, Award, ThumbsUp, Wrench, Zap, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface WhyChooseUsProps {
  reasons: {
    title: string
    description: string
    icon?: string
  }[]
  serviceName: string
  cityName: string
  colorScheme?: string
}

const iconMap: Record<string, React.ElementType> = {
  shield: Shield,
  clock: Clock,
  check: CheckCircle,
  award: Award,
  thumbsup: ThumbsUp,
  wrench: Wrench,
  zap: Zap,
  heart: Heart,
}

const colorVariants: Record<string, { icon: string; bg: string }> = {
  blue: { icon: "text-blue-600", bg: "bg-blue-100" },
  green: { icon: "text-green-600", bg: "bg-green-100" },
  orange: { icon: "text-emerald-700", bg: "bg-orange-100" },
  teal: { icon: "text-teal-600", bg: "bg-teal-100" },
  indigo: { icon: "text-indigo-600", bg: "bg-indigo-100" },
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-100" },
  amber: { icon: "text-amber-600", bg: "bg-amber-100" },
  cyan: { icon: "text-cyan-600", bg: "bg-cyan-100" },
}

export function WhyChooseUs({ reasons, serviceName, cityName, colorScheme = "blue" }: WhyChooseUsProps) {
  const colors = colorVariants[colorScheme] || colorVariants.blue

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          ¿Por qué elegir nuestro servicio de {serviceName} en {cityName}?
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Somos profesionales comprometidos con la calidad y la satisfacción de nuestros clientes
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {reasons.map((reason, index) => {
          const IconComponent = iconMap[reason.icon?.toLowerCase() || "check"] || CheckCircle
          return (
            <div 
              key={index}
              className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className={cn("inline-flex p-3 rounded-lg mb-4", colors.bg)}>
                <IconComponent className={cn("h-6 w-6", colors.icon)} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {reason.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
