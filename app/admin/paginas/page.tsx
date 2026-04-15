"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  Globe,
  Calendar,
  Edit,
  Star,
  Loader2,
  ExternalLink,
  FileText,
  Trash2,
  ImageOff,
  ImageIcon,
  Users,
  Sparkles,
  Rocket,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Page {
  id: string
  slug: string
  status: "published" | "draft" | "pending"
  title: string | null
  sitemap_priority: number
  published_at: string | null
  updated_at: string
  hero_image_url: string | null
  services: { name: string; slug: string } | null
  cities: { name: string; slug: string; population: number | null } | null
}

// Configuracion para generacion de imagenes
const BASE_IMAGES = [
  { id: "david", url: "/images/bases/david-cerrajero.jpeg" },
  { id: "marcos", url: "/images/bases/marcos-manitas.jpeg" },
  { id: "javier", url: "/images/bases/javier-fontanero.jpeg" }
]

// Taglines especificos por servicio
const SERVICE_TAGLINES: Record<string, string[]> = {
  cerrajero: [
    "Abrimos tu puerta ya", "Sin romper tu cerradura", "Apertura express 24h",
    "Cerraduras de seguridad", "Urgencias al instante", "Llaves en el acto"
  ],
  electricista: [
    "Instalaciones seguras", "Averias electricas 24h", "Boletines electricos",
    "Cuadros electricos", "Urgencias electricas", "Revision de instalaciones"
  ],
  fontanero: [
    "Desatascos urgentes", "Fugas de agua 24h", "Reparacion de tuberias",
    "Calentadores y calderas", "Sin obras ni roturas", "Deteccion de fugas"
  ],
  default: [
    "Servicio rapido y barato", "Llegamos en 20 minutos", "24 horas, 365 dias",
    "Precios sin sorpresas", "Profesionales de confianza", "Presupuesto gratis"
  ]
}

// Funcion para obtener tagline segun servicio
const getServiceTagline = (serviceName: string): string => {
  const serviceKey = serviceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  const taglines = SERVICE_TAGLINES[serviceKey] || SERVICE_TAGLINES.default
  return taglines[Math.floor(Math.random() * taglines.length)]
}

const COLORES_TEMA = [
  { primary: "#f97316" }, // Naranja
  { primary: "#3b82f6" }, // Azul
  { primary: "#22c55e" }, // Verde
  { primary: "#ef4444" }, // Rojo
  { primary: "#8b5cf6" }, // Morado
]

interface BulkProgress {
  current: number
  total: number
  currentPage: string
  status: "idle" | "generating" | "uploading" | "publishing" | "done" | "error"
  results: { pageId: string; pageName: string; success: boolean; error?: string }[]
}

// Plantillas de titulos SEO simples (max 60 caracteres)
const TITLE_TEMPLATES = [
  "{servicio} en {ciudad}",
  "{servicio} en {ciudad} Urgente",
  "{servicio} en {ciudad} 24h",
  "{servicio} en {ciudad} Barato",
  "{servicio} {ciudad}",
  "{servicio} Urgente en {ciudad}",
  "{servicio} Barato en {ciudad}",
  "{servicio} 24 Horas en {ciudad}",
  "{servicio} Economico en {ciudad}",
  "{servicio} Rapido en {ciudad}",
]

// Emojis relacionados con servicios (se añaden aleatoriamente ~30%)
const SERVICE_EMOJIS: Record<string, string[]> = {
  cerrajero: ["🔐", "🔑", "🚪", "🔒"],
  electricista: ["⚡", "💡", "🔌"],
  fontanero: ["🔧", "🚿", "💧"],
  default: ["✅", "📞", "🏠"]
}

// Funcion para generar titulo SEO aleatorio
const generateSEOTitle = (service: string, city: string): string => {
  const template = TITLE_TEMPLATES[Math.floor(Math.random() * TITLE_TEMPLATES.length)]
  let title = template
    .replace("{servicio}", service)
    .replace("{ciudad}", city)
  
  // Añadir emoji al principio (30% probabilidad)
  if (Math.random() < 0.3) {
    const serviceKey = service.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const emojis = SERVICE_EMOJIS[serviceKey] || SERVICE_EMOJIS.default
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]
    title = `${emoji} ${title}`
  }
  
  // Asegurar max 60 caracteres
  if (title.length > 60) {
    title = title.substring(0, 57) + "..."
  }
  
  return title
}

export default function PaginasPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Bulk publish state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<BulkProgress>({
    current: 0, total: 0, currentPage: "", status: "idle", results: []
  })
  const [refreshingSitemap, setRefreshingSitemap] = useState(false)
  
  // Bulk titles state
  const [bulkTitlesDialogOpen, setBulkTitlesDialogOpen] = useState(false)
  const [bulkTitlesProgress, setBulkTitlesProgress] = useState<BulkProgress>({
    current: 0, total: 0, currentPage: "", status: "idle", results: []
  })
  
  // Regenerate images state
  const [regenImagesDialogOpen, setRegenImagesDialogOpen] = useState(false)
  const [regenImagesProgress, setRegenImagesProgress] = useState<BulkProgress>({
    current: 0, total: 0, currentPage: "", status: "idle", results: []
  })
  
  // Generate maps state
  const [generateMapsLoading, setGenerateMapsLoading] = useState(false)
  const [pagesWithoutMaps, setPagesWithoutMaps] = useState(0)
  
  // Fix images state
  const [fixImagesLoading, setFixImagesLoading] = useState(false)
  const [pagesWithoutImages, setPagesWithoutImages] = useState(0)

  useEffect(() => {
    fetchPages()
    fetchPagesWithoutMaps()
    fetchPagesWithoutImages()
  }, [])

  const fetchPagesWithoutMaps = async () => {
    try {
      const res = await fetch("/api/admin/generate-maps")
      if (res.ok) {
        const data = await res.json()
        setPagesWithoutMaps(data.pagesWithoutMaps || 0)
      }
    } catch (error) {
      console.error("Error fetching maps count:", error)
    }
  }

  const fetchPagesWithoutImages = async () => {
    try {
      const res = await fetch("/api/admin/fix-images")
      if (res.ok) {
        const data = await res.json()
        setPagesWithoutImages(data.pagesWithoutImages || 0)
      }
    } catch (error) {
      console.error("Error fetching images count:", error)
    }
  }

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/pages/list")
      if (res.ok) {
        const data = await res.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error("Error fetching pages:", error)
    } finally {
      setLoading(false)
    }
  }

  // Funcion para generar imagen con canvas
  const generateImageForPage = async (service: string, city: string): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const width = 1200
    const height = 1200
    canvas.width = width
    canvas.height = height
    const scale = width / 600
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    
    // Cargar imagen base aleatoria
    const baseImage = BASE_IMAGES[Math.floor(Math.random() * BASE_IMAGES.length)]
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = baseImage.url
    })
    
    // Dibujar imagen cubriendo todo el canvas
    const imgRatio = img.width / img.height
    const canvasRatio = width / height
    let drawWidth, drawHeight, drawX, drawY
    if (imgRatio > canvasRatio) {
      drawHeight = height
      drawWidth = height * imgRatio
      drawX = (width - drawWidth) / 2
      drawY = 0
    } else {
      drawWidth = width
      drawHeight = width / imgRatio
      drawX = 0
      drawY = (height - drawHeight) / 2
    }
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
    
    // Seleccionar color aleatorio y tagline especifico del servicio
    const color = COLORES_TEMA[Math.floor(Math.random() * COLORES_TEMA.length)]
    const tagline = getServiceTagline(service)
    
    // Variaciones aleatorias de posicion
    const titleX = 5 + Math.random() * 5
    const titleY = 5 + Math.random() * 8
    const titleSize = 52 + Math.floor(Math.random() * 16)
    
    // Dibujar titulo (servicio)
    ctx.font = `800 ${titleSize * scale}px Arial, sans-serif`
    ctx.fillStyle = color.primary
    ctx.shadowColor = 'rgba(255,255,255,0.8)'
    ctx.shadowBlur = 4 * scale
    ctx.shadowOffsetX = 2 * scale
    ctx.shadowOffsetY = 2 * scale
    ctx.fillText(service, width * (titleX / 100), height * (titleY / 100) + titleSize * scale)
    
    // Dibujar subtitulo (ciudad)
    const subtitleSize = 40 + Math.floor(Math.random() * 12)
    ctx.font = `800 ${subtitleSize * scale}px Arial, sans-serif`
    ctx.fillText(`en ${city}`, width * (titleX / 100), height * ((titleY + 10) / 100) + subtitleSize * scale)
    
    // Dibujar tagline
    ctx.font = `600 ${24 * scale}px Arial, sans-serif`
    ctx.fillStyle = '#000000'
    ctx.fillText(tagline, width * (titleX / 100), height * ((titleY + 18) / 100) + 24 * scale)
    
    // Reset shadow
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Dibujar rayas decorativas (aleatorio si aparecen)
    if (Math.random() > 0.3) {
      ctx.fillStyle = color.primary
      const stripeX = width * 0.75
      const stripeY = height * 0.25
      ctx.fillRect(stripeX, stripeY, width * 0.25, 12 * scale)
      ctx.fillRect(stripeX + width * 0.0625, stripeY + 20 * scale, width * 0.1875, 12 * scale)
      ctx.fillRect(stripeX + width * 0.125, stripeY + 40 * scale, width * 0.125, 12 * scale)
    }
    
    // Dibujar badges (aleatorio cuales aparecen)
    const badgeY = height * 0.82
    let badgeX = width * 0.1
    const badgeFontSize = 14 * scale
    ctx.font = `bold ${badgeFontSize}px Arial, sans-serif`
    
    // Badge telefono (siempre)
    const phoneText = "900 433 214"
    const phoneWidth = ctx.measureText(phoneText).width + 32 * scale
    ctx.fillStyle = color.primary
    ctx.beginPath()
    ctx.roundRect(badgeX, badgeY, phoneWidth, 24 * scale, 12 * scale)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(phoneText, badgeX + 16 * scale, badgeY + 17 * scale)
    badgeX += phoneWidth + 16 * scale
    
    // Badge WhatsApp (aleatorio)
    if (Math.random() > 0.3) {
      const waText = "WhatsApp"
      const waWidth = ctx.measureText(waText).width + 32 * scale
      ctx.fillStyle = '#22c55e'
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, waWidth, 24 * scale, 12 * scale)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(waText, badgeX + 16 * scale, badgeY + 17 * scale)
      badgeX += waWidth + 16 * scale
    }
    
    // Badge web (aleatorio)
    if (Math.random() > 0.4) {
      const webText = "electricistass.com"
      const webWidth = ctx.measureText(webText).width + 32 * scale
      ctx.fillStyle = '#1f2937'
      ctx.beginPath()
      ctx.roundRect(badgeX, badgeY, webWidth, 24 * scale, 12 * scale)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(webText, badgeX + 16 * scale, badgeY + 17 * scale)
    }
    
    // Convertir a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b)
        else reject(new Error("Failed to create blob"))
      }, "image/png", 1.0)
    })
  }
  
  // Bulk publish function
  const bulkPublish = async () => {
    // Filtrar paginas sin imagen (tanto borradores como publicadas)
    const pagesToProcess = pages.filter(p => !p.hero_image_url)
    
    if (pagesToProcess.length === 0) {
      alert("Todas las paginas ya tienen imagen")
      return
    }
    
    setBulkDialogOpen(true)
    setBulkProgress({
      current: 0,
      total: pagesToProcess.length,
      currentPage: "",
      status: "generating",
      results: []
    })
    
    for (let i = 0; i < pagesToProcess.length; i++) {
      const page = pagesToProcess[i]
      const pageName = `${page.services?.name || "Servicio"} en ${page.cities?.name || "Ciudad"}`
      
      setBulkProgress(prev => ({
        ...prev,
        current: i + 1,
        currentPage: pageName,
        status: "generating"
      }))
      
      try {
        // 1. Generar imagen
        const blob = await generateImageForPage(
          page.services?.name || "Cerrajero",
          page.cities?.name || "Madrid"
        )
        
        setBulkProgress(prev => ({ ...prev, status: "uploading" }))
        
        // 2. Subir imagen
        const formData = new FormData()
        formData.append("file", blob, `hero-${page.slug}-${Date.now()}.png`)
        formData.append("folder", "pages")
        
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        })
        
        if (!uploadRes.ok) throw new Error("Error subiendo imagen")
        const uploadData = await uploadRes.json()
        
        setBulkProgress(prev => ({ ...prev, status: "publishing" }))
        
        // 3. Generar titulo SEO
        const serviceName = page.services?.name || "Cerrajero"
        const cityName = page.cities?.name || "Madrid"
        const seoTitle = generateSEOTitle(serviceName, cityName)
        
        // 4. Actualizar pagina con imagen, titulo y publicar (h1 se genera automaticamente en template)
        const updateRes = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hero_image_url: uploadData.url,
            title: seoTitle,
            status: "published",
            published_at: new Date().toISOString()
          })
        })
        
        if (!updateRes.ok) throw new Error("Error actualizando pagina")
        
        setBulkProgress(prev => ({
          ...prev,
          results: [...prev.results, { pageId: page.id, pageName, success: true }]
        }))
        
      } catch (error) {
        console.error(`Error procesando ${pageName}:`, error)
        setBulkProgress(prev => ({
          ...prev,
          results: [...prev.results, { 
            pageId: page.id, 
            pageName, 
            success: false, 
            error: error instanceof Error ? error.message : "Error desconocido" 
          }]
        }))
      }
      
      // Pequena pausa entre paginas
      await new Promise(r => setTimeout(r, 500))
    }
    
    // Revalidar sitemap despues de publicar todas las paginas
    try {
      await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: ["/sitemap.xml", ...pagesToProcess.map(p => `/${p.slug}`)]
        })
      })
    } catch (e) {
      console.error("Error revalidando sitemap:", e)
    }
    
    setBulkProgress(prev => ({ ...prev, status: "done" }))
    
    // Refrescar lista de paginas
    fetchPages()
  }

  // Bulk generate SEO titles
  const bulkGenerateTitles = async () => {
    // Procesar TODAS las paginas publicadas (no solo las filtradas)
    const pagesToProcess = pages.filter(p => p.status === "published")
    
    if (pagesToProcess.length === 0) {
      alert("No hay paginas publicadas para actualizar")
      return
    }
    
    setBulkTitlesDialogOpen(true)
    setBulkTitlesProgress({
      current: 0,
      total: pagesToProcess.length,
      currentPage: "",
      status: "generating",
      results: []
    })
    
    for (let i = 0; i < pagesToProcess.length; i++) {
      const page = pagesToProcess[i]
      const serviceName = page.services?.name || "Servicio"
      const cityName = page.cities?.name || "Ciudad"
      const pageName = `${serviceName} en ${cityName}`
      
      setBulkTitlesProgress(prev => ({
        ...prev,
        current: i + 1,
        currentPage: pageName,
        status: "generating"
      }))
      
      try {
        // Generar titulo SEO aleatorio para Google (el H1 se genera automaticamente en el template)
        const newTitle = generateSEOTitle(serviceName, cityName)
        
        // Solo actualizar el titulo SEO (el h1 de la DB se usa como subtitulo/H2)
        const updateRes = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle })
        })
        
        if (!updateRes.ok) {
          const updateData = await updateRes.json()
          throw new Error(updateData.error || "Error actualizando titulo")
        }
        
        setBulkTitlesProgress(prev => ({
          ...prev,
          results: [...prev.results, { pageId: page.id, pageName: `${pageName}: "${newTitle}"`, success: true }]
        }))
        
      } catch (error) {
        console.error(`Error procesando ${pageName}:`, error)
        setBulkTitlesProgress(prev => ({
          ...prev,
          results: [...prev.results, { 
            pageId: page.id, 
            pageName, 
            success: false, 
            error: error instanceof Error ? error.message : "Error desconocido" 
          }]
        }))
      }
      
      // Pequena pausa entre paginas
      await new Promise(r => setTimeout(r, 100))
    }
    
    setBulkTitlesProgress(prev => ({ ...prev, status: "done" }))
    
    // Refrescar lista de paginas
    fetchPages()
  }

  // Regenerar imagenes en bulk (para paginas que YA tienen imagen)
  const bulkRegenerateImages = async () => {
    // Procesar todas las paginas publicadas (regenerar sus imagenes)
    const pagesToProcess = pages.filter(p => p.status === "published")
    
    if (pagesToProcess.length === 0) {
      alert("No hay paginas publicadas para regenerar imagenes")
      return
    }
    
    setRegenImagesDialogOpen(true)
    setRegenImagesProgress({
      current: 0,
      total: pagesToProcess.length,
      currentPage: "",
      status: "generating",
      results: []
    })
    
    for (let i = 0; i < pagesToProcess.length; i++) {
      const page = pagesToProcess[i]
      const serviceName = page.services?.name || "Servicio"
      const cityName = page.cities?.name || "Ciudad"
      const pageName = `${serviceName} en ${cityName}`
      
      setRegenImagesProgress(prev => ({
        ...prev,
        current: i + 1,
        currentPage: pageName,
        status: "generating"
      }))
      
      try {
        // 1. Generar nueva imagen
        const blob = await generateImageForPage(serviceName, cityName)
        
        setRegenImagesProgress(prev => ({ ...prev, status: "uploading" }))
        
        // 2. Subir imagen
        const formData = new FormData()
        formData.append("file", blob, `hero-${page.slug}-${Date.now()}.png`)
        formData.append("folder", "pages")
        
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        })
        
        if (!uploadRes.ok) throw new Error("Error subiendo imagen")
        const uploadData = await uploadRes.json()
        
        // 3. Actualizar pagina con nueva imagen
        const updateRes = await fetch(`/api/admin/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hero_image_url: uploadData.url })
        })
        
        if (!updateRes.ok) throw new Error("Error actualizando pagina")
        
        setRegenImagesProgress(prev => ({
          ...prev,
          results: [...prev.results, { pageId: page.id, pageName, success: true }]
        }))
        
      } catch (error) {
        console.error(`Error regenerando imagen ${pageName}:`, error)
        setRegenImagesProgress(prev => ({
          ...prev,
          results: [...prev.results, { 
            pageId: page.id, 
            pageName, 
            success: false, 
            error: error instanceof Error ? error.message : "Error desconocido" 
          }]
        }))
      }
      
      // Pequena pausa entre paginas
      await new Promise(r => setTimeout(r, 500))
    }
    
    setRegenImagesProgress(prev => ({ ...prev, status: "done" }))
    
    // Refrescar lista de paginas
    fetchPages()
  }

  // Generate maps for pages without coordinates
  const generateMaps = async () => {
    if (pagesWithoutMaps === 0) {
      alert("Todas las paginas ya tienen coordenadas de mapa")
      return
    }

    setGenerateMapsLoading(true)
    try {
      const res = await fetch("/api/admin/generate-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Mapas generados:\n- Actualizados: ${data.updated}\n- Fallidos: ${data.failed}\n\n${data.errors?.length > 0 ? "Errores:\n" + data.errors.join("\n") : ""}`)
        fetchPagesWithoutMaps()
        fetchPages()
      } else {
        alert("Error: " + (data.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error generating maps:", error)
      alert("Error de conexion al generar mapas")
    } finally {
      setGenerateMapsLoading(false)
    }
  }

  // Fix broken images and publish pages
  const fixImagesAndPublish = async () => {
    if (pagesWithoutImages === 0) {
      alert("Todas las paginas ya tienen imagenes")
      return
    }

    setFixImagesLoading(true)
    try {
      const res = await fetch("/api/admin/fix-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publish: true, limit: 100 })
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Imagenes arregladas:\n- Arregladas: ${data.fixed}\n- Publicadas: ${data.published}\n- Fallidas: ${data.failed}\n\n${data.errors?.length > 0 ? "Errores:\n" + data.errors.slice(0, 5).join("\n") : ""}`)
        fetchPagesWithoutImages()
        fetchPages()
      } else {
        alert("Error: " + (data.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error fixing images:", error)
      alert("Error de conexion al arreglar imagenes")
    } finally {
      setFixImagesLoading(false)
    }
  }

  const refreshSitemap = async () => {
    setRefreshingSitemap(true)
    try {
      // Obtener todas las paginas publicadas para revalidar
      const publishedPages = pages.filter(p => p.status === "published")
      const paths = ["/sitemap.xml", ...publishedPages.map(p => `/${p.slug}`)]
      
      await fetch("/api/admin/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paths })
      })
      
      alert(`Sitemap actualizado con ${publishedPages.length} paginas publicadas`)
    } catch (error) {
      console.error("Error refreshing sitemap:", error)
      alert("Error al actualizar el sitemap")
    } finally {
      setRefreshingSitemap(false)
    }
  }

  const deletePage = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/pages?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setPages(prev => prev.filter(p => p.id !== id))
      } else {
        const error = await res.json()
        alert("Error eliminando pagina: " + (error.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error deleting page:", error)
      alert("Error de conexion al eliminar")
    } finally {
      setDeleting(null)
    }
  }

  const filteredPages = pages.filter(page => {
    const matchesSearch = 
      page.slug.toLowerCase().includes(search.toLowerCase()) ||
      page.services?.name.toLowerCase().includes(search.toLowerCase()) ||
      page.cities?.name.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || page.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todas las Páginas</h1>
          <p className="text-muted-foreground mt-1">
            {pages.length} páginas en total - {pages.filter(p => p.status === "published").length} publicadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshSitemap}
            variant="outline"
            disabled={refreshingSitemap}
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshingSitemap ? "animate-spin" : ""}`} />
            {refreshingSitemap ? "Actualizando..." : "Actualizar Sitemap"}
          </Button>
          <Button 
            onClick={bulkGenerateTitles}
            variant="outline"
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Generar Titulos Bulk
          </Button>
          <Button 
            onClick={bulkRegenerateImages}
            variant="outline"
            className="border-amber-300 text-amber-600 hover:bg-amber-50"
          >
            <ImageOff className="h-4 w-4 mr-2" />
            Regenerar Imagenes
          </Button>
          <Button 
            onClick={bulkPublish}
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Publicar en Bulk
          </Button>
          <Button 
            onClick={generateMaps}
            variant="outline"
            disabled={generateMapsLoading || pagesWithoutMaps === 0}
            className="border-cyan-300 text-cyan-600 hover:bg-cyan-50"
          >
            <Globe className={`h-4 w-4 mr-2 ${generateMapsLoading ? "animate-spin" : ""}`} />
            {generateMapsLoading 
              ? "Generando..." 
              : pagesWithoutMaps > 0 
                ? `Generar Mapas (${pagesWithoutMaps})` 
                : "Mapas OK"
            }
          </Button>
          <Button 
            onClick={fixImagesAndPublish}
            variant="outline"
            disabled={fixImagesLoading || pagesWithoutImages === 0}
            className="border-rose-300 text-rose-600 hover:bg-rose-50"
          >
            <ImageIcon className={`h-4 w-4 mr-2 ${fixImagesLoading ? "animate-spin" : ""}`} />
            {fixImagesLoading 
              ? "Arreglando..." 
              : pagesWithoutImages > 0 
                ? `Arreglar Imgs + Publicar (${pagesWithoutImages})` 
                : "Imagenes OK"
            }
          </Button>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/admin/nueva-pagina">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Página
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Bulk Progress Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Publicacion en Bulk
            </DialogTitle>
            <DialogDescription>
              {bulkProgress.status === "done" 
                ? "Proceso completado" 
                : `Procesando ${bulkProgress.current} de ${bulkProgress.total} paginas`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {bulkProgress.status !== "done" && bulkProgress.total > 0 && (
              <>
                <Progress value={(bulkProgress.current / bulkProgress.total) * 100} />
                <div className="text-sm text-center">
                  <span className="font-medium">{bulkProgress.currentPage}</span>
                  <span className="text-muted-foreground ml-2">
                    {bulkProgress.status === "generating" && "Generando imagen..."}
                    {bulkProgress.status === "uploading" && "Subiendo imagen..."}
                    {bulkProgress.status === "publishing" && "Publicando pagina..."}
                  </span>
                </div>
              </>
            )}
            
            {bulkProgress.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {bulkProgress.results.map((result, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      result.success ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className={result.success ? "text-green-700" : "text-red-700"}>
                      {result.pageName}
                    </span>
                    {result.error && (
                      <span className="text-red-500 text-xs ml-auto">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {bulkProgress.status === "done" && (
              <div className="text-center pt-4">
                <p className="text-lg font-medium text-green-600">
                  {bulkProgress.results.filter(r => r.success).length} paginas publicadas
                </p>
                {bulkProgress.results.filter(r => !r.success).length > 0 && (
                  <p className="text-sm text-red-500">
                    {bulkProgress.results.filter(r => !r.success).length} errores
                  </p>
                )}
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setBulkDialogOpen(false)
                    setBulkProgress({ current: 0, total: 0, currentPage: "", status: "idle", results: [] })
                  }}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Titles Progress Dialog */}
      <Dialog open={bulkTitlesDialogOpen} onOpenChange={setBulkTitlesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Generacion de Titulos SEO
            </DialogTitle>
            <DialogDescription>
              {bulkTitlesProgress.status === "done" 
                ? "Titulos generados" 
                : `Actualizando ${bulkTitlesProgress.current} de ${bulkTitlesProgress.total} paginas`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {bulkTitlesProgress.status !== "done" && bulkTitlesProgress.total > 0 && (
              <>
                <Progress value={(bulkTitlesProgress.current / bulkTitlesProgress.total) * 100} />
                <div className="text-sm text-center">
                  <span className="font-medium">{bulkTitlesProgress.currentPage}</span>
                </div>
              </>
            )}
            
            {bulkTitlesProgress.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {bulkTitlesProgress.results.map((result, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      result.success ? "bg-blue-50" : "bg-red-50"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`${result.success ? "text-blue-700" : "text-red-700"} text-xs`}>
                      {result.pageName}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {bulkTitlesProgress.status === "done" && (
              <div className="text-center pt-4">
                <p className="text-lg font-medium text-blue-600">
                  {bulkTitlesProgress.results.filter(r => r.success).length} titulos actualizados
                </p>
                {bulkTitlesProgress.results.filter(r => !r.success).length > 0 && (
                  <p className="text-sm text-red-500">
                    {bulkTitlesProgress.results.filter(r => !r.success).length} errores
                  </p>
                )}
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setBulkTitlesDialogOpen(false)
                    setBulkTitlesProgress({ current: 0, total: 0, currentPage: "", status: "idle", results: [] })
                  }}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Images Progress Dialog */}
      <Dialog open={regenImagesDialogOpen} onOpenChange={setRegenImagesDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageOff className="h-5 w-5 text-amber-500" />
              Regenerando Imagenes
            </DialogTitle>
            <DialogDescription>
              {regenImagesProgress.status === "done" 
                ? "Imagenes regeneradas" 
                : `Procesando ${regenImagesProgress.current} de ${regenImagesProgress.total} paginas`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {regenImagesProgress.status !== "done" && regenImagesProgress.total > 0 && (
              <>
                <Progress value={(regenImagesProgress.current / regenImagesProgress.total) * 100} />
                <div className="text-sm text-center">
                  <span className="font-medium">{regenImagesProgress.currentPage}</span>
                  <span className="text-muted-foreground ml-2">
                    {regenImagesProgress.status === "generating" && "Generando imagen..."}
                    {regenImagesProgress.status === "uploading" && "Subiendo imagen..."}
                  </span>
                </div>
              </>
            )}
            
            {regenImagesProgress.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {regenImagesProgress.results.map((result, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      result.success ? "bg-amber-50" : "bg-red-50"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <span className={`${result.success ? "text-amber-700" : "text-red-700"} text-xs`}>
                      {result.pageName}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {regenImagesProgress.status === "done" && (
              <div className="text-center pt-4">
                <p className="text-lg font-medium text-amber-600">
                  {regenImagesProgress.results.filter(r => r.success).length} imagenes regeneradas
                </p>
                {regenImagesProgress.results.filter(r => !r.success).length > 0 && (
                  <p className="text-sm text-red-500">
                    {regenImagesProgress.results.filter(r => !r.success).length} errores
                  </p>
                )}
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    setRegenImagesDialogOpen(false)
                    setRegenImagesProgress({ current: 0, total: 0, currentPage: "", status: "idle", results: [] })
                  }}
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por servicio, ciudad o URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="published">Publicadas</SelectItem>
                <SelectItem value="draft">Borradores</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Página</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Fecha Publicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No se encontraron páginas
                  </TableCell>
                </TableRow>
              ) : (
                filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {page.services?.name || "Sin servicio"} en {page.cities?.name || "Sin ciudad"}
                            {!page.hero_image_url && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded" title="Sin imagen">
                                <ImageOff className="h-3 w-3" />
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              /{page.slug}
                            </span>
                            {page.cities?.population && (
                              <span className="flex items-center gap-1" title="Poblacion">
                                <Users className="h-3 w-3" />
                                {page.cities.population.toLocaleString('es-ES')} hab.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(page.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {page.sitemap_priority || 0.8}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(page.published_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/paginas/${page.id}`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Link>
                        </Button>
                        {page.status === "published" && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              disabled={deleting === page.id}
                            >
                              {deleting === page.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar pagina</AlertDialogTitle>
                              <AlertDialogDescription>
                                Estas seguro de que quieres eliminar la pagina <strong>/{page.slug}</strong>? 
                                Esta accion no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deletePage(page.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
