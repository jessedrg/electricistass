"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface PendingPage {
  id: string
  slug: string
  services: { name: string } | null
  cities: { name: string } | null
}

interface GeneratePanelProps {
  pendingCount: number
  publishedCount: number
  pendingPages: PendingPage[]
}

export function GeneratePanel({ pendingCount, publishedCount, pendingPages }: GeneratePanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(5)
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [results, setResults] = useState<{ success: number; errors: number; messages: string[] }>({ 
    success: 0, 
    errors: 0, 
    messages: [] 
  })

  const handleBulkGenerate = async () => {
    setLoading(true)
    setResults({ success: 0, errors: 0, messages: [] })

    try {
      const res = await fetch(`/api/admin/generate-pages?count=${count}`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al generar")
      }

      setResults({
        success: data.generated || 0,
        errors: data.errors || 0,
        messages: data.messages || [],
      })

      router.refresh()
    } catch (error) {
      setResults({
        success: 0,
        errors: 1,
        messages: [error instanceof Error ? error.message : "Error desconocido"],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectedGenerate = async () => {
    if (selectedPages.length === 0) return

    setLoading(true)
    setResults({ success: 0, errors: 0, messages: [] })

    let success = 0
    let errors = 0
    const messages: string[] = []

    for (const pageId of selectedPages) {
      try {
        const res = await fetch(`/api/admin/pages/${pageId}/generate`, {
          method: "POST",
        })

        if (res.ok) {
          success++
        } else {
          errors++
          const data = await res.json()
          messages.push(data.error || `Error en página ${pageId}`)
        }
      } catch (error) {
        errors++
        messages.push(`Error: ${error instanceof Error ? error.message : "desconocido"}`)
      }
    }

    setResults({ success, errors, messages })
    setSelectedPages([])
    router.refresh()
    setLoading(false)
  }

  const togglePage = (pageId: string) => {
    setSelectedPages(prev =>
      prev.includes(pageId)
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    )
  }

  const toggleAll = () => {
    if (selectedPages.length === pendingPages.length) {
      setSelectedPages([])
    } else {
      setSelectedPages(pendingPages.map(p => p.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Clock className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-sm text-muted-foreground">Publicadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount + publishedCount}</p>
                <p className="text-sm text-muted-foreground">Total páginas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Generate */}
      <Card>
        <CardHeader>
          <CardTitle>Generación automática</CardTitle>
          <CardDescription>
            Genera contenido con IA para múltiples páginas a la vez
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Número de páginas a generar</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="w-32"
              />
            </div>
            <Button
              onClick={handleBulkGenerate}
              disabled={loading || pendingCount === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generar {count} páginas
            </Button>
          </div>

          {results.success > 0 || results.errors > 0 ? (
            <div className={`p-4 rounded-lg ${results.errors > 0 ? "bg-red-50" : "bg-green-50"}`}>
              <div className="flex items-center gap-2">
                {results.errors > 0 ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span className={results.errors > 0 ? "text-red-700" : "text-green-700"}>
                  {results.success} generadas correctamente
                  {results.errors > 0 && `, ${results.errors} errores`}
                </span>
              </div>
              {results.messages.length > 0 && (
                <ul className="mt-2 text-sm text-muted-foreground">
                  {results.messages.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Select and Generate */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar páginas</CardTitle>
          <CardDescription>
            Selecciona páginas específicas para generar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingPages.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedPages.length === pendingPages.length}
                    onCheckedChange={toggleAll}
                  />
                  <Label className="font-normal">Seleccionar todas</Label>
                </div>
                {selectedPages.length > 0 && (
                  <Button
                    onClick={handleSelectedGenerate}
                    disabled={loading}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generar {selectedPages.length} seleccionadas
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingPages.map((page) => (
                  <div
                    key={page.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedPages.includes(page.id)}
                      onCheckedChange={() => togglePage(page.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        {page.services?.name} en {page.cities?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-orange-700">
                      Pendiente
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No hay páginas pendientes de generar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
