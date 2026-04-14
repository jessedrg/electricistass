"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { ImageUploader } from "@/components/admin/image-uploader"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { 
  Save, 
  Loader2, 
  Eye, 
  Globe,
  Calendar,
  Star,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  ExternalLink,
  Check,
  AlertCircle,
  MapPin,
  Plus,
  Phone,
  Sparkles,
  Wand2
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface PageData {
  id: string
  slug: string
  status: string
  title: string | null
  meta_description: string | null
  h1: string | null
  intro_text: string | null
  hero_image_url: string | null
  sitemap_priority: number
  published_at: string | null
  faqs: Array<{ question: string; answer: string }> | null
  custom_reviews: Array<{ name: string; text: string; rating: number; location?: string; date_ago?: string }> | null
  service_id: string | null
  city_id: string | null
  parent_city_id: string | null
  is_neighborhood: boolean | null
  layout_config: { show_map?: boolean; map_latitude?: number; map_longitude?: number } | null
  services: { id: string; name: string; slug: string } | null
  cities: { id: string; name: string; slug: string } | null
  // New AI-generated fields
  highlight: string | null
  urgency_message: string | null
  final_cta_title: string | null
  final_cta_subtitle: string | null
  local_facts: {
    population_approx?: string
    famous_for?: string
    local_landmark?: string
    interesting_fact?: string
    nearby_areas?: string[]
    local_problem?: string
  } | null
  extra_section_type: string | null
  extra_section_content: string | null
  content_tone: string | null
  cta_button_text: string | null
  cta_secondary_text: string | null
  cta_badge_1: string | null
  cta_badge_2: string | null
  cta_badge_3: string | null
  latitude: number | null
  longitude: number | null
  show_map: boolean | null
}

interface Service {
  id: string
  name: string
  slug: string
}

interface City {
  id: string
  name: string
  slug: string
  province?: string
}

interface SimplePageEditorProps {
  page: PageData
}

export function SimplePageEditor({ page }: SimplePageEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  
  // Services and cities
  const [services, setServices] = useState<Service[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Create dialogs
  const [showNewService, setShowNewService] = useState(false)
  const [showNewCity, setShowNewCity] = useState(false)
  const [newServiceName, setNewServiceName] = useState("")
  const [newCityName, setNewCityName] = useState("")
  const [newCityProvince, setNewCityProvince] = useState("")
  const [creatingService, setCreatingService] = useState(false)
  const [creatingCity, setCreatingCity] = useState(false)
  
  const serviceName = page.services?.name || "Servicio"
  const cityName = page.cities?.name || "Ciudad"
  
  const [formData, setFormData] = useState({
    title: page.title || `${serviceName} en ${cityName} - Profesionales 24h`,
    meta_description: page.meta_description || `Servicio de ${serviceName.toLowerCase()} en ${cityName}. Llama al 900 433 214. Presupuesto gratis y atención urgente 24 horas.`,
    h1: page.h1 || "",
    intro_text: page.intro_text || "",
    hero_image_url: page.hero_image_url || "",
    status: page.status,
    sitemap_priority: page.sitemap_priority || 0.8,
    published_at: page.published_at ? page.published_at.split("T")[0] : new Date().toISOString().split("T")[0],
    // Service and city
    service_id: page.service_id || "",
    city_id: page.city_id || "",
    // Neighborhood
    is_neighborhood: page.is_neighborhood || false,
    parent_city_id: page.parent_city_id || "",
    // Map - use new direct fields first, fallback to layout_config
    show_map: page.show_map !== null ? page.show_map : (page.layout_config?.show_map !== false),
    latitude: page.latitude?.toString() || page.layout_config?.map_latitude?.toString() || "",
    longitude: page.longitude?.toString() || page.layout_config?.map_longitude?.toString() || "",
    map_zoom: page.layout_config?.map_zoom?.toString() || "12",
    // CTA config - use new direct fields first, fallback to layout_config
    phone_number: page.layout_config?.cta_config?.phone_number || "900433214",
    phone_display: page.layout_config?.cta_config?.phone_display || "900 433 214",
    cta_button_text: page.cta_button_text || page.layout_config?.cta_config?.button_text || "",
    cta_secondary_text: page.cta_secondary_text || page.layout_config?.cta_config?.secondary_button_text || "Presupuesto Gratis",
    cta_badge_1: page.cta_badge_1 || page.layout_config?.cta_config?.badge_1 || "Disponible 24h",
    cta_badge_2: page.cta_badge_2 || page.layout_config?.cta_config?.badge_2 || "Sin compromiso",
    cta_badge_3: page.cta_badge_3 || page.layout_config?.cta_config?.badge_3 || "Presupuesto gratis",
    // New AI-generated fields
    highlight: page.highlight || "",
    urgency_message: page.urgency_message || "",
    final_cta_title: page.final_cta_title || "",
    final_cta_subtitle: page.final_cta_subtitle || "",
    extra_section_type: page.extra_section_type || "ninguno",
    extra_section_content: page.extra_section_content || "",
    content_tone: page.content_tone || "profesional",
    // Local facts
    local_population: page.local_facts?.population_approx || "",
    local_famous_for: page.local_facts?.famous_for || "",
    local_landmark: page.local_facts?.local_landmark || "",
    local_interesting_fact: page.local_facts?.interesting_fact || "",
    local_problem: page.local_facts?.local_problem || "",
    local_nearby_areas: page.local_facts?.nearby_areas?.join(", ") || "",
  })
  
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    page.faqs || [
      { question: `¿Cuánto cuesta un ${serviceName.toLowerCase()} en ${cityName}?`, answer: "" },
      { question: `¿Tienen servicio de ${serviceName.toLowerCase()} urgente 24 horas?`, answer: "" },
    ]
  )
  
  const [reviews, setReviews] = useState<Array<{ name: string; text: string; rating: number; location?: string }>>(
    page.custom_reviews || []
  )

  // Load services and cities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, citiesRes] = await Promise.all([
          fetch("/api/admin/services"),
          fetch("/api/admin/cities"),
        ])
        
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setServices(Array.isArray(data) ? data : [])
        }
        
        if (citiesRes.ok) {
          const data = await citiesRes.json()
          setCities(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [])

  const createService = async () => {
    if (!newServiceName.trim()) return
    
    setCreatingService(true)
    try {
      const slug = newServiceName.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newServiceName, slug }),
      })
      
      if (res.ok) {
        const service = await res.json()
        setServices(prev => [...prev, service])
        setFormData(prev => ({ ...prev, service_id: service.id }))
        setNewServiceName("")
        setShowNewService(false)
      } else {
        const error = await res.json()
        alert(error.error || "Error al crear el servicio")
      }
    } catch {
      alert("Error al crear el servicio")
    } finally {
      setCreatingService(false)
    }
  }

  const createCity = async () => {
    if (!newCityName.trim()) return
    
    setCreatingCity(true)
    try {
      const slug = newCityName.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCityName, slug, province: newCityProvince }),
      })
      
      if (res.ok) {
        const city = await res.json()
        setCities(prev => [...prev, city])
        setFormData(prev => ({ ...prev, city_id: city.id }))
        setNewCityName("")
        setNewCityProvince("")
        setShowNewCity(false)
      } else {
        const error = await res.json()
        alert(error.error || "Error al crear la ciudad")
      }
    } catch {
      alert("Error al crear la ciudad")
    } finally {
      setCreatingCity(false)
    }
  }

  const handleSave = async (publish = false) => {
    setSaving(true)
    setError("")
    setSaved(false)
    
    try {
      const dataToSave = {
        title: formData.title,
        meta_description: formData.meta_description,
        h1: formData.h1,
        intro_text: formData.intro_text,
        hero_image_url: formData.hero_image_url,
        sitemap_priority: formData.sitemap_priority,
        service_id: formData.service_id || null,
        city_id: formData.city_id || null,
        parent_city_id: formData.parent_city_id || null,
        is_neighborhood: formData.is_neighborhood,
        status: publish ? "published" : formData.status === "published" ? "published" : "pending",
        published_at: publish ? new Date(formData.published_at).toISOString() : 
                      formData.status === "published" ? new Date(formData.published_at).toISOString() : null,
        faqs,
        custom_reviews: reviews.length > 0 ? reviews : null,
        layout_config: {
          show_map: formData.show_map,
          map_latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          map_longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          map_zoom: formData.map_zoom ? parseInt(formData.map_zoom) : 12,
          cta_config: {
            phone_number: formData.phone_number || "900433214",
            phone_display: formData.phone_display || "900 433 214",
            button_text: formData.cta_button_text || formData.phone_display || "900 433 214",
            secondary_button_text: formData.cta_secondary_text || "Presupuesto Gratis",
            badge_1: formData.cta_badge_1 || "Disponible 24h",
            badge_2: formData.cta_badge_2 || "Sin compromiso",
            badge_3: formData.cta_badge_3 || "Presupuesto gratis",
          },
        },
        // New direct fields
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        show_map: formData.show_map,
        cta_button_text: formData.cta_button_text || null,
        cta_secondary_text: formData.cta_secondary_text || null,
        cta_badge_1: formData.cta_badge_1 || null,
        cta_badge_2: formData.cta_badge_2 || null,
        cta_badge_3: formData.cta_badge_3 || null,
        // New AI-generated fields
        highlight: formData.highlight || null,
        urgency_message: formData.urgency_message || null,
        final_cta_title: formData.final_cta_title || null,
        final_cta_subtitle: formData.final_cta_subtitle || null,
        extra_section_type: formData.extra_section_type || null,
        extra_section_content: formData.extra_section_content || null,
        content_tone: formData.content_tone || null,
        // Local facts
        local_facts: {
          population_approx: formData.local_population || undefined,
          famous_for: formData.local_famous_for || undefined,
          local_landmark: formData.local_landmark || undefined,
          interesting_fact: formData.local_interesting_fact || undefined,
          local_problem: formData.local_problem || undefined,
          nearby_areas: formData.local_nearby_areas ? formData.local_nearby_areas.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        },
      }
      
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al guardar")
      }
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      
      if (publish && formData.status !== "published") {
        setFormData(prev => ({ ...prev, status: "published" }))
      }
      
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "" }])
  }

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqs]
    updated[index][field] = value
    setFaqs(updated)
  }

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const addReview = () => {
    setReviews([...reviews, { name: "", text: "", rating: 5, location: cityName }])
  }

  const updateReview = (index: number, field: string, value: string | number) => {
    const updated = [...reviews]
    updated[index] = { ...updated[index], [field]: value }
    setReviews(updated)
  }

  const removeReview = (index: number) => {
    setReviews(reviews.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{serviceName} en {cityName}</h1>
            <Badge 
              className={
                formData.status === "published" 
                  ? "bg-green-100 text-green-700" 
                  : formData.status === "draft"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
              }
            >
              {formData.status === "published" ? "Publicada" : formData.status === "draft" ? "Borrador" : "Pendiente"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>/{page.slug}</span>
            {formData.status === "published" && (
              <a 
                href={`/${page.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-700 hover:text-orange-700 flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Ver página
              </a>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              Guardado
            </div>
          )}
          <Button 
            variant="outline" 
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar borrador
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            {formData.status === "published" ? "Actualizar" : "Publicar"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="contenido" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:inline-grid">
          <TabsTrigger value="contenido" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Contenido</span>
          </TabsTrigger>
          <TabsTrigger value="asignar" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Asignar</span>
          </TabsTrigger>
          <TabsTrigger value="ctas" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">CTAs</span>
          </TabsTrigger>
          <TabsTrigger value="imagen" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Imagen</span>
          </TabsTrigger>
          <TabsTrigger value="mapa" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Mapa</span>
          </TabsTrigger>
          <TabsTrigger value="faqs" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">FAQs</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="publicacion" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Publicacion</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenido Tab */}
        <TabsContent value="contenido" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido de la página</CardTitle>
              <CardDescription>
                El título y descripción aparecen en Google. El texto de introducción es el contenido principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título (aparece en Google)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`${serviceName} en ${cityName} - Profesionales 24h`}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/60 caracteres recomendados
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="meta_description">Descripción (aparece en Google)</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Descripción para buscadores..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 caracteres recomendados
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Texto de introducción</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Puedes usar negrita, enlaces, listas y más. Este texto aparece en la página.
                </p>
                <RichTextEditor
                  content={formData.intro_text}
                  onChange={(content) => setFormData(prev => ({ ...prev, intro_text: content }))}
                  placeholder={`Escribe sobre el servicio de ${serviceName.toLowerCase()} en ${cityName}...`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asignar Tab - Service/City */}
        <TabsContent value="asignar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Servicio y Ciudad</CardTitle>
              <CardDescription>
                Asigna un servicio y ciudad a esta pagina. Aparecera en el hero y en los listados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Service selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Servicio</Label>
                  <Dialog open={showNewService} onOpenChange={setShowNewService}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Crear
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Servicio</DialogTitle>
                        <DialogDescription>Anade un nuevo servicio a la lista</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre del servicio</Label>
                          <Input
                            value={newServiceName}
                            onChange={(e) => setNewServiceName(e.target.value)}
                            placeholder="Ej: Fontanero, Electricista..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewService(false)}>Cancelar</Button>
                        <Button onClick={createService} disabled={creatingService || !newServiceName.trim()}>
                          {creatingService ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Crear Servicio
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select 
                  value={formData.service_id || "none"} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, service_id: v === "none" ? "" : v }))}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar servicio"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin servicio</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Ciudad</Label>
                  <Dialog open={showNewCity} onOpenChange={setShowNewCity}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Crear
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Ciudad</DialogTitle>
                        <DialogDescription>Anade una nueva ciudad a la lista</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Nombre de la ciudad</Label>
                          <Input
                            value={newCityName}
                            onChange={(e) => setNewCityName(e.target.value)}
                            placeholder="Ej: Madrid, Barcelona..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Provincia (opcional)</Label>
                          <Input
                            value={newCityProvince}
                            onChange={(e) => setNewCityProvince(e.target.value)}
                            placeholder="Ej: Madrid, Cataluna..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewCity(false)}>Cancelar</Button>
                        <Button onClick={createCity} disabled={creatingCity || !newCityName.trim()}>
                          {creatingCity ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Crear Ciudad
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select 
                  value={formData.city_id || "none"} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, city_id: v === "none" ? "" : v }))}
                  disabled={loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar ciudad"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin ciudad</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name} {city.province && `(${city.province})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Neighborhood option */}
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_neighborhood"
                    checked={formData.is_neighborhood}
                    onCheckedChange={(checked) => setFormData(prev => ({ 
                      ...prev, 
                      is_neighborhood: checked === true,
                      parent_city_id: checked ? prev.parent_city_id : ""
                    }))}
                  />
                  <Label htmlFor="is_neighborhood" className="cursor-pointer text-sm">
                    Es un barrio (pertenece a una ciudad)
                  </Label>
                </div>

                {formData.is_neighborhood && (
                  <div className="space-y-2">
                    <Label>Ciudad principal</Label>
                    <Select 
                      value={formData.parent_city_id || "none"} 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, parent_city_id: v === "none" ? "" : v }))}
                      disabled={loadingData}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ciudad principal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Ninguna</SelectItem>
                        {cities.map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {city.name} {city.province && `(${city.province})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      La pagina aparecera como barrio relacionado a esta ciudad
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Botones y Textos de Accion</CardTitle>
              <CardDescription>Personaliza el telefono, botones y badges del hero</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Telefono</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Numero (sin espacios)</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value.replace(/\s/g, "") }))}
                      placeholder="900433214"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_display">Formato visible</Label>
                    <Input
                      id="phone_display"
                      value={formData.phone_display}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone_display: e.target.value }))}
                      placeholder="900 433 214"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Botones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_button_text">Texto boton principal</Label>
                    <Input
                      id="cta_button_text"
                      value={formData.cta_button_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_button_text: e.target.value }))}
                      placeholder="Dejar vacio para usar el telefono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_secondary_text">Texto boton secundario</Label>
                    <Input
                      id="cta_secondary_text"
                      value={formData.cta_secondary_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_secondary_text: e.target.value }))}
                      placeholder="Presupuesto Gratis"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Badges (textos debajo de los botones)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_badge_1">Badge 1</Label>
                    <Input
                      id="cta_badge_1"
                      value={formData.cta_badge_1}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_badge_1: e.target.value }))}
                      placeholder="Disponible 24h"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_badge_2">Badge 2</Label>
                    <Input
                      id="cta_badge_2"
                      value={formData.cta_badge_2}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_badge_2: e.target.value }))}
                      placeholder="Sin compromiso"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_badge_3">Badge 3</Label>
                    <Input
                      id="cta_badge_3"
                      value={formData.cta_badge_3}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta_badge_3: e.target.value }))}
                      placeholder="Presupuesto gratis"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Vista previa:</p>
                <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <span className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      {formData.cta_button_text || formData.phone_display || "900 433 214"}
                    </span>
                    <span className="border px-4 py-2 rounded-lg text-sm font-medium bg-white">
                      {formData.cta_secondary_text || "Presupuesto Gratis"}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      {formData.cta_badge_1 || "Disponible 24h"}
                    </span>
                    <span>{formData.cta_badge_2 || "Sin compromiso"}</span>
                    <span>{formData.cta_badge_3 || "Presupuesto gratis"}</span>
                  </div>
                </div>
              </div>

              {/* New AI Generated Fields */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Campos adicionales (generados por IA)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="highlight">Highlight (texto destacado)</Label>
                    <Input
                      id="highlight"
                      value={formData.highlight}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight: e.target.value }))}
                      placeholder="ej: Servicio 24h disponible"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency_message">Mensaje de urgencia</Label>
                    <Input
                      id="urgency_message"
                      value={formData.urgency_message}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency_message: e.target.value }))}
                      placeholder="ej: Solo quedan 3 huecos hoy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="final_cta_title">Titulo CTA final</Label>
                    <Input
                      id="final_cta_title"
                      value={formData.final_cta_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, final_cta_title: e.target.value }))}
                      placeholder="ej: No esperes mas, contactanos ahora"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="final_cta_subtitle">Subtitulo CTA final</Label>
                    <Input
                      id="final_cta_subtitle"
                      value={formData.final_cta_subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, final_cta_subtitle: e.target.value }))}
                      placeholder="ej: Presupuesto sin compromiso"
                    />
                  </div>
                </div>
              </div>

              {/* Local Facts */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Datos locales de la ciudad</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local_population">Poblacion aproximada</Label>
                    <Input
                      id="local_population"
                      value={formData.local_population}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_population: e.target.value }))}
                      placeholder="ej: 45.000 habitantes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local_famous_for">Conocida por</Label>
                    <Input
                      id="local_famous_for"
                      value={formData.local_famous_for}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_famous_for: e.target.value }))}
                      placeholder="ej: Su arquitectura modernista"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local_landmark">Lugar emblematico</Label>
                    <Input
                      id="local_landmark"
                      value={formData.local_landmark}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_landmark: e.target.value }))}
                      placeholder="ej: Plaza Mayor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local_interesting_fact">Dato curioso</Label>
                    <Input
                      id="local_interesting_fact"
                      value={formData.local_interesting_fact}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_interesting_fact: e.target.value }))}
                      placeholder="ej: Fundada en el siglo XII"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="local_problem">Problema local comun</Label>
                    <Input
                      id="local_problem"
                      value={formData.local_problem}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_problem: e.target.value }))}
                      placeholder="ej: Tuberias antiguas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local_nearby_areas">Zonas cercanas (separadas por coma)</Label>
                    <Input
                      id="local_nearby_areas"
                      value={formData.local_nearby_areas}
                      onChange={(e) => setFormData(prev => ({ ...prev, local_nearby_areas: e.target.value }))}
                      placeholder="ej: Centro, La Marina, El Raval"
                    />
                  </div>
                </div>
              </div>

              {/* Extra Section */}
              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Seccion extra</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="extra_section_type">Tipo de seccion</Label>
                    <Select 
                      value={formData.extra_section_type}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, extra_section_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ninguno">Ninguno</SelectItem>
                        <SelectItem value="testimonial_destacado">Testimonial Destacado</SelectItem>
                        <SelectItem value="dato_curioso">Dato Curioso</SelectItem>
                        <SelectItem value="proceso_trabajo">Proceso de Trabajo</SelectItem>
                        <SelectItem value="zona_cobertura">Zona de Cobertura</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content_tone">Tono del contenido</Label>
                    <Select 
                      value={formData.content_tone}
                      onValueChange={(v) => setFormData(prev => ({ ...prev, content_tone: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="profesional">Profesional</SelectItem>
                        <SelectItem value="cercano">Cercano</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                        <SelectItem value="informativo">Informativo</SelectItem>
                        <SelectItem value="amigable">Amigable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.extra_section_type && formData.extra_section_type !== 'ninguno' && (
                  <div className="space-y-2">
                    <Label htmlFor="extra_section_content">Contenido de la seccion extra</Label>
                    <Textarea
                      id="extra_section_content"
                      value={formData.extra_section_content}
                      onChange={(e) => setFormData(prev => ({ ...prev, extra_section_content: e.target.value }))}
                      placeholder="Contenido HTML de la seccion extra"
                      rows={4}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imagen Tab */}
        <TabsContent value="imagen" className="space-y-6">
          {/* Crear imagen con IA */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-600" />
                <CardTitle>Crear imagen con IA</CardTitle>
              </div>
              <CardDescription>
                Genera imagenes unicas para el hero con texto, telefono y branding personalizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/editor-imagen?service=${encodeURIComponent(serviceName)}&city=${encodeURIComponent(cityName)}&pageId=${page.id}`}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Abrir Editor de Imagenes IA
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Crea imagenes personalizadas con texto overlay, logos y CTAs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Imagen principal (Hero)</CardTitle>
              <CardDescription>
                Esta imagen aparece en la cabecera de la página. Tamaño recomendado: 1200x630px
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={formData.hero_image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, hero_image_url: url }))}
                folder="pages"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mapa Tab */}
        <TabsContent value="mapa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuracion del Mapa</CardTitle>
              <CardDescription>Coordenadas y visualizacion del mapa en la pagina</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_map"
                  checked={formData.show_map}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_map: checked === true }))}
                />
                <Label htmlFor="show_map" className="cursor-pointer">
                  Mostrar mapa en la pagina
                </Label>
              </div>

              {formData.show_map && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Si no introduces coordenadas, se usaran las de la ciudad seleccionada (si hay una).
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitud</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                        placeholder="41.3851"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitud</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                        placeholder="2.1734"
                        type="number"
                        step="any"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="map_zoom">Zoom (distancia)</Label>
                      <Input
                        id="map_zoom"
                        value={formData.map_zoom}
                        onChange={(e) => setFormData(prev => ({ ...prev, map_zoom: e.target.value }))}
                        placeholder="12"
                        type="number"
                        min="8"
                        max="18"
                      />
                      <p className="text-xs text-muted-foreground">8 = muy lejos, 18 = muy cerca</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Como obtener las coordenadas:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Abre <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Maps</a></li>
                      <li>Busca la ubicacion deseada</li>
                      <li>Haz clic derecho en el punto exacto</li>
                      <li>Selecciona la primera opcion (las coordenadas)</li>
                      <li>Se copian automaticamente al portapapeles</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas frecuentes</CardTitle>
              <CardDescription>
                Las FAQs ayudan al SEO y aparecen en la página. Google puede mostrarlas en los resultados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Pregunta</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(index, "question", e.target.value)}
                          placeholder="¿Cuánto cuesta...?"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Respuesta</Label>
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, "answer", e.target.value)}
                          placeholder="Escribe la respuesta..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addFaq} className="w-full">
                + Añadir pregunta
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opiniones de clientes</CardTitle>
              <CardDescription>
                Añade testimonios de clientes satisfechos. Aparecen en la sección de valoraciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.map((review, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nombre</Label>
                          <Input
                            value={review.name}
                            onChange={(e) => updateReview(index, "name", e.target.value)}
                            placeholder="María G."
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Ubicación</Label>
                          <Input
                            value={review.location || ""}
                            onChange={(e) => updateReview(index, "location", e.target.value)}
                            placeholder={cityName}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Valoración</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => updateReview(index, "rating", star)}
                              className={`text-2xl ${star <= review.rating ? "text-yellow-500" : "text-gray-300"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Comentario</Label>
                        <Textarea
                          value={review.text}
                          onChange={(e) => updateReview(index, "text", e.target.value)}
                          placeholder="Excelente servicio, muy profesionales..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReview(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addReview} className="w-full">
                + Añadir opinión
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publicación Tab */}
        <TabsContent value="publicacion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de publicación</CardTitle>
              <CardDescription>
                Controla cuándo y cómo aparece esta página en el sitemap y buscadores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">Estado de la página</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.status === "published" 
                      ? "La página está publicada y visible" 
                      : "La página no es visible públicamente"}
                  </p>
                </div>
                <Badge 
                  className={
                    formData.status === "published" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {formData.status === "published" ? "Publicada" : "Borrador"}
                </Badge>
              </div>

              <div className="space-y-3">
                <Label>Fecha de publicación (para el sitemap)</Label>
                <Input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, published_at: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Esta fecha aparece en el sitemap como la última modificación.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Prioridad en sitemap</Label>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {formData.sitemap_priority.toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[formData.sitemap_priority * 10]}
                  onValueChange={([value]) => setFormData(prev => ({ ...prev, sitemap_priority: value / 10 }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Mayor prioridad = más importante para Google (0.1 - 1.0)
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Vista previa en Google</h4>
                <div className="space-y-1">
                  <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {formData.title || `${serviceName} en ${cityName}`}
                  </p>
                  <p className="text-green-700 text-sm">
                    www.electricistass.com › {page.slug}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formData.meta_description || `Servicio de ${serviceName.toLowerCase()} en ${cityName}...`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
