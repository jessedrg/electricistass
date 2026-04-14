import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { CityForm } from "@/components/admin/city-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCityPage({ params }: PageProps) {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  const { id } = await params
  const supabase = await createClient()

  const { data: city } = await supabase
    .from("cities")
    .select("*")
    .eq("id", id)
    .single()

  if (!city) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/ciudades">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar {city.name}</h1>
          <p className="text-muted-foreground mt-1">
            Modifica los datos de la ciudad
          </p>
        </div>
      </div>

      <CityForm city={city} />
    </div>
  )
}
