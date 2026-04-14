"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SimplePageEditor } from "@/components/admin/simple-page-editor"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditPagePage() {
  const params = useParams()
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/pages/${params.id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError("Página no encontrada")
          } else {
            setError("Error al cargar la página")
          }
          return
        }
        const data = await res.json()
        setPage(data.page)
      } catch (err) {
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPage()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">{error || "Página no encontrada"}</p>
        <Button asChild variant="outline">
          <Link href="/admin/paginas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a páginas
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/paginas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a todas las páginas
          </Link>
        </Button>
      </div>
      <SimplePageEditor page={page} />
    </div>
  )
}
