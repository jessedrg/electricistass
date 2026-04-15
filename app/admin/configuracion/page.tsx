import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/admin/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Database, Image, Bot, Globe } from "lucide-react"
import { CronToggle } from "@/components/admin/cron-toggle"

export default async function ConfigPage() {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  const configs = [
    {
      name: "Base de datos (Supabase)",
      icon: Database,
      status: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      vars: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    },
    {
      name: "Almacenamiento de imágenes (Blob)",
      icon: Image,
      status: !!process.env.BLOB_READ_WRITE_TOKEN,
      vars: ["BLOB_READ_WRITE_TOKEN"],
    },
    {
      name: "IA para generación (OpenAI)",
      icon: Bot,
      status: !!process.env.OPENAI_API_KEY,
      vars: ["OPENAI_API_KEY"],
    },
    {
      name: "Contraseña Admin",
      icon: Globe,
      status: !!process.env.ADMIN_PASSWORD,
      vars: ["ADMIN_PASSWORD"],
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Estado de las integraciones y variables de entorno
        </p>
      </div>

      {/* Cron Toggle */}
      <CronToggle />

      <div className="grid gap-4">
        {configs.map((config) => (
          <Card key={config.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    config.status ? "bg-green-50" : "bg-red-50"
                  }`}>
                    <config.icon className={`h-5 w-5 ${
                      config.status ? "text-green-600" : "text-red-600"
                    }`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <CardDescription>
                      Variables: {config.vars.join(", ")}
                    </CardDescription>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={config.status 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {config.status ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configurado
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No configurado
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cómo configurar</CardTitle>
          <CardDescription>
            Las variables de entorno se configuran en Vercel o en el archivo .env.local
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Ve al dashboard de Vercel del proyecto</li>
            <li>Settings → Environment Variables</li>
            <li>Añade las variables que falten</li>
            <li>Redeploya el proyecto para que surtan efecto</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
