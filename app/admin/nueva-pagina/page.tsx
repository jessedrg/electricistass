"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye, Loader2, Image as ImageIcon, MessageSquare, Star, Settings, FileText, Plus, MapPin, Phone, Sparkles, Layers } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { ImageUploader } from "@/components/admin/image-uploader"
import { FAQsEditor } from "@/components/admin/faqs-editor"
import { ReviewsEditor } from "@/components/admin/reviews-editor"
import { adminFetch } from "@/lib/admin/fetch"

interface FAQ {
  question: string
  answer: string
}

interface Review {
  name: string
  rating: number
  text: string
  date: string
  location?: string
  avatar_url?: string
  verified?: boolean
}

interface Service {
  id: string
  name: string
  slug: string
  icon?: string
}

interface City {
  id: string
  name: string
  slug: string
  province?: string
  latitude?: number
  longitude?: number
}

export default function NuevaPaginaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("contenido")
  
  // Services and cities from DB
  const [services, setServices] = useState<Service[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Form data
  const [formData, setFormData] = useState({
    slug: "",
    service_id: "",
    city_id: "",
    parent_city_id: "", // For neighborhoods
    is_neighborhood: false,
    title: "",
    meta_description: "",
    h1: "",
    intro_text: "",
    hero_image_url: "",
    status: "pending" as "pending" | "published" | "error",
    sitemap_priority: 0.8,
    sitemap_changefreq: "weekly",
    published_at: "",
    // Map coordinates
    latitude: "",
    longitude: "",
    map_zoom: "12",
    show_map: true,
    // CTA config
    phone_number: "900433214",
    phone_display: "900 433 214",
    cta_button_text: "",
    cta_secondary_text: "Presupuesto Gratis",
    cta_badge_1: "Disponible 24h",
    cta_badge_2: "Sin compromiso",
    cta_badge_3: "Presupuesto gratis",
  })
  
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  
  // Create new service/city dialogs
  const [showNewService, setShowNewService] = useState(false)
  const [showNewCity, setShowNewCity] = useState(false)
  const [newServiceName, setNewServiceName] = useState("")
  const [newCityName, setNewCityName] = useState("")
  const [newCityProvince, setNewCityProvince] = useState("")
  const [creatingService, setCreatingService] = useState(false)
  const [creatingCity, setCreatingCity] = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)
  
  // Quick generate mode
  const [quickServiceName, setQuickServiceName] = useState("")
  const [quickCityName, setQuickCityName] = useState("")
  const [generationStatus, setGenerationStatus] = useState("")
  
  // Existing pages for duplicate check
  const [existingPages, setExistingPages] = useState<{ service_id: string; city_id: string; slug: string }[]>([])
  const [combinationWarning, setCombinationWarning] = useState("")
  
  // Load services, cities and existing pages
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, citiesRes, pagesRes] = await Promise.all([
          adminFetch("/api/admin/services"),
          adminFetch("/api/admin/cities"),
          adminFetch("/api/admin/pages?fields=id,service_id,city_id,slug"),
        ])
        
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          setServices(Array.isArray(data) ? data : [])
        }
        
        if (citiesRes.ok) {
          const data = await citiesRes.json()
          setCities(Array.isArray(data) ? data : [])
        }
        
        if (pagesRes.ok) {
          const data = await pagesRes.json()
          setExistingPages(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoadingData(false)
      }
    }
    
    fetchData()
  }, [])
  
  // Check if combination exists when service or city changes
  useEffect(() => {
    if (formData.service_id && formData.city_id) {
      const exists = existingPages.find(
        p => p.service_id === formData.service_id && p.city_id === formData.city_id
      )
      if (exists) {
        setCombinationWarning(`Esta combinacion ya existe con slug: ${exists.slug}`)
      } else {
        setCombinationWarning("")
      }
    } else {
      setCombinationWarning("")
    }
  }, [formData.service_id, formData.city_id, existingPages])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clean slug: lowercase, no special chars except /
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9/-]/g, "")
    setFormData(prev => ({ ...prev, slug: value }))
  }

  const createService = async () => {
    if (!newServiceName.trim()) return
    
    setCreatingService(true)
    try {
      const slug = newServiceName.toLowerCase().replace(/[^a-z0-9]/g, "-")
      const res = await adminFetch("/api/admin/services", {
        method: "POST",
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
      const res = await adminFetch("/api/admin/cities", {
        method: "POST",
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

  const handleQuickGenerate = async () => {
    if (!quickServiceName.trim() || !quickCityName.trim()) {
      alert("Escribe el nombre del servicio y la ciudad")
      return
    }

    setGeneratingAI(true)
    setGenerationStatus("Buscando servicio...")
    
    try {
      // 1. Find or create service
      let service = services.find(s => 
        s.name.toLowerCase() === quickServiceName.trim().toLowerCase()
      )
      
      if (!service) {
        setGenerationStatus("Creando servicio...")
        const serviceSlug = quickServiceName.trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
        
        const serviceRes = await adminFetch("/api/admin/services", {
          method: "POST",
          body: JSON.stringify({
            name: quickServiceName.trim(),
            slug: serviceSlug,
          }),
        })
        
        if (serviceRes.ok) {
          const newService = await serviceRes.json()
          service = newService
          setServices(prev => [...prev, newService])
        } else {
          const errData = await serviceRes.json()
          throw new Error(errData.error || "Error al crear servicio")
        }
      }
      
      // 2. Find or create city
      setGenerationStatus("Buscando ciudad...")
      let city = cities.find(c => 
        c.name.toLowerCase() === quickCityName.trim().toLowerCase()
      )
      
      if (!city) {
        setGenerationStatus("Generando datos de ciudad con IA...")
        const cityRes = await adminFetch("/api/admin/generate-city", {
          method: "POST",
          body: JSON.stringify({
            cityName: quickCityName.trim(),
          }),
        })
        
        if (cityRes.ok) {
          const cityData = await cityRes.json()
          city = cityData.city
          if (city) {
            setCities(prev => [...prev, city!])
          } else {
            throw new Error("No se recibieron datos de la ciudad")
          }
        } else {
          const errData = await cityRes.json()
          throw new Error(errData.error || "Error al crear ciudad")
        }
      }
      
      // 3. Verify we have both service and city
      if (!service || !city) {
        throw new Error("No se pudo obtener el servicio o la ciudad")
      }
      
      // 4. Update form with service and city IDs
      setFormData(prev => ({
        ...prev,
        service_id: service.id,
        city_id: city.id,
      }))
      
      // 5. Generate page content
      setGenerationStatus("Generando contenido unico con Claude Opus...")
      const res = await adminFetch("/api/admin/generate-page", {
        method: "POST",
        body: JSON.stringify({
          serviceName: service.name,
          cityName: city.name,
          cityProvince: city.province,
        }),
      })

      if (res.ok) {
        const { content } = await res.json()
        
        // Generate unique slug - include parent city if it's a neighborhood
        let baseSlug = `${service.slug}-${city.slug}`
        if (content.is_neighborhood && content.parent_city_slug) {
          baseSlug = `${service.slug}-${content.parent_city_slug}-${city.slug}`
        }
        
        // Helper to pick random from array
        const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
        const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
        
        // Pick random badges (3 from 8)
        const badges = content.badges ? shuffle(content.badges).slice(0, 3) : []
        
        // Pick random CTA buttons
        const primaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'primary') || []
        const secondaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'secondary') || []
        const selectedPrimary = primaryCtas.length > 0 ? pickRandom(primaryCtas) : { text: 'Llamar', emoji: '📞' }
        const selectedSecondary = secondaryCtas.length > 0 ? pickRandom(secondaryCtas) : { text: 'WhatsApp', emoji: '💬' }
        
        // Pick random titles and H1s (now with 5 H1 variants)
        const titles = [content.title, content.title_variant, content.title_variant_2].filter(Boolean)
        const h1s = [content.h1, content.h1_variant, content.h1_variant_2, content.h1_variant_3, content.h1_variant_4].filter(Boolean)
        const highlights = [content.highlight, content.highlight_variant, content.highlight_variant_2, content.highlight_variant_3].filter(Boolean)
        const metas = [content.meta_description, content.meta_description_variant].filter(Boolean)
        
        // Pick random intro (now with variant)
        const intros = [content.intro_text, content.intro_text_variant].filter(Boolean)
        
        // Pick random final CTA
        const finalCta = content.final_ctas?.length > 0 ? pickRandom(content.final_ctas) : null
        
        // Pick random urgency message
        const urgency = content.urgency_messages?.length > 0 ? pickRandom(content.urgency_messages) : ''
        
        // Update form with AI generated content (randomly selecting variants)
        setFormData(prev => ({
          ...prev,
          slug: baseSlug,
          service_id: service.id,
          city_id: city.id,
          // SEO - randomly pick from variants
          title: titles.length > 0 ? pickRandom(titles) : prev.title,
          meta_description: metas.length > 0 ? pickRandom(metas) : prev.meta_description,
          // H1 - randomly pick from 5 variants
          h1: h1s.length > 0 ? pickRandom(h1s) : prev.h1,
          // Intro - randomly pick from 2 variants with DIFFERENT structures
          intro_text: intros.length > 0 ? pickRandom(intros) : prev.intro_text,
          // CTAs - random selection
          cta_button_text: `${selectedPrimary.emoji} ${selectedPrimary.text}`,
          cta_secondary_text: `${selectedSecondary.emoji} ${selectedSecondary.text}`,
          // Badges - shuffled selection
          cta_badge_1: badges[0] ? `${badges[0].emoji} ${badges[0].text}` : prev.cta_badge_1,
          cta_badge_2: badges[1] ? `${badges[1].emoji} ${badges[1].text}` : prev.cta_badge_2,
          cta_badge_3: badges[2] ? `${badges[2].emoji} ${badges[2].text}` : prev.cta_badge_3,
          // Map coordinates from city
          latitude: city.latitude?.toString() || "",
          longitude: city.longitude?.toString() || "",
          show_map: true,
          // Neighborhood linking
          ...(content.is_neighborhood && content.parent_city_slug ? {
            parent_city_link: `/${service.slug}/${content.parent_city_slug}`,
          } : {}),
        }))
        
        // Set FAQs with rich HTML answers
        if (content.faqs && Array.isArray(content.faqs)) {
          setFaqs(content.faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer,
          })))
        }
        
        // Set Reviews with all new fields
        if (content.reviews && Array.isArray(content.reviews)) {
          setReviews(content.reviews.map((r: { name: string; rating: number; text: string; location?: string; date: string; service_type?: string; verified_badge?: string }) => ({
            name: r.name,
            rating: r.rating,
            text: r.text,
            location: r.location || city.name,
            date: r.date,
            verified: true,
            service_type: r.service_type,
          })))
        }

        // Log all generated content for reference
        console.log("[v0] AI Content Generated for", city.name + ":")
        console.log("- Local facts:", content.local_facts)
        console.log("- Titles:", titles)
        console.log("- H1s:", h1s)
        console.log("- Highlights:", highlights)
        console.log("- CTA buttons:", content.cta_buttons?.length, "variants")
        console.log("- Urgency messages:", content.urgency_messages)
        console.log("- Badges:", content.badges?.length, "variants")
        console.log("- Final CTAs:", content.final_ctas)
        console.log("- Services with prices:", content.services_list)
        console.log("- Benefits with local touch:", content.benefits)
        console.log("- Keywords:", content.keywords)

        setGenerationStatus("Contenido unico generado!")
        setActiveTab("contenido")
      } else {
        const error = await res.json()
        throw new Error(error.error || "Error al generar contenido")
      }
    } catch (err) {
      console.error("Error in quick generate:", err)
      setGenerationStatus("Error: " + (err instanceof Error ? err.message : "Error desconocido"))
    } finally {
      setGeneratingAI(false)
      setTimeout(() => setGenerationStatus(""), 3000)
    }
  }
  
  const handleGenerateWithAI = async () => {
    const selectedService = services.find(s => s.id === formData.service_id)
    const selectedCity = cities.find(c => c.id === formData.city_id)

    if (!selectedService || !selectedCity) {
      alert("Selecciona primero un servicio y una ciudad")
      return
    }

    setGeneratingAI(true)
    setGenerationStatus("Generando contenido unico con Claude Opus...")
    try {
      const res = await adminFetch("/api/admin/generate-page", {
        method: "POST",
        body: JSON.stringify({
          serviceName: selectedService.name,
          cityName: selectedCity.name,
          cityProvince: selectedCity.province,
        }),
      })

      if (res.ok) {
        const { content } = await res.json()
        
        // Generate unique slug - include parent city if neighborhood
        let baseSlug = `${selectedService.slug}-${selectedCity.slug}`
        if (content.is_neighborhood && content.parent_city_slug) {
          baseSlug = `${selectedService.slug}-${content.parent_city_slug}-${selectedCity.slug}`
        }
        
        // Helper to pick random from array
        const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
        const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
        
        // Pick random badges (3 from 8)
        const badges = content.badges ? shuffle(content.badges).slice(0, 3) : []
        
        // Pick random CTA buttons
        const primaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'primary') || []
        const secondaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'secondary') || []
        const selectedPrimary = primaryCtas.length > 0 ? pickRandom(primaryCtas) : { text: 'Llamar', emoji: '📞' }
        const selectedSecondary = secondaryCtas.length > 0 ? pickRandom(secondaryCtas) : { text: 'WhatsApp', emoji: '💬' }
        
        // Pick random titles and H1s
        const titles = [content.title, content.title_variant, content.title_variant_2].filter(Boolean)
        const h1s = [content.h1, content.h1_variant, content.h1_variant_2, content.h1_variant_3].filter(Boolean)
        const metas = [content.meta_description, content.meta_description_variant].filter(Boolean)
        
        // Update form with randomly selected variants
        setFormData(prev => ({
          ...prev,
          slug: baseSlug,
          title: titles.length > 0 ? pickRandom(titles) : prev.title,
          meta_description: metas.length > 0 ? pickRandom(metas) : prev.meta_description,
          h1: h1s.length > 0 ? pickRandom(h1s) : prev.h1,
          intro_text: content.intro_text || prev.intro_text,
          cta_button_text: `${selectedPrimary.emoji} ${selectedPrimary.text}`,
          cta_secondary_text: `${selectedSecondary.emoji} ${selectedSecondary.text}`,
          cta_badge_1: badges[0] ? `${badges[0].emoji} ${badges[0].text}` : prev.cta_badge_1,
          cta_badge_2: badges[1] ? `${badges[1].emoji} ${badges[1].text}` : prev.cta_badge_2,
          cta_badge_3: badges[2] ? `${badges[2].emoji} ${badges[2].text}` : prev.cta_badge_3,
          latitude: selectedCity.latitude?.toString() || "",
          longitude: selectedCity.longitude?.toString() || "",
          show_map: true,
        }))
        
        // Set FAQs
        if (content.faqs && Array.isArray(content.faqs)) {
          setFaqs(content.faqs.map((faq: { question: string; answer: string }) => ({
            question: faq.question,
            answer: faq.answer,
          })))
        }
        
        // Set Reviews
        if (content.reviews && Array.isArray(content.reviews)) {
          setReviews(content.reviews.map((r: { name: string; rating: number; text: string; location?: string; date: string; service_type?: string }) => ({
            name: r.name,
            rating: r.rating,
            text: r.text,
            location: r.location || selectedCity.name,
            date: r.date,
            verified: true,
            service_type: r.service_type,
          })))
        }

        setGenerationStatus("Contenido unico regenerado!")
        setActiveTab("contenido")
      } else {
        const error = await res.json()
        alert(error.error || "Error al generar contenido")
      }
    } catch (err) {
      console.error("Error generating content:", err)
      alert("Error al generar contenido con IA")
    } finally {
      setGeneratingAI(false)
      setTimeout(() => setGenerationStatus(""), 3000)
    }
  }

  const handleSave = async (publish = false) => {
    if (!formData.slug.trim()) {
      alert("El slug es obligatorio")
      return
    }

    setSaving(true)
    try {
      const status = publish ? "published" : formData.status
      const published_at = publish && !formData.published_at 
        ? new Date().toISOString() 
        : formData.published_at

      const res = await adminFetch("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({
          slug: formData.slug,
          service_id: formData.service_id || null,
          city_id: formData.city_id || null,
          parent_city_id: formData.parent_city_id || null,
          is_neighborhood: formData.is_neighborhood,
          title: formData.title,
          meta_description: formData.meta_description,
          h1: formData.h1,
          intro_text: formData.intro_text,
          hero_image_url: formData.hero_image_url,
          status,
          published_at,
          sitemap_priority: formData.sitemap_priority,
          sitemap_changefreq: formData.sitemap_changefreq,
          faqs,
          custom_reviews: reviews,
          // Map and CTA config
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
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/paginas/${data.page.id}`)
      } else {
        const error = await res.json()
        alert(error.error || "Error al crear la página")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al crear la página")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear Nueva Página</h1>
            <p className="text-muted-foreground">
              Configura el slug, contenido, imágenes y más
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {combinationWarning && (
            <span className="text-sm text-emerald-700 self-center mr-2">
              Combinacion existente
            </span>
          )}
          <Button variant="outline" asChild>
            <Link href="/admin/generar-lote">
              <Layers className="h-4 w-4 mr-2" />
              Generar en Lote
            </Link>
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving || !!combinationWarning}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar como Pendiente
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving || !!combinationWarning} className="bg-green-600 hover:bg-green-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Publicar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="contenido" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contenido</span>
              </TabsTrigger>
              <TabsTrigger value="imagen" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Imagen</span>
              </TabsTrigger>
              <TabsTrigger value="ctas" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">CTAs</span>
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
              <TabsTrigger value="seo" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenido Tab */}
            <TabsContent value="contenido" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenido Principal</CardTitle>
                  <CardDescription>Título y texto de la página</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="h1">Título Principal (H1)</Label>
                    <Input
                      id="h1"
                      name="h1"
                      value={formData.h1}
                      onChange={handleChange}
                      placeholder="Fontaneros en Madrid - Servicio 24 Horas"
                      className="text-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Texto de Introducción</Label>
                    <p className="text-xs text-muted-foreground">
                      Usa negrita, enlaces y listas para mejorar el contenido
                    </p>
                    <RichTextEditor
                      content={formData.intro_text}
                      onChange={(content) => setFormData(prev => ({ ...prev, intro_text: content }))}
                      placeholder="Escribe el contenido principal de la página..."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Imagen Tab */}
            <TabsContent value="imagen" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Imagen Principal</CardTitle>
                  <CardDescription>Imagen hero que aparece en la cabecera</CardDescription>
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

            {/* CTAs Tab */}
            <TabsContent value="ctas" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Botones y Textos de Accion</CardTitle>
                  <CardDescription>Personaliza el telefono, botones y badges del hero</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Phone config */}
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

                  {/* Buttons */}
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
                        <p className="text-xs text-muted-foreground">Si lo dejas vacio, mostrara el numero de telefono</p>
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

                  {/* Badges */}
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

                  {/* Preview */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-3">Vista previa:</p>
                    <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
                      <div className="flex gap-2">
                        <span className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                          {formData.cta_button_text || formData.phone_display || "900 433 214"}
                        </span>
                        <span className="border px-4 py-2 rounded-lg text-sm font-medium">
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
                </CardContent>
              </Card>
            </TabsContent>

            {/* Mapa Tab */}
            <TabsContent value="mapa" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración del Mapa</CardTitle>
                  <CardDescription>Coordenadas y visualización del mapa en la página</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_map"
                      checked={formData.show_map}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_map: checked === true }))}
                    />
                    <Label htmlFor="show_map" className="cursor-pointer">
                      Mostrar mapa en la página
                    </Label>
                  </div>

                  {formData.show_map && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Si no introduces coordenadas, se usarán las de la ciudad seleccionada (si hay una).
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
                        <p className="text-sm font-medium mb-2">Cómo obtener las coordenadas:</p>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Abre <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Maps</a></li>
                          <li>Busca la ubicación deseada</li>
                          <li>Haz clic derecho en el punto exacto</li>
                          <li>Selecciona la primera opción (las coordenadas)</li>
                          <li>Se copian automáticamente al portapapeles</li>
                        </ol>
                      </div>
                    </div>
                  )}
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

            {/* SEO Tab */}
            <TabsContent value="seo" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Meta Tags SEO</CardTitle>
                  <CardDescription>Título y descripción para Google</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meta Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Fontaneros Madrid 24h - Urgencias | Electricistas 24H"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.title.length}/60 caracteres recomendados
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Input
                      id="meta_description"
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      placeholder="Fontaneros profesionales en Madrid. Llama al 900 433 214..."
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.meta_description.length}/160 caracteres recomendados
                    </p>
                  </div>

                  {/* Google Preview */}
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-xs text-muted-foreground mb-2">Vista previa en Google:</p>
                    <div className="space-y-1">
                      <p className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                        {formData.title || "Título de la página"}
                      </p>
                      <p className="text-green-700 text-sm">
                        www.electricistass.com/{formData.slug || "slug-de-pagina"}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.meta_description || "Descripción de la página que aparecerá en los resultados de búsqueda..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configuración Sitemap</CardTitle>
                  <CardDescription>Prioridad y frecuencia de actualización</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sitemap_priority">Prioridad</Label>
                      <Select 
                        value={formData.sitemap_priority.toString()} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, sitemap_priority: parseFloat(v) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.0">1.0 - Máxima</SelectItem>
                          <SelectItem value="0.9">0.9 - Muy alta</SelectItem>
                          <SelectItem value="0.8">0.8 - Alta (recomendado)</SelectItem>
                          <SelectItem value="0.7">0.7 - Media-alta</SelectItem>
                          <SelectItem value="0.6">0.6 - Media</SelectItem>
                          <SelectItem value="0.5">0.5 - Media-baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sitemap_changefreq">Frecuencia</Label>
                      <Select 
                        value={formData.sitemap_changefreq} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, sitemap_changefreq: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diaria</SelectItem>
                          <SelectItem value="weekly">Semanal (recomendado)</SelectItem>
                          <SelectItem value="monthly">Mensual</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Service & City Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Servicio y Ciudad</CardTitle>
              <CardDescription>Aparecerán en el hero de la página</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="service">Servicio</Label>
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
                        <DialogDescription>
                          Añade un nuevo servicio a la lista
                        </DialogDescription>
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
                        <Button variant="outline" onClick={() => setShowNewService(false)}>
                          Cancelar
                        </Button>
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
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="city">Ciudad</Label>
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
                        <DialogDescription>
                          Añade una nueva ciudad a la lista
                        </DialogDescription>
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
                            placeholder="Ej: Madrid, Cataluña..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewCity(false)}>
                          Cancelar
                        </Button>
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

              {/* Combination Warning */}
              {combinationWarning && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-orange-200">
                  <p className="text-sm text-orange-700 font-medium">
                    Esta combinacion ya existe
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {combinationWarning}
                  </p>
                </div>
              )}

              {/* Quick AI Generation */}
              <div className="pt-4 border-t space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Generacion Rapida con IA
                  </h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    Escribe el servicio y ciudad. Si no existen, se crearan automaticamente.
                  </p>
                  <div className="space-y-2">
                    <Input
                      value={quickServiceName}
                      onChange={(e) => setQuickServiceName(e.target.value)}
                      placeholder="Servicio (ej: Fontanero)"
                      className="bg-white"
                    />
                    <Input
                      value={quickCityName}
                      onChange={(e) => setQuickCityName(e.target.value)}
                      placeholder="Ciudad (ej: Terrassa)"
                      className="bg-white"
                    />
                    <Button
                      onClick={handleQuickGenerate}
                      disabled={generatingAI || !quickServiceName.trim() || !quickCityName.trim()}
                      className="w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {generationStatus || "Generando..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generar Pagina Completa
                        </>
                      )}
                    </Button>
                  </div>
                  {generationStatus && !generatingAI && (
                    <p className="text-xs text-center mt-2 text-green-600 font-medium">
                      {generationStatus}
                    </p>
                  )}
                </div>
                
                <div className="text-center text-xs text-muted-foreground">
                  — o selecciona manualmente —
                </div>
                
                {/* Manual AI Generation (when service/city already selected) */}
                {formData.service_id && formData.city_id && (
                  <Button
                    onClick={handleGenerateWithAI}
                    disabled={generatingAI}
                    variant="outline"
                    className="w-full gap-2"
                  >
                    {generatingAI ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Regenerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Regenerar contenido
                      </>
                    )}
                  </Button>
                )}
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
                    <Label htmlFor="parent_city">Ciudad principal</Label>
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
                      La página aparecerá como barrio relacionado a esta ciudad
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Slug & URL */}
          <Card>
            <CardHeader>
              <CardTitle>URL de la Página</CardTitle>
              <CardDescription>El slug define la URL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    placeholder="fontanero/madrid"
                    className="font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Puedes usar cualquier slug, independiente del servicio/ciudad
                </p>
              </div>

              {formData.slug && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">URL final:</p>
                  <p className="text-sm font-mono break-all">
                    www.electricistass.com/{formData.slug}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status & Date */}
          <Card>
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
              <CardDescription>Estado y fecha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: "pending" | "published" | "error") => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published_at">Fecha de publicación</Label>
                <Input
                  id="published_at"
                  name="published_at"
                  type="datetime-local"
                  value={formData.published_at ? formData.published_at.slice(0, 16) : ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    published_at: e.target.value ? new Date(e.target.value).toISOString() : "" 
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Dejar vacío para usar la fecha actual al publicar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FAQs:</span>
                  <span className="font-medium">{faqs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews:</span>
                  <span className="font-medium">{reviews.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imagen:</span>
                  <span className="font-medium">{formData.hero_image_url ? "Sí" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contenido:</span>
                  <span className="font-medium">{formData.intro_text ? "Sí" : "No"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
