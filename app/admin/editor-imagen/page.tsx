"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Download, RotateCcw, Phone, MessageCircle, Sparkles, Loader2, Save, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// Datos aleatorios para generacion
const CIUDADES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Malaga", "Murcia", "Palma", "Bilbao", 
  "Alicante", "Cordoba", "Valladolid", "Vigo", "Gijon", "Granada", "Elche", "Oviedo", "Cartagena",
  "Terrassa", "Jerez", "Sabadell", "Mostoles", "Alcala", "Pamplona", "Fuenlabrada", "Almeria",
  "Leganes", "San Sebastian", "Santander", "Burgos", "Castellon", "Albacete", "Getafe", "Alcorcon",
  "Logrono", "Badajoz", "Salamanca", "Huelva", "Lleida", "Tarragona", "Leon", "Cadiz", "Jaen", "Ourense",
  "Marbella", "Algeciras", "Torrevieja", "Lugo", "Reus", "Toledo", "Avila", "Segovia", "Cuenca"
]

const SERVICIOS = ["Electricista", "Electricistas", "Electricista 24h", "Electricista Urgente", "Electricista Urgencias"]

const TAGLINES = [
  "Servicio rapido y barato",
  "Llegamos en 20 minutos",
  "24 horas, 365 dias",
  "Precios sin sorpresas",
  "Urgencias al instante",
  "Profesionales de confianza",
  "Reparamos averias electricas",
  "Instalaciones seguras",
  "Presupuesto gratis",
  "Servicio express",
  "Atencion inmediata",
  "Los mejores precios",
  "Expertos en electricidad",
  "Tu electricista de confianza",
  "Solucion garantizada",
  "Boletines electricos",
  "Cuadros electricos",
  "Iluminacion LED",
]

const ESTILOS_TITULO = [
  { x: 5, y: 5, fontSize: 64 },
  { x: 5, y: 8, fontSize: 58 },
  { x: 3, y: 6, fontSize: 70 },
  { x: 8, y: 10, fontSize: 52 },
  { x: 5, y: 3, fontSize: 60 },
]

const ESTILOS_SUBTITULO = [
  { x: 5, y: 16, fontSize: 48 },
  { x: 5, y: 18, fontSize: 44 },
  { x: 3, y: 15, fontSize: 52 },
  { x: 8, y: 20, fontSize: 40 },
  { x: 5, y: 14, fontSize: 46 },
]

const COLORES_TEMA = [
  { primary: "#10b981", secondary: "#059669" }, // Esmeralda (principal)
  { primary: "#10b981", secondary: "#059669" }, // Esmeralda (repetido para mayor probabilidad)
  { primary: "#22c55e", secondary: "#16a34a" }, // Verde
  { primary: "#3b82f6", secondary: "#2563eb" }, // Azul
  { primary: "#f59e0b", secondary: "#d97706" }, // Amarillo
  { primary: "#14b8a6", secondary: "#0d9488" }, // Teal
]

// Imagenes base de los electricistas (Vercel Blob)
const BASE_IMAGES = [
  {
    id: "electricista1",
    name: "Diego - Electricista",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/electricista1.png-5lV7B658fbNcJr7tqNYexrpGMIVE28.jpeg",
    defaultService: "Electricista"
  },
  {
    id: "electricista2", 
    name: "Maria - Electricista",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/electricista2.png-fOFwgqjvlWMIbBVd11b4MKC5HwARgz.jpeg",
    defaultService: "Electricista"
  },
  {
    id: "electricista3",
    name: "Luis - Electricista", 
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/electricista3.png-9ASRT3rhYVXRjk811yU2vaFgXCnm53.jpeg",
    defaultService: "Electricista"
  }
]

const COLORS = [
  { name: "Esmeralda", value: "#10b981", bg: "bg-emerald-500" },
  { name: "Verde", value: "#22c55e", bg: "bg-green-500" },
  { name: "Azul", value: "#3b82f6", bg: "bg-blue-500" },
  { name: "Teal", value: "#14b8a6", bg: "bg-teal-500" },
  { name: "Negro", value: "#000000", bg: "bg-black" },
]

interface TextElement {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: string
  visible: boolean
}

interface BadgeElement {
  id: string
  type: "whatsapp" | "phone" | "custom"
  text: string
  x: number
  y: number
  visible: boolean
  bgColor: string
}

export default function ImageEditorPage() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  
  // Leer parametros de URL
  const urlService = searchParams.get('service') || ''
  const urlCity = searchParams.get('city') || ''
  const urlPageId = searchParams.get('pageId') || ''
  
  // Determinar si viene desde una pagina especifica
  const hasContext = urlService && urlCity
  
  // Estado de imagen base
  const [selectedImage, setSelectedImage] = useState(BASE_IMAGES[0])
  
  // Elementos de texto - inicializar con valores de URL si existen
  const [textElements, setTextElements] = useState<TextElement[]>([
    { id: "title", text: urlService || "Electricista", x: 5, y: 8, fontSize: 64, color: "#10b981", fontWeight: "800", visible: true },
    { id: "subtitle", text: urlCity ? `en ${urlCity}` : "en Madrid", x: 5, y: 18, fontSize: 48, color: "#10b981", fontWeight: "800", visible: true },
    { id: "tagline", text: "Servicio rapido y barato", x: 5, y: 28, fontSize: 24, color: "#000000", fontWeight: "600", visible: true },
    { id: "extra", text: "", x: 5, y: 38, fontSize: 20, color: "#666666", fontWeight: "500", visible: false },
  ])
  
  // Badges/Botones
  const [badges, setBadges] = useState<BadgeElement[]>([
    { id: "phone", type: "phone", text: "900 433 214", x: 5, y: 85, visible: true, bgColor: "#10b981" },
    { id: "whatsapp", type: "whatsapp", text: "WhatsApp", x: 35, y: 85, visible: true, bgColor: "#22c55e" },
    { id: "web", type: "custom", text: "electricistass.com", x: 60, y: 85, visible: true, bgColor: "#000000" },
  ])

  // Decoraciones
  const [showStripes, setShowStripes] = useState(true)
  const [stripeColor, setStripeColor] = useState("#10b981")
  
  // Estado de generacion
  const [isGenerating, setIsGenerating] = useState(false)
  const [cityInput, setCityInput] = useState("")
  const [serviceInput, setServiceInput] = useState("")
  
  // Estado de guardado
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const router = useRouter()
  
  // Suprimir alerts de html2canvas globalmente (errores de colores LAB/OKLCH)
  useEffect(() => {
    const originalAlert = window.alert
    window.alert = (message: string) => {
      // Solo suprimir alerts relacionados con colores no soportados
      if (typeof message === 'string' && (message.includes('lab') || message.includes('oklch') || message.includes('color function'))) {
        console.log('[v0] Suppressed html2canvas color error:', message)
        return
      }
      // Mostrar otros alerts normalmente
      originalAlert(message)
    }
    
    return () => {
      window.alert = originalAlert
    }
  }, [])
  
  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }
  
  const updateBadge = (id: string, updates: Partial<BadgeElement>) => {
    setBadges(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }

  const resetToDefaults = () => {
    setTextElements([
      { id: "title", text: selectedImage.defaultService, x: 5, y: 8, fontSize: 64, color: "#10b981", fontWeight: "800", visible: true },
      { id: "subtitle", text: "en Madrid", x: 5, y: 18, fontSize: 48, color: "#10b981", fontWeight: "800", visible: true },
      { id: "tagline", text: "Servicio rapido y barato", x: 5, y: 28, fontSize: 24, color: "#000000", fontWeight: "600", visible: true },
      { id: "extra", text: "", x: 5, y: 38, fontSize: 20, color: "#666666", fontWeight: "500", visible: false },
    ])
    setBadges([
      { id: "phone", type: "phone", text: "900 433 214", x: 5, y: 85, visible: true, bgColor: "#10b981" },
      { id: "whatsapp", type: "whatsapp", text: "WhatsApp", x: 35, y: 85, visible: true, bgColor: "#22c55e" },
      { id: "web", type: "custom", text: "electricistass.com", x: 60, y: 85, visible: true, bgColor: "#000000" },
    ])
  }

  // Generacion aleatoria con IA
  const generateRandom = (customCity?: string, customService?: string) => {
    setIsGenerating(true)
    
    // Seleccionar imagen base aleatoria
    const randomImage = BASE_IMAGES[Math.floor(Math.random() * BASE_IMAGES.length)]
    setSelectedImage(randomImage)
    
    // Si viene desde una pagina, usar siempre el servicio y ciudad de la URL
    // Solo randomizar posiciones, colores, taglines, etc.
    const ciudad = urlCity || customCity || CIUDADES[Math.floor(Math.random() * CIUDADES.length)]
    const servicio = urlService || customService || SERVICIOS[Math.floor(Math.random() * SERVICIOS.length)]
    const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
    
    // Seleccionar estilo aleatorio
    const estiloTitulo = ESTILOS_TITULO[Math.floor(Math.random() * ESTILOS_TITULO.length)]
    const estiloSubtitulo = ESTILOS_SUBTITULO[Math.floor(Math.random() * ESTILOS_SUBTITULO.length)]
    const colorTema = COLORES_TEMA[Math.floor(Math.random() * COLORES_TEMA.length)]
    
    // Variaciones aleatorias en posicion de badges
    const badgeY = 80 + Math.floor(Math.random() * 12) // 80-92%
    const badgeBaseX = Math.floor(Math.random() * 10) // 0-10%
    
    // Decidir aleatoriamente que mostrar
    const showExtra = Math.random() > 0.6
    const showWebBadge = Math.random() > 0.3
    const showWhatsappBadge = Math.random() > 0.2
    
    // Formato de titulo alternativo
    const tituloFormatos = [
      servicio,
      `${servicio}s`,
      servicio.toUpperCase(),
    ]
    const titulo = tituloFormatos[Math.floor(Math.random() * tituloFormatos.length)]
    
    // Formato de subtitulo alternativo
    const subtituloFormatos = [
      `en ${ciudad}`,
      ciudad,
      `${ciudad}`,
    ]
    const subtitulo = subtituloFormatos[Math.floor(Math.random() * subtituloFormatos.length)]
    
    // Aplicar configuracion
    setTextElements([
      { 
        id: "title", 
        text: titulo, 
        x: estiloTitulo.x, 
        y: estiloTitulo.y, 
        fontSize: estiloTitulo.fontSize, 
        color: colorTema.primary, 
        fontWeight: "800", 
        visible: true 
      },
      { 
        id: "subtitle", 
        text: subtitulo, 
        x: estiloSubtitulo.x, 
        y: estiloSubtitulo.y, 
        fontSize: estiloSubtitulo.fontSize, 
        color: colorTema.primary, 
        fontWeight: "800", 
        visible: true 
      },
      { 
        id: "tagline", 
        text: tagline, 
        x: estiloTitulo.x, 
        y: estiloSubtitulo.y + 10, 
        fontSize: 22 + Math.floor(Math.random() * 8), 
        color: "#000000", 
        fontWeight: "600", 
        visible: true 
      },
      { 
        id: "extra", 
        text: showExtra ? `Llamanos: 900 433 214` : "", 
        x: estiloTitulo.x, 
        y: estiloSubtitulo.y + 18, 
        fontSize: 18, 
        color: "#333333", 
        fontWeight: "500", 
        visible: showExtra 
      },
    ])
    
    setBadges([
      { 
        id: "phone", 
        type: "phone", 
        text: "900 433 214", 
        x: badgeBaseX, 
        y: badgeY, 
        visible: true, 
        bgColor: colorTema.primary 
      },
      { 
        id: "whatsapp", 
        type: "whatsapp", 
        text: "WhatsApp", 
        x: badgeBaseX + 28, 
        y: badgeY, 
        visible: showWhatsappBadge, 
        bgColor: "#22c55e" 
      },
      { 
        id: "web", 
        type: "custom", 
        text: "electricistass.com", 
        x: showWhatsappBadge ? badgeBaseX + 50 : badgeBaseX + 28, 
        y: badgeY, 
        visible: showWebBadge, 
        bgColor: "#000000" 
      },
    ])
    
    setStripeColor(colorTema.primary)
    setShowStripes(Math.random() > 0.3)
    
    setTimeout(() => setIsGenerating(false), 300)
  }
  
  // Guardar imagen directamente a la pagina
  const saveToPage = async () => {
    if (!urlPageId || !canvasRef.current) {
      console.error("[v0] No pageId or canvas ref")
      return
    }
    
    setIsSaving(true)
    setSaveSuccess(false)
    
    try {
      // Crear canvas manualmente para mejor control
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const width = 1200
      const height = 1200 // Cuadrado para coincidir con el preview
      canvas.width = width
      canvas.height = height
      
      // Factor de escala basado en el preview (600px)
      const scale = width / 600
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Cargar y dibujar imagen base
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = selectedImage.url
      })
      // Dibujar imagen cubriendo todo el canvas, manteniendo proporción
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
      
      // Dibujar rayas decorativas
      if (showStripes) {
        ctx.fillStyle = stripeColor
        const stripeX = width * 0.75
        const stripeY = height * 0.25
        ctx.fillRect(stripeX, stripeY, width * 0.25, 12 * scale)
        ctx.fillRect(stripeX + width * 0.0625, stripeY + 20 * scale, width * 0.1875, 12 * scale)
        ctx.fillRect(stripeX + width * 0.125, stripeY + 40 * scale, width * 0.125, 12 * scale)
      }
      
      // Dibujar textos
      textElements.filter(el => el.visible && el.text).forEach(el => {
        const fontSize = el.fontSize * scale
        ctx.font = `${el.fontWeight} ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = el.color
        ctx.shadowColor = 'rgba(255,255,255,0.8)'
        ctx.shadowBlur = 4 * scale
        ctx.shadowOffsetX = 2 * scale
        ctx.shadowOffsetY = 2 * scale
        ctx.fillText(el.text, width * (el.x / 100), height * (el.y / 100) + fontSize)
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      })
      
      // Dibujar badges
      badges.filter(b => b.visible).forEach(badge => {
        const x = width * (badge.x / 100)
        const y = height * (badge.y / 100)
        const text = badge.text
        const badgeFontSize = 14 * scale
        ctx.font = `bold ${badgeFontSize}px Arial, sans-serif`
        const textWidth = ctx.measureText(text).width
        const padding = 16 * scale
        const badgeHeight = 24 * scale
        const badgeWidth = textWidth + padding * 2
        
        // Fondo del badge con bordes redondeados
        ctx.fillStyle = badge.bgColor
        ctx.beginPath()
        ctx.roundRect(x, y, badgeWidth, badgeHeight, badgeHeight / 2)
        ctx.fill()
        
        // Texto del badge
        ctx.fillStyle = '#ffffff'
        ctx.fillText(text, x + padding, y + badgeHeight * 0.7)
      })
      
      // Convertir a blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b)
          else reject(new Error("Failed to create blob"))
        }, "image/png", 1.0)
      })
      
      // Crear FormData para subir - igual que ImageUploader
      const formData = new FormData()
      const filename = `hero-${Date.now()}.png`
      formData.append("file", blob, filename)
      formData.append("folder", "pages")
      
      // Subir imagen
      const uploadResponse = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData
      })
      
      const uploadData = await uploadResponse.json()
      
      if (!uploadResponse.ok) {
        console.error("[v0] Upload error:", uploadData)
        throw new Error(uploadData.error || "Error al subir la imagen")
      }
      
      console.log("[v0] Image uploaded:", uploadData.url)
      
      // Actualizar la pagina con la nueva URL
      const updateResponse = await fetch(`/api/admin/pages/${urlPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hero_image_url: uploadData.url
        })
      })
      
      const updateData = await updateResponse.json()
      
      if (!updateResponse.ok) {
        console.error("[v0] Update error:", updateData)
        throw new Error(updateData.error || "Error al actualizar la pagina")
      }
      
      console.log("[v0] Page updated successfully")
      setSaveSuccess(true)
      
      // Redirigir despues de 1.5 segundos
      setTimeout(() => {
        router.push(`/admin/paginas/${urlPageId}`)
      }, 1500)
      
    } catch (error) {
      console.error("[v0] Error guardando imagen:", error)
      alert(error instanceof Error ? error.message : "Error al guardar la imagen. Intenta de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

const downloadImage = async () => {
    try {
      // Crear canvas manualmente
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const width = 1200
      const height = 1200
      canvas.width = width
      canvas.height = height
      
      // Factor de escala basado en el preview (600px)
      const scale = width / 600
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      
      // Cargar y dibujar imagen base
      const img = new Image()
      img.crossOrigin = 'anonymous'
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = selectedImage.url
      })
      // Dibujar imagen cubriendo todo el canvas, manteniendo proporción
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
      
      // Dibujar rayas decorativas
      if (showStripes) {
        ctx.fillStyle = stripeColor
        const stripeX = width * 0.75
        const stripeY = height * 0.25
        ctx.fillRect(stripeX, stripeY, width * 0.25, 12 * scale)
        ctx.fillRect(stripeX + width * 0.0625, stripeY + 20 * scale, width * 0.1875, 12 * scale)
        ctx.fillRect(stripeX + width * 0.125, stripeY + 40 * scale, width * 0.125, 12 * scale)
      }
      
      // Dibujar textos
      textElements.filter(el => el.visible && el.text).forEach(el => {
        const fontSize = el.fontSize * scale
        ctx.font = `${el.fontWeight} ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = el.color
        ctx.shadowColor = 'rgba(255,255,255,0.8)'
        ctx.shadowBlur = 4 * scale
        ctx.shadowOffsetX = 2 * scale
        ctx.shadowOffsetY = 2 * scale
        ctx.fillText(el.text, width * (el.x / 100), height * (el.y / 100) + fontSize)
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      })
      
      // Dibujar badges
      badges.filter(b => b.visible).forEach(badge => {
        const x = width * (badge.x / 100)
        const y = height * (badge.y / 100)
        const text = badge.text
        const badgeFontSize = 14 * scale
        ctx.font = `bold ${badgeFontSize}px Arial, sans-serif`
        const textWidth = ctx.measureText(text).width
        const padding = 16 * scale
        const badgeHeight = 24 * scale
        const badgeWidth = textWidth + padding * 2
        
        // Fondo del badge
        ctx.fillStyle = badge.bgColor
        ctx.beginPath()
        ctx.roundRect(x, y, badgeWidth, badgeHeight, badgeHeight / 2)
        ctx.fill()
        
        // Texto del badge
        ctx.fillStyle = '#ffffff'
        ctx.fillText(text, x + padding, y + badgeHeight * 0.7)
      })
      
      const link = document.createElement('a')
      link.download = `hero-${selectedImage.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating image:', error)
      window.alert('Error al generar la imagen. Intenta de nuevo.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={urlPageId ? `/admin/paginas/${urlPageId}` : "/admin"}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">Editor de Imagenes Hero</h1>
                {hasContext && (
                  <p className="text-sm text-muted-foreground">{urlService} en {urlCity}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="default" 
                onClick={() => generateRandom()} 
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generar con IA
              </Button>
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
              <Button onClick={downloadImage} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              {urlPageId && (
                <Button 
                  onClick={saveToPage} 
                  disabled={isSaving || saveSuccess}
                  className={saveSuccess 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-emerald-600 hover:bg-emerald-700"
                  }
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : saveSuccess ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saveSuccess ? "Guardado!" : "Guardar en Pagina"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={canvasRef}
                  className="relative w-full aspect-square overflow-hidden"
                  style={{ maxWidth: '600px', backgroundColor: '#ffffff' }}
                >
                  {/* Imagen base */}
                  <img 
                    src={selectedImage.url} 
                    alt={selectedImage.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                  
                  {/* Decoracion de rayas */}
                  {showStripes && (
                    <div style={{ position: 'absolute', right: 0, top: '25%', width: '128px' }}>
                      <div style={{ height: '12px', width: '100%', backgroundColor: stripeColor, marginBottom: '8px' }} />
                      <div style={{ height: '12px', width: '75%', backgroundColor: stripeColor, marginLeft: 'auto', marginBottom: '8px' }} />
                      <div style={{ height: '12px', width: '50%', backgroundColor: stripeColor, marginLeft: 'auto' }} />
                    </div>
                  )}
                  
                  {/* Textos */}
                  {textElements.filter(el => el.visible && el.text).map(el => (
                    <div 
                      key={el.id}
                      style={{
                        position: 'absolute',
                        whiteSpace: 'nowrap',
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        fontSize: `${el.fontSize}px`,
                        color: el.color,
                        fontWeight: el.fontWeight,
                        textShadow: '2px 2px 4px rgba(255,255,255,0.8)',
                        lineHeight: 1.1,
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      {el.text}
                    </div>
                  ))}
                  
                  {/* Badges - sin iconos, solo texto */}
                  {badges.filter(b => b.visible).map(badge => (
                    <div
                      key={badge.id}
                      style={{
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '9999px',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '14px',
                        left: `${badge.x}%`,
                        top: `${badge.y}%`,
                        backgroundColor: badge.bgColor,
                        fontFamily: 'Arial, sans-serif',
                      }}
                    >
                      {badge.text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Generacion Rapida */}
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Generacion Rapida con IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasContext ? (
                  // Viene desde una pagina especifica - mostrar contexto fijo
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-sm font-medium text-gray-700 mb-1">Generando para:</p>
                    <p className="text-lg font-bold text-purple-600">{urlService} en {urlCity}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      El servicio y ciudad estan fijos. Solo se aleatorizan posiciones, colores y taglines.
                    </p>
                  </div>
                ) : (
                  // Sin contexto - permitir elegir ciudad/servicio
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Ciudad (opcional)</Label>
                      <Input 
                        placeholder="Ej: Madrid" 
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Servicio (opcional)</Label>
                      <Select value={serviceInput} onValueChange={setServiceInput}>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Aleatorio" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="random">Aleatorio</SelectItem>
                          {SERVICIOS.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <Button 
                  onClick={() => generateRandom(
                    cityInput || undefined, 
                    serviceInput && serviceInput !== "random" ? serviceInput : undefined
                  )}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {hasContext ? 'Generar Variacion Aleatoria' : 'Generar Imagen Aleatoria'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {hasContext 
                    ? 'Genera posiciones, colores y taglines aleatorios manteniendo servicio y ciudad'
                    : 'Genera textos, posiciones y colores aleatorios para crear imagenes unicas'
                  }
                </p>
              </CardContent>
            </Card>
            
            {/* Selector de imagen base */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Imagen Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {BASE_IMAGES.map(img => (
                    <button
                      key={img.id}
                      onClick={() => {
                        setSelectedImage(img)
                        updateTextElement("title", { text: img.defaultService })
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage.id === img.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs py-1 text-center">
                        {img.name.split(' - ')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controles */}
          <div className="space-y-4">
            <Tabs defaultValue="textos" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="textos">Textos</TabsTrigger>
                <TabsTrigger value="badges">Badges</TabsTrigger>
                <TabsTrigger value="decoracion">Decoracion</TabsTrigger>
              </TabsList>
              
              <TabsContent value="textos" className="space-y-4 mt-4">
                {textElements.map(el => (
                  <Card key={el.id}>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium capitalize">{el.id}</Label>
                        <Switch 
                          checked={el.visible} 
                          onCheckedChange={(v) => updateTextElement(el.id, { visible: v })}
                        />
                      </div>
                      
                      {el.visible && (
                        <>
                          <Input 
                            value={el.text}
                            onChange={(e) => updateTextElement(el.id, { text: e.target.value })}
                            placeholder="Texto..."
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Tamaño: {el.fontSize}px</Label>
                              <Slider 
                                value={[el.fontSize]} 
                                onValueChange={([v]) => updateTextElement(el.id, { fontSize: v })}
                                min={12}
                                max={80}
                                step={2}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Posicion X: {el.x}%</Label>
                              <Slider 
                                value={[el.x]} 
                                onValueChange={([v]) => updateTextElement(el.id, { x: v })}
                                min={0}
                                max={80}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Posicion Y: {el.y}%</Label>
                              <Slider 
                                value={[el.y]} 
                                onValueChange={([v]) => updateTextElement(el.id, { y: v })}
                                min={0}
                                max={90}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Color</Label>
                              <div className="flex gap-1">
                                {COLORS.map(c => (
                                  <button
                                    key={c.value}
                                    onClick={() => updateTextElement(el.id, { color: c.value })}
                                    className={`w-6 h-6 rounded-full border-2 ${c.bg} ${el.color === c.value ? 'border-gray-800 ring-2 ring-offset-1' : 'border-gray-300'}`}
                                  />
                                ))}
                                <input 
                                  type="color" 
                                  value={el.color}
                                  onChange={(e) => updateTextElement(el.id, { color: e.target.value })}
                                  className="w-6 h-6 rounded cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="badges" className="space-y-4 mt-4">
                {badges.map(badge => (
                  <Card key={badge.id}>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          {badge.type === "phone" && <Phone className="h-4 w-4" />}
                          {badge.type === "whatsapp" && <MessageCircle className="h-4 w-4" />}
                          {badge.id}
                        </Label>
                        <Switch 
                          checked={badge.visible} 
                          onCheckedChange={(v) => updateBadge(badge.id, { visible: v })}
                        />
                      </div>
                      
                      {badge.visible && (
                        <>
                          <Input 
                            value={badge.text}
                            onChange={(e) => updateBadge(badge.id, { text: e.target.value })}
                            placeholder="Texto del badge..."
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs text-muted-foreground">Posicion X: {badge.x}%</Label>
                              <Slider 
                                value={[badge.x]} 
                                onValueChange={([v]) => updateBadge(badge.id, { x: v })}
                                min={0}
                                max={80}
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Posicion Y: {badge.y}%</Label>
                              <Slider 
                                value={[badge.y]} 
                                onValueChange={([v]) => updateBadge(badge.id, { y: v })}
                                min={0}
                                max={95}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs text-muted-foreground">Color de fondo</Label>
                            <div className="flex gap-1 mt-1">
                              {COLORS.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => updateBadge(badge.id, { bgColor: c.value })}
                                  className={`w-6 h-6 rounded-full border-2 ${c.bg} ${badge.bgColor === c.value ? 'border-gray-800 ring-2 ring-offset-1' : 'border-gray-300'}`}
                                />
                              ))}
                              <input 
                                type="color" 
                                value={badge.bgColor}
                                onChange={(e) => updateBadge(badge.id, { bgColor: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="decoracion" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Rayas decorativas</Label>
                      <Switch checked={showStripes} onCheckedChange={setShowStripes} />
                    </div>
                    
                    {showStripes && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Color de las rayas</Label>
                        <div className="flex gap-1 mt-1">
                          {COLORS.map(c => (
                            <button
                              key={c.value}
                              onClick={() => setStripeColor(c.value)}
                              className={`w-6 h-6 rounded-full border-2 ${c.bg} ${stripeColor === c.value ? 'border-gray-800 ring-2 ring-offset-1' : 'border-gray-300'}`}
                            />
                          ))}
                          <input 
                            type="color" 
                            value={stripeColor}
                            onChange={(e) => setStripeColor(e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Presets rapidos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        updateTextElement("title", { text: "Cerrajero", color: "#f97316" })
                        updateTextElement("subtitle", { text: "en Madrid", color: "#f97316" })
                        setStripeColor("#f97316")
                      }}
                    >
                      Cerrajero Madrid (Naranja)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        updateTextElement("title", { text: "Electricista", color: "#3b82f6" })
                        updateTextElement("subtitle", { text: "en Barcelona", color: "#3b82f6" })
                        setStripeColor("#3b82f6")
                      }}
                    >
                      Electricista Barcelona (Azul)
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        updateTextElement("title", { text: "Fontanero", color: "#22c55e" })
                        updateTextElement("subtitle", { text: "en Valencia", color: "#22c55e" })
                        setStripeColor("#22c55e")
                      }}
                    >
                      Fontanero Valencia (Verde)
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
