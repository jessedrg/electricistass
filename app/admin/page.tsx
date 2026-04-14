"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  FileText, 
  Globe,
  Clock,
  CheckCircle,
  Edit,
  Loader2,
  ArrowRight,
  Sparkles
} from "lucide-react"

interface Stats {
  total: number
  published: number
  draft: number
  pending: number
}

interface RecentPage {
  id: string
  slug: string
  status: string
  updated_at: string
  services: { name: string } | null
  cities: { name: string } | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0, pending: 0 })
  const [recentPages, setRecentPages] = useState<RecentPage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, pagesRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/pages/list")
        ])
        
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.pages || { total: 0, published: 0, draft: 0, pending: 0 })
        }
        
        if (pagesRes.ok) {
          const pagesData = await pagesRes.json()
          setRecentPages((pagesData.pages || []).slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publicada</Badge>
      case "draft":
        return <Badge variant="secondary">Borrador</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona el contenido de Electricistas 24H
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/generar-lote">
              <Sparkles className="h-5 w-5 mr-2" />
              Generar en Lote
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/admin/nueva-pagina">
              <Plus className="h-5 w-5 mr-2" />
              Crear nueva pagina
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total páginas</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicadas</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Borradores</p>
                <p className="text-3xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Edit className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent Pages */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>Lo que puedes hacer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start h-auto py-4">
              <Link href="/admin/nueva-pagina">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Crear nueva página</p>
                    <p className="text-sm text-muted-foreground">Elige servicio y ciudad</p>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start h-auto py-4">
              <Link href="/admin/paginas">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Edit className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Ver todas las páginas</p>
                    <p className="text-sm text-muted-foreground">{stats.total} páginas creadas</p>
                  </div>
                </div>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full justify-start h-auto py-4">
              <Link href="/admin/ciudades">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Gestionar ciudades</p>
                    <p className="text-sm text-muted-foreground">Añadir o editar ciudades</p>
                  </div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Pages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Páginas recientes</CardTitle>
              <CardDescription>Últimas modificaciones</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/paginas">
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay páginas todavía</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/admin/nueva-pagina">Crear la primera</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPages.map((page) => (
                  <Link
                    key={page.id}
                    href={`/admin/paginas/${page.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-emerald-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-emerald-700" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {page.services?.name || "Servicio"} en {page.cities?.name || "Ciudad"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          /{page.slug}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(page.status)}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
