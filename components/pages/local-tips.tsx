import { Lightbulb, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocalTipsProps {
  tips?: string
  tipsList?: {
    tip: string
    explanation: string
  }[]
  cityName: string
  serviceName: string
  colorScheme?: string
}

const colorVariants: Record<string, { bg: string; border: string; icon: string }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", icon: "text-blue-600" },
  green: { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600" },
  orange: { bg: "bg-emerald-50", border: "border-orange-200", icon: "text-emerald-700" },
  teal: { bg: "bg-teal-50", border: "border-teal-200", icon: "text-teal-600" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "text-emerald-600" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", icon: "text-cyan-600" },
}

export function LocalTips({ tips, tipsList, cityName, serviceName, colorScheme = "blue" }: LocalTipsProps) {
  const colors = colorVariants[colorScheme] || colorVariants.blue

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-2 rounded-lg", colors.bg)}>
          <Lightbulb className={cn("h-6 w-6", colors.icon)} />
        </div>
        <h2 className="text-2xl font-bold">
          Consejos de {serviceName} para {cityName}
        </h2>
      </div>
      
      {tips && (
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {tips}
          </p>
        </div>
      )}
      
      {tipsList && tipsList.length > 0 && (
        <div className="grid gap-4 mt-8">
          {tipsList.map((item, index) => (
            <div 
              key={index}
              className={cn("p-5 rounded-xl border", colors.bg, colors.border)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("flex-shrink-0 p-1.5 rounded-full bg-background")}>
                  <Info className={cn("h-4 w-4", colors.icon)} />
                </div>
                <div>
                  <p className="font-medium mb-1">{item.tip}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
