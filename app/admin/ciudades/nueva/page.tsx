import { redirect } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin/auth"
import { CityForm } from "@/components/admin/city-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function NewCityPage() {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/ciudades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nueva Ciudad</h1>
          <p className="text-muted-foreground mt-1">
            Añade una nueva ciudad para generar páginas pSEO
          </p>
        </div>
      </div>

      <CityForm />
    </div>
  )
}
