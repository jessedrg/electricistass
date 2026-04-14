"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface ImportResult {
  name: string
  status: "success" | "error" | "exists"
  message?: string
}

export default function ImportServicesPage() {
  const router = useRouter()
  const [servicesText, setServicesText] = useState("")
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleImport = async () => {
    if (!servicesText.trim()) return

    setImporting(true)
    setResults([])
    setShowResults(false)

    // Parse services - one per line
    const lines = servicesText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)

    const importResults: ImportResult[] = []

    for (const line of lines) {
      try {
        // Parse line - can be "Servicio, Descripcion corta" or just "Servicio"
        const parts = line.split(",").map(p => p.trim())
        const name = parts[0]
        const shortDescription = parts.slice(1).join(", ") || ""

        if (!name) {
          importResults.push({ name: line, status: "error", message: "Nombre vacio" })
          continue
        }

        // Generate slug
        const slug = name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")

        const res = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            short_description: shortDescription,
            description: "",
            keywords: [],
          }),
        })

        if (res.ok) {
          importResults.push({ name, status: "success" })
        } else {
          const error = await res.json()
          if (error.error?.includes("already exists") || error.error?.includes("duplicate")) {
            importResults.push({ name, status: "exists", message: "Ya existe" })
          } else {
            importResults.push({ name, status: "error", message: error.error || "Error desconocido" })
          }
        }
      } catch (err) {
        importResults.push({ name: line, status: "error", message: "Error de conexion" })
      }
    }

    setResults(importResults)
    setShowResults(true)
    setImporting(false)
  }

  const successCount = results.filter(r => r.status === "success").length
  const errorCount = results.filter(r => r.status === "error").length
  const existsCount = results.filter(r => r.status === "exists").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/servicios">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Importar Servicios</h1>
          <p className="text-muted-foreground mt-1">
            Anade multiples servicios/profesiones de una vez
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de servicios</CardTitle>
            <CardDescription>
              Pega una lista de servicios, uno por linea. Opcionalmente anade una descripcion despues de una coma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="services">Servicios (uno por linea)</Label>
              <Textarea
                id="services"
                placeholder={`Ejemplo:
Cerrajero, Apertura de puertas y cambio de cerraduras
Electricista, Reparaciones electricas y instalaciones
Fontanero, Reparacion de fugas y desatascos
Pintor, Pintura de interiores y exteriores
Albanil, Obras y reformas`}
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                disabled={importing}
              />
              <p className="text-xs text-muted-foreground">
                Puedes copiar desde Excel o Google Sheets. La descripcion es opcional.
              </p>
            </div>

            <Button
              onClick={handleImport}
              disabled={importing || !servicesText.trim()}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {importing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Servicios
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            {showResults && (
              <CardDescription>
                {successCount} importados, {existsCount} ya existian, {errorCount} errores
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {!showResults ? (
              <div className="text-center py-12 text-muted-foreground">
                Los resultados apareceran aqui
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.status === "success"
                        ? "bg-green-50"
                        : result.status === "exists"
                        ? "bg-yellow-50"
                        : "bg-red-50"
                    }`}
                  >
                    {result.status === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : result.status === "exists" ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.name}</p>
                      {result.message && (
                        <p className="text-xs text-muted-foreground">{result.message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showResults && successCount > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button asChild className="w-full">
                  <Link href="/admin/servicios">Ver todos los servicios</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
