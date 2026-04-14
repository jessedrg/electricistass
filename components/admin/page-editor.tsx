"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUploader } from "@/components/admin/image-uploader"
import { ReviewsEditor } from "@/components/admin/reviews-editor"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { FAQsEditor } from "@/components/admin/faqs-editor"
import { Save, Loader2, Eye, Sparkles } from "lucide-react"

interface PageEditorProps {
  page: {
    id: string
    slug: string
    status: string
    title?: string
    meta_description?: string
    h1?: string
    intro_text?: string
    hero_image_url?: string
    content?: Record<string, unknown>
    faqs?: Array<{ question: string; answer: string }>
    custom_reviews?: Array<{
      name: string
      rating: number
      text: string
      location?: string
      date?: string
      avatar_url?: string
      verified?: boolean
    }>
    seo_config?: Record<string, unknown>
    layout_config?: Record<string, unknown>
    design_variation?: Record<string, unknown>
    images_config?: Record<string, unknown>
    sitemap_priority?: number
    sitemap_changefreq?: string
    sitemap_exclude?: boolean
    services: { name: string; slug: string }
    cities: { name: string; slug: string }
  }
}

export function PageEditor({ page }: PageEditorProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const serviceName = page.services?.name || ""
  const cityName = page.cities?.name || ""

  // Form state
  const [formData, setFormData] = useState({
    status: page.status || "pending",
    title: page.title || `${serviceName} en ${cityName} | Electricistas 24H`,
    meta_description: page.meta_description || "",
    h1: page.h1 || `${serviceName} en ${cityName}`,
    intro_text: page.intro_text || "",
    hero_image_url: page.hero_image_url || "",
    sitemap_priority: page.sitemap_priority || 0.8,
    sitemap_changefreq: page.sitemap_changefreq || "weekly",
    sitemap_exclude: page.sitemap_exclude || false,
  })

  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    page.faqs || []
  )

  const [reviews, setReviews] = useState(page.custom_reviews || [])

  const [seoConfig, setSeoConfig] = useState({
    og_title: (page.seo_config as Record<string, string>)?.og_title || "",
    og_description: (page.seo_config as Record<string, string>)?.og_description || "",
    og_image: (page.seo_config as Record<string, string>)?.og_image || "",
    keywords: (page.seo_config as Record<string, string[]>)?.keywords?.join(", ") || "",
    no_index: (page.seo_config as Record<string, boolean>)?.no_index || false,
  })

  const [layoutConfig, setLayoutConfig] = useState({
    hero_height: (page.layout_config as Record<string, string>)?.hero_height || "large",
    content_width: (page.layout_config as Record<string, string>)?.content_width || "normal",
    show_map: (page.layout_config as Record<string, boolean>)?.show_map !== false,
    show_reviews: (page.layout_config as Record<string, boolean>)?.show_reviews !== false,
    show_faqs: (page.layout_config as Record<string, boolean>)?.show_faqs !== false,
    show_cta: (page.layout_config as Record<string, boolean>)?.show_cta !== false,
  })

  const [designVariation, setDesignVariation] = useState({
    color_scheme: (page.design_variation as Record<string, string>)?.color_scheme || "orange",
    hero_style: (page.design_variation as Record<string, string>)?.hero_style || "gradient",
    cta_style: (page.design_variation as Record<string, string>)?.cta_style || "prominent",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        ...formData,
        faqs: faqs.filter(f => f.question && f.answer),
        custom_reviews: reviews,
        seo_config: {
          ...seoConfig,
          keywords: seoConfig.keywords.split(",").map(k => k.trim()).filter(Boolean),
        },
        layout_config: layoutConfig,
        design_variation: designVariation,
      }

      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateWithAI = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/pages/${page.id}/generate`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al generar")
      }

      router.refresh()
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="published">Publicada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge 
                variant="outline"
                className={
                  formData.status === "published" 
                    ? "bg-green-50 text-green-700 border-green-200"
                    : formData.status === "pending"
                    ? "bg-emerald-50 text-orange-700 border-orange-200"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                }
              >
                {formData.status === "published" ? "Publicada" :
                 formData.status === "pending" ? "Pendiente" : "Borrador"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateWithAI}
                disabled={loading}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generar con IA
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="design">Diseño</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido principal</CardTitle>
              <CardDescription>Textos e imágenes de la página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="h1">Título H1</Label>
                <Input
                  id="h1"
                  name="h1"
                  value={formData.h1}
                  onChange={handleChange}
                  placeholder="Fontanero en Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label>Texto de introducción</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Usa las herramientas para dar formato: negrita, cursiva, enlaces, listas, etc.
                </p>
                <RichTextEditor
                  content={formData.intro_text}
                  onChange={(content) => setFormData(prev => ({ ...prev, intro_text: content }))}
                  placeholder="Escribe el texto introductorio. Puedes usar negrita, enlaces, listas..."
                />
              </div>

              <div className="space-y-2">
                <Label>Imagen Hero</Label>
                <ImageUploader
                  value={formData.hero_image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, hero_image_url: url }))}
                  folder={`pages/${page.slug}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tags</CardTitle>
              <CardDescription>Configuración para Google y redes sociales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meta Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Fontanero en Madrid | Electricistas 24H - 900 433 214"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/60 caracteres recomendados
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleChange}
                  placeholder="Descripción que aparece en Google..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 caracteres recomendados
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="og_title">OG Title (redes sociales)</Label>
                  <Input
                    id="og_title"
                    value={seoConfig.og_title}
                    onChange={(e) => setSeoConfig(prev => ({ ...prev, og_title: e.target.value }))}
                    placeholder="Título para compartir"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="og_description">OG Description</Label>
                  <Input
                    id="og_description"
                    value={seoConfig.og_description}
                    onChange={(e) => setSeoConfig(prev => ({ ...prev, og_description: e.target.value }))}
                    placeholder="Descripción para compartir"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (separadas por coma)</Label>
                <Input
                  id="keywords"
                  value={seoConfig.keywords}
                  onChange={(e) => setSeoConfig(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="fontanero madrid, fontanería urgente, desatascos..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sitemap</CardTitle>
              <CardDescription>Configuración para el archivo sitemap.xml</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sitemap_priority">Prioridad (0.0 - 1.0)</Label>
                  <Input
                    id="sitemap_priority"
                    name="sitemap_priority"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.sitemap_priority}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia de cambio</Label>
                  <Select
                    value={formData.sitemap_changefreq}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sitemap_changefreq: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Siempre</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Excluir del sitemap</Label>
                  <div className="flex items-center h-10">
                    <Switch
                      checked={formData.sitemap_exclude}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sitemap_exclude: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={seoConfig.no_index}
                  onCheckedChange={(checked) => setSeoConfig(prev => ({ ...prev, no_index: checked }))}
                />
                <Label>No indexar (noindex)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="mt-6">
          <FAQsEditor faqs={faqs} onChange={setFaqs} />
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6">
          <ReviewsEditor reviews={reviews} onChange={setReviews} />
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
              <CardDescription>Configuración de la estructura de la página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Altura del Hero</Label>
                  <Select
                    value={layoutConfig.hero_height}
                    onValueChange={(value) => setLayoutConfig(prev => ({ ...prev, hero_height: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="full">Pantalla completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ancho del contenido</Label>
                  <Select
                    value={layoutConfig.content_width}
                    onValueChange={(value) => setLayoutConfig(prev => ({ ...prev, content_width: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="narrow">Estrecho</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="wide">Ancho</SelectItem>
                      <SelectItem value="full">Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Secciones visibles</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { key: "show_map", label: "Mostrar mapa" },
                    { key: "show_reviews", label: "Mostrar reviews" },
                    { key: "show_faqs", label: "Mostrar FAQs" },
                    { key: "show_cta", label: "Mostrar CTA" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Switch
                        checked={layoutConfig[key as keyof typeof layoutConfig] as boolean}
                        onCheckedChange={(checked) => setLayoutConfig(prev => ({ ...prev, [key]: checked }))}
                      />
                      <Label>{label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estilo visual</CardTitle>
              <CardDescription>Colores y variantes de diseño</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Esquema de color</Label>
                  <Select
                    value={designVariation.color_scheme}
                    onValueChange={(value) => setDesignVariation(prev => ({ ...prev, color_scheme: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange">Naranja</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Púrpura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estilo del Hero</Label>
                  <Select
                    value={designVariation.hero_style}
                    onValueChange={(value) => setDesignVariation(prev => ({ ...prev, hero_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Degradado</SelectItem>
                      <SelectItem value="image">Con imagen</SelectItem>
                      <SelectItem value="minimal">Minimalista</SelectItem>
                      <SelectItem value="split">Dividido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estilo del CTA</Label>
                  <Select
                    value={designVariation.cta_style}
                    onValueChange={(value) => setDesignVariation(prev => ({ ...prev, cta_style: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prominent">Prominente</SelectItem>
                      <SelectItem value="subtle">Sutil</SelectItem>
                      <SelectItem value="floating">Flotante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
    </form>
  )
}
