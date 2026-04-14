import { AlertCircle, CheckCircle2 } from "lucide-react"

interface CommonProblemsProps {
  problems: {
    problem: string
    description: string
    solution: string
  }[]
  serviceName: string
  cityName: string
}

export function CommonProblems({ problems, serviceName, cityName }: CommonProblemsProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Problemas comunes de {serviceName} en {cityName}
      </h2>
      <p className="text-muted-foreground mb-8">
        Estos son los problemas más frecuentes que resolvemos en {cityName} y cómo los solucionamos
      </p>
      
      <div className="space-y-6">
        {problems.map((item, index) => (
          <div 
            key={index}
            className="bg-card rounded-xl border overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.problem}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 border-t border-green-100">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800 text-sm mb-1">Nuestra solución:</p>
                  <p className="text-green-700 text-sm leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
