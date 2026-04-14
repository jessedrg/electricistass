import { redirect } from "next/navigation"
import Link from "next/link"
import { verifyAdminSession } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Wrench, Edit, Eye, Plus, Upload } from "lucide-react"

export default async function ServicesPage() {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  const supabase = await createClient()

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name")

  // Get page counts per service
  const { data: pageCounts } = await supabase
    .from("pages")
    .select("service_id, status")

  const serviceStats = services?.map(service => {
    const servicePages = pageCounts?.filter(p => p.service_id === service.id) || []
    return {
      ...service,
      totalPages: servicePages.length,
      publishedPages: servicePages.filter(p => p.status === "published").length,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los tipos de servicios que ofreces
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/servicios/importar">
              <Upload className="h-4 w-4 mr-2" />
              Importar
            </Link>
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/admin/servicios/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </Link>
          </Button>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            Los servicios se crean automáticamente con la configuración inicial. 
            Puedes editar sus descripciones y configuraciones para personalizar el contenido generado.
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servicio</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Páginas</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {serviceStats?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">/{service.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {service.short_description || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-50 text-green-700">
                        {service.publishedPages} publicadas
                      </Badge>
                      {service.totalPages - service.publishedPages > 0 && (
                        <Badge variant="secondary" className="bg-emerald-50 text-orange-700">
                          {service.totalPages - service.publishedPages} pendientes
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${service.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/servicios/${service.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
