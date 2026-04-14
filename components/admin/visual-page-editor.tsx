"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { RichTextEditor } from "./rich-text-editor"
import { ImageUploader } from "./image-uploader"
import { 
  Save, 
  Loader2, 
  Eye, 
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  HelpCircle,
  Settings,
  CheckCircle,
  Globe,
  Sparkles,
  ExternalLink,
  Star,
  Plus,
  Trash2,
} from "lucide-react"

interface PageData {
  id: string
  slug: string
  title: string
  meta_description: string
  intro_text: string
  city_specific_content: string
  hero_image_url: string
  status: string
  faqs: Array<{ question: string; answer: string }>
  custom_reviews: Array<{
    name: string
    rating: number
    text: string
    date: string
    avatar_url?: string
    verified?: boolean
  }>
  services: { name: string; slug: string; icon?: string }
  cities: { name: string; slug: string; province: string }
  seo_config?: Record<string, unknown>
  layout_config?: Record<string, unknown>
}

interface VisualPageEditorProps {
  page: PageData
}

export function VisualPageEditor({ page: initialPage }: VisualPageEditorProps) {
  const router = useRouter()
  const [page, setPage] = useState(initialPage)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("contenido")

  const serviceName = page.services?.name || "Servicio"
  const cityName = page.cities?.name || "Ciudad"

  const handleSave = async (newStatus?: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...page,
          status: newStatus || page.status,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPage({ ...page, ...updated, status: newStatus || page.status })
      }
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/generate`, {
        method: "POST",
      })
      if (res.ok) {
        const updated = await res.json()
        setPage({ ...page, ...updated })
      }
    } catch (error) {
      console.error("Error generating:", error)
    } finally {
      setGenerating(false)
    }
  }

  const updateField = (field: string, value: unknown) => {
    setPage({ ...page, [field]: value })
  }

  const addFaq = () => {
    setPage({
      ...page,
      faqs: [...(page.faqs || []), { question: "", answer: "" }],
    })
  }

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const faqs = [...(page.faqs || [])]
    faqs[index] = { ...faqs[index], [field]: value }
    setPage({ ...page, faqs })
  }

  const removeFaq = (index: number) => {
    setPage({
      ...page,
      faqs: (page.faqs || []).filter((_, i) => i !== index),
    })
  }

  const addReview = () => {
    setPage({
      ...page,
      custom_reviews: [
        ...(page.custom_reviews || []),
        { name: "", rating: 5, text: "", date: new Date().toISOString().split("T")[0], verified: true },
      ],
    })
  }

  const updateReview = (index: number, field: string, value: unknown) => {
    const reviews = [...(page.custom_reviews || [])]
    reviews[index] = { ...reviews[index], [field]: value }
    setPage({ ...page, custom_reviews: reviews })
  }

  const removeReview = (index: number) => {
    setPage({
      ...page,
      custom_reviews: (page.custom_reviews || []).filter((_, i) => i !== index),
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/admin/paginas")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{serviceName} en {cityName}</span>
                  <Badge 
                    variant={page.status === "published" ? "default" : "secondary"}
                    className={page.status === "published" ? "bg-green-100 text-green-700" : ""}
                  >
                    {page.status === "published" ? "Publicada" : 
                     page.status === "pending" ? "Pendiente" : "Borrador"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">/{page.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/${page.slug}`, "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista previa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generar con IA
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave()}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
              {page.status !== "published" && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleSave("published")}
                  disabled={saving}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="contenido" className="gap-2">
              <FileText className="h-4 w-4" />
              Contenido
            </TabsTrigger>
            <TabsTrigger value="imagenes" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Imágenes
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Globe className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="contenido" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título de la página</Label>
                  <Input
                    id="title"
                    value={page.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder={`${serviceName} en ${cityName}`}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este título aparece en la pestaña del navegador y en Google
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meta_description">Descripción para Google</Label>
                  <Input
                    id="meta_description"
                    value={page.meta_description || ""}
                    onChange={(e) => updateField("meta_description", e.target.value)}
                    placeholder="Descripción que aparece en los resultados de búsqueda..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {(page.meta_description || "").length}/160 caracteres recomendados
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Texto de Introducción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Escribe el texto principal que aparece debajo del título. Usa negrita para destacar palabras clave.
                </p>
                <RichTextEditor
                  content={page.intro_text || ""}
                  onChange={(content) => updateField("intro_text", content)}
                  placeholder={`Escribe sobre el servicio de ${serviceName.toLowerCase()} en ${cityName}...`}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contenido Específico de {cityName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Información específica sobre el servicio en esta ciudad (barrios, zonas, particularidades).
                </p>
                <RichTextEditor
                  content={page.city_specific_content || ""}
                  onChange={(content) => updateField("city_specific_content", content)}
                  placeholder={`Información específica sobre ${cityName}...`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="imagenes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Imagen Principal (Hero)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta imagen aparece en la parte superior de la página.
                </p>
                <ImageUploader
                  value={page.hero_image_url || ""}
                  onChange={(url) => updateField("hero_image_url", url)}
                  label="Imagen Hero"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Preguntas Frecuentes</CardTitle>
                  <Button onClick={addFaq} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir pregunta
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!page.faqs || page.faqs.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HelpCircle className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No hay preguntas frecuentes todavía</p>
                    <Button onClick={addFaq} variant="link">
                      Añadir la primera pregunta
                    </Button>
                  </div>
                ) : (
                  page.faqs.map((faq, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-3">
                            <div>
                              <Label className="text-sm">Pregunta {index + 1}</Label>
                              <Input
                                value={faq.question}
                                onChange={(e) => updateFaq(index, "question", e.target.value)}
                                placeholder="¿Cuánto cuesta...?"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Respuesta</Label>
                              <RichTextEditor
                                content={faq.answer}
                                onChange={(content) => updateFaq(index, "answer", content)}
                                placeholder="La respuesta detallada..."
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFaq(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Opiniones de Clientes</CardTitle>
                  <Button onClick={addReview} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir opinión
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(!page.custom_reviews || page.custom_reviews.length === 0) ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No hay opiniones todavía</p>
                    <Button onClick={addReview} variant="link">
                      Añadir la primera opinión
                    </Button>
                  </div>
                ) : (
                  page.custom_reviews.map((review, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-sm">Nombre del cliente</Label>
                                <Input
                                  value={review.name}
                                  onChange={(e) => updateReview(index, "name", e.target.value)}
                                  placeholder="María García"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-sm">Fecha</Label>
                                <Input
                                  type="date"
                                  value={review.date}
                                  onChange={(e) => updateReview(index, "date", e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Puntuación</Label>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateReview(index, "rating", star)}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${
                                        star <= review.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm">Comentario</Label>
                              <RichTextEditor
                                content={review.text}
                                onChange={(content) => updateReview(index, "text", content)}
                                placeholder="Excelente servicio..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={review.verified}
                                onCheckedChange={(checked) => updateReview(index, "verified", checked)}
                              />
                              <Label className="text-sm">Cliente verificado</Label>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReview(index)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuración SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Vista previa en Google</h4>
                  <div className="space-y-1">
                    <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {page.title || `${serviceName} en ${cityName}`}
                    </p>
                    <p className="text-green-700 text-sm">
                      www.electricistass.com/{page.slug}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {page.meta_description || `Servicio profesional de ${serviceName.toLowerCase()} en ${cityName}. Llama al 900 433 214.`}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>URL de la página</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">https://www.electricistass.com/</span>
                    <Input
                      value={page.slug}
                      onChange={(e) => updateField("slug", e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estado de la página</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={page.status === "draft" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateField("status", "draft")}
                    >
                      Borrador
                    </Button>
                    <Button
                      variant={page.status === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateField("status", "pending")}
                    >
                      Pendiente
                    </Button>
                    <Button
                      variant={page.status === "published" ? "default" : "outline"}
                      size="sm"
                      className={page.status === "published" ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => updateField("status", "published")}
                    >
                      Publicada
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
