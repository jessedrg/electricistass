import { redirect } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Edit, Eye, ImageOff, Upload } from "lucide-react"

export default async function CitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("cities")
    .select("*")
    .order("name")

  if (q) {
    query = query.ilike("name", `%${q}%`)
  }

  const { data: cities } = await query

  // Get page counts per city
  const { data: pageCounts } = await supabase
    .from("pages")
    .select("city_id, status")

  const cityPageStats = cities?.map(city => {
    const cityPages = pageCounts?.filter(p => p.city_id === city.id) || []
    return {
      ...city,
      totalPages: cityPages.length,
      publishedPages: cityPages.filter(p => p.status === "published").length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ciudades</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las ciudades donde ofreces servicios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/ciudades/importar">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/admin/ciudades/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Ciudad
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Buscar ciudades..."
                defaultValue={q}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ciudad</TableHead>
                <TableHead>Provincia</TableHead>
                <TableHead>Población</TableHead>
                <TableHead>Páginas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cityPageStats?.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {city.name}
                          {!city.city_image_url && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title="Sin imagen de ciudad">
                              <ImageOff className="h-3 w-3" />
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">/{city.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{city.province}</TableCell>
                  <TableCell>
                    {city.population?.toLocaleString("es-ES")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {city.publishedPages} publicadas
                      </Badge>
                      {city.totalPages - city.publishedPages > 0 && (
                        <Badge variant="secondary" className="bg-emerald-50 text-orange-700">
                          {city.totalPages - city.publishedPages} pendientes
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/fontanero-${city.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/ciudades/${city.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!cityPageStats || cityPageStats.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay ciudades. Crea la primera.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
