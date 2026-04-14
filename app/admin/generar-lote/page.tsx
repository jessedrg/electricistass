"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, Sparkles, Check, X, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Save, RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { adminFetch } from "@/lib/admin/fetch"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { FAQsEditor } from "@/components/admin/faqs-editor"
import { ReviewsEditor } from "@/components/admin/reviews-editor"

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
  latitude?: number
  longitude?: number
}

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
  verified?: boolean
}

interface GeneratedPage {
  id: string
  service: Service
  city: City
  status: 'pending' | 'generating' | 'saving' | 'ready' | 'published' | 'error' | 'exists' | 'saved'
  error?: string
  data?: {
    slug: string
    title: string
    meta_description: string
    h1: string
    intro_text: string
    cta_button_text: string
    cta_secondary_text: string
    cta_badge_1: string
    cta_badge_2: string
    cta_badge_3: string
    latitude: string
    longitude: string
    show_map: boolean
    faqs: FAQ[]
    reviews: Review[]
    is_neighborhood?: boolean
    parent_city_slug?: string
    // Extra fields for variation
    highlight?: string
    final_cta_title?: string
    final_cta_subtitle?: string
    urgency_message?: string
    extra_section_type?: string
    extra_section_content?: string
    content_tone?: string
    local_facts?: {
      population_approx?: string
      famous_for?: string
      local_landmark?: string
      interesting_fact?: string
    }
  }
}

interface ExistingPage {
  id: string
  service_id: string
  city_id: string
  slug: string
}

export default function GenerarLotePage() {
  // Services and cities
  const [services, setServices] = useState<Service[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [existingPages, setExistingPages] = useState<ExistingPage[]>([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Selected items for batch generation
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  
  // Quick add new service/city
  const [newServiceName, setNewServiceName] = useState("")
  const [newCityName, setNewCityName] = useState("")
  const [bulkCities, setBulkCities] = useState("")
  const [bulkServices, setBulkServices] = useState("")
  const [addingService, setAddingService] = useState(false)
  const [addingCity, setAddingCity] = useState(false)
  const [addingBulkCities, setAddingBulkCities] = useState(false)
  const [addingBulkServices, setAddingBulkServices] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, added: 0, skipped: 0 })
  const [bulkServicesProgress, setBulkServicesProgress] = useState({ current: 0, total: 0, added: 0, skipped: 0 })
  
  // Generated pages
  const [generatedPages, setGeneratedPages] = useState<GeneratedPage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(-1)
  
  // View mode
  const [viewMode, setViewMode] = useState<'selection' | 'results'>('selection')
  const [selectedPageIndex, setSelectedPageIndex] = useState(0)
  const [editingPage, setEditingPage] = useState<GeneratedPage | null>(null)
  
  // Publishing and saving
  const [publishing, setPublishing] = useState<string | null>(null)
  const [savingAll, setSavingAll] = useState(false)
  
  // AI Model selection
  const [aiModel, setAiModel] = useState<string>("openai/gpt-5-mini")

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
          setServices(data)
        }
        if (citiesRes.ok) {
          const data = await citiesRes.json()
          setCities(data)
        }
        if (pagesRes.ok) {
          const data = await pagesRes.json()
          setExistingPages(data)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  // Toggle service selection
  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // Toggle city selection
  const toggleCity = (id: string) => {
    setSelectedCities(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // Select all services
  const selectAllServices = () => {
    if (selectedServices.length === services.length) {
      setSelectedServices([])
    } else {
      setSelectedServices(services.map(s => s.id))
    }
  }

  // Select all cities
  const selectAllCities = () => {
    if (selectedCities.length === cities.length) {
      setSelectedCities([])
    } else {
      setSelectedCities(cities.map(c => c.id))
    }
  }
  
  // Check if a service+city combination already exists
  const combinationExists = (serviceId: string, cityId: string): boolean => {
    return existingPages.some(p => p.service_id === serviceId && p.city_id === cityId)
  }
  
  // Get number of existing combinations in current selection
  const getExistingCount = (): number => {
    let count = 0
    for (const serviceId of selectedServices) {
      for (const cityId of selectedCities) {
        if (combinationExists(serviceId, cityId)) {
          count++
        }
      }
    }
    return count
  }
  
  // Get new combinations count
  const getNewCombinationsCount = (): number => {
    const total = selectedServices.length * selectedCities.length
    return total - getExistingCount()
  }

  // Add new service quickly
  const handleAddService = async () => {
    if (!newServiceName.trim()) return
    setAddingService(true)
    try {
      const slug = newServiceName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      
      const res = await adminFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({ name: newServiceName.trim(), slug }),
      })
      
      if (res.ok) {
        const newService = await res.json()
        setServices(prev => [...prev, newService])
        setSelectedServices(prev => [...prev, newService.id])
        setNewServiceName("")
      }
    } catch (error) {
      console.error("Error adding service:", error)
    } finally {
      setAddingService(false)
    }
  }

  // Add multiple services at once (bulk)
  const handleAddBulkServices = async () => {
    if (!bulkServices.trim()) return
    
    const serviceNames = bulkServices
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    if (serviceNames.length === 0) return
    
    // Check for duplicates
    const existingSlugs = new Set(services.map(s => s.slug))
    const uniqueServiceNames = serviceNames.filter(name => {
      const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      return !existingSlugs.has(slug)
    })
    
    const skippedCount = serviceNames.length - uniqueServiceNames.length
    
    setAddingBulkServices(true)
    setBulkServicesProgress({ current: 0, total: uniqueServiceNames.length, added: 0, skipped: skippedCount })
    
    const newServices: Service[] = []
    
    for (let i = 0; i < uniqueServiceNames.length; i++) {
      const serviceName = uniqueServiceNames[i]
      setBulkServicesProgress(prev => ({ ...prev, current: i + 1 }))
      
      const slug = serviceName.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      
      try {
        const res = await adminFetch("/api/admin/services", {
          method: "POST",
          body: JSON.stringify({ name: serviceName.trim(), slug }),
        })
        
        if (res.ok) {
          const newService = await res.json()
          newServices.push(newService)
          existingSlugs.add(newService.slug)
          setBulkServicesProgress(prev => ({ ...prev, added: prev.added + 1 }))
        }
      } catch (error) {
        console.error("Error adding service:", serviceName, error)
      }
    }
    
    if (newServices.length > 0) {
      setServices(prev => [...prev, ...newServices])
      setSelectedServices(prev => [...prev, ...newServices.map(s => s.id)])
    }
    
    setBulkServices("")
    setAddingBulkServices(false)
    setBulkServicesProgress({ current: 0, total: 0, added: 0, skipped: 0 })
  }

  // Add new city with AI
  const handleAddCity = async () => {
    if (!newCityName.trim()) return
    setAddingCity(true)
    try {
      const res = await adminFetch("/api/admin/generate-city", {
        method: "POST",
        body: JSON.stringify({ cityName: newCityName.trim() }),
      })
      
      if (res.ok) {
        const { city } = await res.json()
        if (city) {
          setCities(prev => [...prev, city])
          setSelectedCities(prev => [...prev, city.id])
          setNewCityName("")
        }
      }
    } catch (error) {
      console.error("Error adding city:", error)
    } finally {
      setAddingCity(false)
    }
  }

  // Add multiple cities at once (bulk)
  const handleAddBulkCities = async () => {
    if (!bulkCities.trim()) return
    
    const cityNames = bulkCities
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    
    if (cityNames.length === 0) return
    
    // Check for duplicates against existing cities
    const existingSlugs = new Set(cities.map(c => c.slug))
    const uniqueCityNames = cityNames.filter(name => {
      const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      return !existingSlugs.has(slug)
    })
    
    const skippedCount = cityNames.length - uniqueCityNames.length
    
    setAddingBulkCities(true)
    setBulkProgress({ current: 0, total: uniqueCityNames.length, added: 0, skipped: skippedCount })
    
    const newCities: City[] = []
    
    for (let i = 0; i < uniqueCityNames.length; i++) {
      const cityName = uniqueCityNames[i]
      setBulkProgress(prev => ({ ...prev, current: i + 1 }))
      
      try {
        const res = await adminFetch("/api/admin/generate-city", {
          method: "POST",
          body: JSON.stringify({ cityName }),
        })
        
        if (res.ok) {
          const { city } = await res.json()
          if (city) {
            newCities.push(city)
            existingSlugs.add(city.slug)
            setBulkProgress(prev => ({ ...prev, added: prev.added + 1 }))
          }
        }
      } catch (error) {
        console.error("Error adding city:", cityName, error)
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    
    if (newCities.length > 0) {
      setCities(prev => [...prev, ...newCities])
      setSelectedCities(prev => [...prev, ...newCities.map(c => c.id)])
    }
    
    setBulkCities("")
    setAddingBulkCities(false)
    setBulkProgress({ current: 0, total: 0, added: 0, skipped: 0 })
  }

  // Generate all pages
  const handleGenerateAll = async () => {
    const selectedServiceObjs = services.filter(s => selectedServices.includes(s.id))
    const selectedCityObjs = cities.filter(c => selectedCities.includes(c.id))
    
    // Create page objects for all combinations, marking existing ones
    const pages: GeneratedPage[] = []
    for (const service of selectedServiceObjs) {
      for (const city of selectedCityObjs) {
        const exists = combinationExists(service.id, city.id)
        pages.push({
          id: `${service.id}-${city.id}`,
          service,
          city,
          status: exists ? 'exists' : 'pending',
          error: exists ? 'Esta combinacion ya existe' : undefined,
        })
      }
    }
    
    setGeneratedPages(pages)
    setViewMode('results')
    setIsGenerating(true)
    
    // Generate content for each page sequentially (skip existing ones)
    const pagesToGenerate = pages.filter(p => p.status !== 'exists')
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      
      // Skip existing pages
      if (page.status === 'exists') {
        continue
      }
      
      setCurrentGeneratingIndex(i)
      
      try {
        // Update status to generating
        setGeneratedPages(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'generating' } : p
        ))
        
        const res = await adminFetch("/api/admin/generate-page", {
          method: "POST",
          body: JSON.stringify({
            serviceName: page.service.name,
            cityName: page.city.name,
            cityProvince: page.city.province,
            model: aiModel,
          }),
        })
        
        if (res.ok) {
          const { content } = await res.json()
          
          // Helper functions
          const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
          const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
          
          // Process content
          const badges = content.badges ? shuffle(content.badges).slice(0, 3) : []
          const primaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'primary') || []
          const secondaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'secondary') || []
          const selectedPrimary = primaryCtas.length > 0 ? pickRandom(primaryCtas) : { text: 'Llamar', emoji: '📞' }
          const selectedSecondary = secondaryCtas.length > 0 ? pickRandom(secondaryCtas) : { text: 'WhatsApp', emoji: '💬' }
          
          const titles = [content.title, content.title_variant, content.title_variant_2].filter(Boolean)
          const h1s = [content.h1, content.h1_variant, content.h1_variant_2, content.h1_variant_3, content.h1_variant_4].filter(Boolean)
          const metas = [content.meta_description, content.meta_description_variant].filter(Boolean)
          const intros = [content.intro_text, content.intro_text_variant].filter(Boolean)
          const highlights = [content.highlight, content.highlight_variant, content.highlight_variant_2, content.highlight_variant_3].filter(Boolean)
          const finalCtas = content.final_ctas || []
          const urgencyMsgs = content.urgency_messages || []
          
          let slug = `${page.service.slug}-${page.city.slug}`
          if (content.is_neighborhood && content.parent_city_slug) {
            slug = `${page.service.slug}-${content.parent_city_slug}-${page.city.slug}`
          }
          
          // Pick random final CTA
          const selectedFinalCta = finalCtas.length > 0 ? pickRandom(finalCtas) : null
          
          const pageData = {
            slug,
            title: titles.length > 0 ? pickRandom(titles) : '',
            meta_description: metas.length > 0 ? pickRandom(metas) : '',
            h1: h1s.length > 0 ? pickRandom(h1s) : '',
            intro_text: intros.length > 0 ? pickRandom(intros) : '',
            cta_button_text: `${selectedPrimary.emoji} ${selectedPrimary.text}`,
            cta_secondary_text: `${selectedSecondary.emoji} ${selectedSecondary.text}`,
            cta_badge_1: badges[0] ? `${badges[0].emoji} ${badges[0].text}` : '',
            cta_badge_2: badges[1] ? `${badges[1].emoji} ${badges[1].text}` : '',
            cta_badge_3: badges[2] ? `${badges[2].emoji} ${badges[2].text}` : '',
            latitude: page.city.latitude?.toString() || '',
            longitude: page.city.longitude?.toString() || '',
            show_map: true,
            faqs: content.faqs || [],
            reviews: content.reviews?.map((r: Review & { service_type?: string; has_emoji?: boolean }) => ({
              ...r,
              verified: true,
              location: r.location || page.city.name,
            })) || [],
            is_neighborhood: content.is_neighborhood,
            parent_city_slug: content.parent_city_slug,
            // Extra variation fields
            highlight: highlights.length > 0 ? pickRandom(highlights) : '',
            final_cta_title: selectedFinalCta?.title || '',
            final_cta_subtitle: selectedFinalCta?.subtitle || '',
            urgency_message: urgencyMsgs.length > 0 ? pickRandom(urgencyMsgs) : '',
            extra_section_type: content.extra_section?.type || 'ninguno',
            extra_section_content: content.extra_section?.content || '',
            content_tone: content.content_tone || 'profesional',
            local_facts: content.local_facts || {},
          }
          
          // Auto-save as draft immediately after generation
          const updatedPage = { ...page, status: 'saving' as const, data: pageData }
          setGeneratedPages(prev => prev.map((p, idx) => 
            idx === i ? updatedPage : p
          ))
          
          // Save to database as draft
          try {
            const saveRes = await adminFetch("/api/admin/pages", {
              method: "POST",
              body: JSON.stringify({
                slug: pageData.slug,
                service_id: page.service.id,
                city_id: page.city.id,
                title: pageData.title,
                meta_description: pageData.meta_description,
                h1: pageData.h1,
                intro_text: pageData.intro_text,
                status: "draft",
                latitude: pageData.latitude,
                longitude: pageData.longitude,
                show_map: pageData.show_map,
                cta_button_text: pageData.cta_button_text,
                cta_secondary_text: pageData.cta_secondary_text,
                cta_badge_1: pageData.cta_badge_1,
                cta_badge_2: pageData.cta_badge_2,
                cta_badge_3: pageData.cta_badge_3,
                faqs: pageData.faqs,
                reviews: pageData.reviews,
                highlight: pageData.highlight,
                final_cta_title: pageData.final_cta_title,
                final_cta_subtitle: pageData.final_cta_subtitle,
                urgency_message: pageData.urgency_message,
                local_facts: pageData.local_facts,
                extra_section_type: pageData.extra_section_type,
                extra_section_content: pageData.extra_section_content,
                content_tone: pageData.content_tone,
              }),
            })
            
            if (saveRes.ok) {
              setGeneratedPages(prev => prev.map((p, idx) => 
                idx === i ? { ...p, status: 'saved', data: pageData } : p
              ))
              setExistingPages(prev => [...prev, { 
                id: page.id, 
                service_id: page.service.id, 
                city_id: page.city.id, 
                slug: pageData.slug 
              }])
            } else {
              setGeneratedPages(prev => prev.map((p, idx) => 
                idx === i ? { ...p, status: 'ready', data: pageData } : p
              ))
            }
          } catch {
            setGeneratedPages(prev => prev.map((p, idx) => 
              idx === i ? { ...p, status: 'ready', data: pageData } : p
            ))
          }
        } else {
          const error = await res.json()
          setGeneratedPages(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: error.error || 'Error generando' } : p
          ))
        }
      } catch (error) {
        setGeneratedPages(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error', error: 'Error de conexion' } : p
        ))
      }
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setIsGenerating(false)
    setCurrentGeneratingIndex(-1)
  }

  // Publish a single page
  // Save page (as draft or published)
  const handleSavePage = async (page: GeneratedPage, publish: boolean = false) => {
    if (!page.data) return
    
    setPublishing(page.id)
    try {
      const res = await adminFetch("/api/admin/pages", {
        method: "POST",
        body: JSON.stringify({
          slug: page.data.slug,
          service_id: page.service.id,
          city_id: page.city.id,
          title: page.data.title,
          meta_description: page.data.meta_description,
          h1: page.data.h1,
          intro_text: page.data.intro_text,
          status: publish ? "published" : "draft",
          latitude: page.data.latitude,
          longitude: page.data.longitude,
          show_map: page.data.show_map,
          cta_button_text: page.data.cta_button_text,
          cta_secondary_text: page.data.cta_secondary_text,
          cta_badge_1: page.data.cta_badge_1,
          cta_badge_2: page.data.cta_badge_2,
          cta_badge_3: page.data.cta_badge_3,
          faqs: page.data.faqs,
          reviews: page.data.reviews,
          // Extra fields
          highlight: page.data.highlight,
          final_cta_title: page.data.final_cta_title,
          final_cta_subtitle: page.data.final_cta_subtitle,
          urgency_message: page.data.urgency_message,
          local_facts: page.data.local_facts,
          extra_section_type: page.data.extra_section_type,
          extra_section_content: page.data.extra_section_content,
          content_tone: page.data.content_tone,
        }),
      })
      
      if (res.ok) {
        setGeneratedPages(prev => prev.map(p => 
          p.id === page.id ? { ...p, status: publish ? 'published' : 'saved' } : p
        ))
        // Add to existing pages to prevent duplicates
        setExistingPages(prev => [...prev, { 
          id: page.id, 
          service_id: page.service.id, 
          city_id: page.city.id, 
          slug: page.data!.slug 
        }])
      } else {
        const error = await res.json()
        alert(`Error ${publish ? 'publicando' : 'guardando'}: ` + (error.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert(`Error de conexion al ${publish ? 'publicar' : 'guardar'}`)
    } finally {
      setPublishing(null)
    }
  }

  // Save all ready pages (as draft)
  const handleSaveAllDraft = async () => {
    const readyPages = generatedPages.filter(p => p.status === 'ready' && p.data)
    if (readyPages.length === 0) return
    
    setSavingAll(true)
    for (const page of readyPages) {
      await handleSavePage(page, false)
    }
    setSavingAll(false)
  }

  // Publish all ready pages
  const handlePublishAll = async () => {
    const readyPages = generatedPages.filter(p => p.status === 'ready' && p.data)
    if (readyPages.length === 0) return
    
    setSavingAll(true)
    for (const page of readyPages) {
      await handleSavePage(page, true)
    }
    setSavingAll(false)
  }

  // Regenerate a single page
  const handleRegeneratePage = async (pageIndex: number) => {
    const page = generatedPages[pageIndex]
    if (!page) return
    
    setGeneratedPages(prev => prev.map((p, idx) => 
      idx === pageIndex ? { ...p, status: 'generating' } : p
    ))
    
    try {
      const res = await adminFetch("/api/admin/generate-page", {
        method: "POST",
        body: JSON.stringify({
          serviceName: page.service.name,
          cityName: page.city.name,
          cityProvince: page.city.province,
        }),
      })
      
      if (res.ok) {
        const { content } = await res.json()
        
        const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
        const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
        
        const badges = content.badges ? shuffle(content.badges).slice(0, 3) : []
        const primaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'primary') || []
        const secondaryCtas = content.cta_buttons?.filter((c: { type: string }) => c.type === 'secondary') || []
        const selectedPrimary = primaryCtas.length > 0 ? pickRandom(primaryCtas) : { text: 'Llamar', emoji: '📞' }
        const selectedSecondary = secondaryCtas.length > 0 ? pickRandom(secondaryCtas) : { text: 'WhatsApp', emoji: '💬' }
        
        const titles = [content.title, content.title_variant, content.title_variant_2].filter(Boolean)
        const h1s = [content.h1, content.h1_variant, content.h1_variant_2, content.h1_variant_3, content.h1_variant_4].filter(Boolean)
        const metas = [content.meta_description, content.meta_description_variant].filter(Boolean)
        const intros = [content.intro_text, content.intro_text_variant].filter(Boolean)
        const highlights = [content.highlight, content.highlight_variant, content.highlight_variant_2, content.highlight_variant_3].filter(Boolean)
        const finalCtas = content.final_ctas || []
        const urgencyMsgs = content.urgency_messages || []
        
        let slug = `${page.service.slug}-${page.city.slug}`
        if (content.is_neighborhood && content.parent_city_slug) {
          slug = `${page.service.slug}-${content.parent_city_slug}-${page.city.slug}`
        }
        
        const selectedFinalCta = finalCtas.length > 0 ? pickRandom(finalCtas) : null
        
        const pageData = {
          slug,
          title: titles.length > 0 ? pickRandom(titles) : '',
          meta_description: metas.length > 0 ? pickRandom(metas) : '',
          h1: h1s.length > 0 ? pickRandom(h1s) : '',
          intro_text: intros.length > 0 ? pickRandom(intros) : '',
          cta_button_text: `${selectedPrimary.emoji} ${selectedPrimary.text}`,
          cta_secondary_text: `${selectedSecondary.emoji} ${selectedSecondary.text}`,
          cta_badge_1: badges[0] ? `${badges[0].emoji} ${badges[0].text}` : '',
          cta_badge_2: badges[1] ? `${badges[1].emoji} ${badges[1].text}` : '',
          cta_badge_3: badges[2] ? `${badges[2].emoji} ${badges[2].text}` : '',
          latitude: page.city.latitude?.toString() || '',
          longitude: page.city.longitude?.toString() || '',
          show_map: true,
          faqs: content.faqs || [],
          reviews: content.reviews?.map((r: Review & { service_type?: string; has_emoji?: boolean }) => ({
            ...r,
            verified: true,
            location: r.location || page.city.name,
          })) || [],
          is_neighborhood: content.is_neighborhood,
          parent_city_slug: content.parent_city_slug,
          highlight: highlights.length > 0 ? pickRandom(highlights) : '',
          final_cta_title: selectedFinalCta?.title || '',
          final_cta_subtitle: selectedFinalCta?.subtitle || '',
          urgency_message: urgencyMsgs.length > 0 ? pickRandom(urgencyMsgs) : '',
          extra_section_type: content.extra_section?.type || 'ninguno',
          extra_section_content: content.extra_section?.content || '',
          content_tone: content.content_tone || 'profesional',
          local_facts: content.local_facts || {},
        }
        
        setGeneratedPages(prev => prev.map((p, idx) => 
          idx === pageIndex ? { ...p, status: 'ready', data: pageData } : p
        ))
      }
    } catch (error) {
      console.error("Error regenerating:", error)
    }
  }

  // Remove a page from the list
  const handleRemovePage = (pageId: string) => {
    setGeneratedPages(prev => prev.filter(p => p.id !== pageId))
    if (selectedPageIndex >= generatedPages.length - 1) {
      setSelectedPageIndex(Math.max(0, generatedPages.length - 2))
    }
  }

  // Save edits to a page
  const handleSaveEdit = (updatedData: GeneratedPage['data']) => {
    if (!editingPage || !updatedData) return
    
    setGeneratedPages(prev => prev.map(p => 
      p.id === editingPage.id ? { ...p, data: updatedData } : p
    ))
    setEditingPage(null)
  }

  const totalCombinations = selectedServices.length * selectedCities.length
  const readyPages = generatedPages.filter(p => p.status === 'ready')
  const savedPages = generatedPages.filter(p => p.status === 'saved')
  const publishedPages = generatedPages.filter(p => p.status === 'published')
  const errorPages = generatedPages.filter(p => p.status === 'error')

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-4 px-4">
          <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Generacion en Lote</h1>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'selection' 
                ? `${totalCombinations} paginas se generaran`
                : `${readyPages.length} listas, ${savedPages.length} guardadas, ${publishedPages.length} publicadas, ${errorPages.length} errores`
              }
            </p>
          </div>
          
          {viewMode === 'selection' ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="ai-model" className="text-sm text-muted-foreground whitespace-nowrap">Modelo IA:</Label>
                <select
                  id="ai-model"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                >
<option value="anthropic/claude-opus-4">Claude Opus 4 (Premium)</option>
                <option value="openai/gpt-5-mini">GPT-5 Mini (Recomendado)</option>
                <option value="google/gemini-3-flash">Gemini 3 Flash (Rapido y Economico)</option>
                </select>
              </div>
              <Button 
                onClick={handleGenerateAll} 
                disabled={getNewCombinationsCount() === 0}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generar {getNewCombinationsCount()} Paginas Nuevas
                {getExistingCount() > 0 && (
                  <span className="text-xs opacity-70">({getExistingCount()} omitidas)</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setViewMode('selection')}
                disabled={savingAll}
              >
                Volver a Seleccion
              </Button>
              <Button 
                variant="outline"
                onClick={handleSaveAllDraft}
                disabled={readyPages.length === 0 || isGenerating || savingAll}
                className="gap-2"
              >
                {savingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar Borradores ({readyPages.length})
              </Button>
              <Button 
                onClick={handlePublishAll}
                disabled={readyPages.length === 0 || isGenerating || savingAll}
                className="gap-2"
              >
                {savingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Publicar Todas ({readyPages.length})
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container px-4 py-6">
        {viewMode === 'selection' ? (
          /* Selection View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Services Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Servicios</CardTitle>
                    <CardDescription>
                      {selectedServices.length} de {services.length} seleccionados
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllServices}>
                    {selectedServices.length === services.length ? 'Deseleccionar' : 'Seleccionar'} Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Single service add */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Nuevo servicio..."
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                  />
                  <Button onClick={handleAddService} disabled={addingService || !newServiceName.trim()}>
                    {addingService ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                  </Button>
                </div>
                
                {/* Bulk services add */}
                <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                  <Label className="text-sm font-medium mb-2 block">Importar varios servicios (uno por linea)</Label>
                  <Textarea
                    placeholder="Pega aqui una lista de servicios:&#10;Cerrajero&#10;Electricista&#10;Fontanero&#10;..."
                    value={bulkServices}
                    onChange={(e) => setBulkServices(e.target.value)}
                    className="h-20 mb-2 text-sm"
                    disabled={addingBulkServices}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {bulkServices.split('\n').filter(l => l.trim()).length} servicios detectados
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleAddBulkServices} 
                      disabled={addingBulkServices || !bulkServices.trim()}
                    >
                      {addingBulkServices ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {bulkServicesProgress.current}/{bulkServicesProgress.total}
                        </>
                      ) : (
                        'Importar todos'
                      )}
                    </Button>
                  </div>
                  {bulkServicesProgress.skipped > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {bulkServicesProgress.skipped} servicios omitidos (ya existen)
                    </p>
                  )}
                </div>
                
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {services.map(service => (
                      <label 
                        key={service.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <Checkbox 
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => toggleService(service.id)}
                        />
                        <span className="flex-1">{service.name}</span>
                        <Badge variant="outline" className="text-xs">{service.slug}</Badge>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Cities Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ciudades</CardTitle>
                    <CardDescription>
                      {selectedCities.length} de {cities.length} seleccionadas
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={selectAllCities}>
                    {selectedCities.length === cities.length ? 'Deseleccionar' : 'Seleccionar'} Todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Single city add */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Nueva ciudad (se genera con IA)..."
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCity()}
                  />
                  <Button onClick={handleAddCity} disabled={addingCity || !newCityName.trim()}>
                    {addingCity ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                  </Button>
                </div>
                
                {/* Bulk cities add */}
                <div className="mb-4 p-3 border rounded-lg bg-muted/30">
                  <Label className="text-sm font-medium mb-2 block">Importar varias ciudades (una por linea)</Label>
                  <Textarea
                    placeholder="Pega aqui una lista de ciudades, una por linea:&#10;Madrid&#10;Barcelona&#10;Valencia&#10;..."
                    value={bulkCities}
                    onChange={(e) => setBulkCities(e.target.value)}
                    className="h-24 mb-2 text-sm"
                    disabled={addingBulkCities}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {bulkCities.split('\n').filter(l => l.trim()).length} ciudades detectadas
                    </span>
                    <Button 
                      size="sm" 
                      onClick={handleAddBulkCities} 
                      disabled={addingBulkCities || !bulkCities.trim()}
                    >
                      {addingBulkCities ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          {bulkProgress.current}/{bulkProgress.total}
                          {bulkProgress.added > 0 && ` (${bulkProgress.added} agregadas)`}
                        </>
                      ) : (
                        'Importar todas'
                      )}
                    </Button>
                  </div>
                  {bulkProgress.skipped > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      {bulkProgress.skipped} ciudades omitidas (ya existen)
                    </p>
                  )}
                </div>
                
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {cities.map(city => (
                      <label 
                        key={city.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <Checkbox 
                          checked={selectedCities.includes(city.id)}
                          onCheckedChange={() => toggleCity(city.id)}
                        />
                        <span className="flex-1">
                          {city.name}
                          {city.province && <span className="text-muted-foreground text-sm ml-1">({city.province})</span>}
                        </span>
                        <Badge variant="outline" className="text-xs">{city.slug}</Badge>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Preview of combinations */}
            {totalCombinations > 0 && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Vista Previa: {totalCombinations} Combinaciones
                    {getExistingCount() > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {getExistingCount()} ya existen
                      </Badge>
                    )}
                    {getNewCombinationsCount() > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        {getNewCombinationsCount()} nuevas
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {getExistingCount() > 0 
                      ? `Se generaran ${getNewCombinationsCount()} paginas nuevas. ${getExistingCount()} combinaciones ya existen y se omitiran.`
                      : 'Se generaran las siguientes combinaciones de servicio + ciudad'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {services
                      .filter(s => selectedServices.includes(s.id))
                      .flatMap(service => 
                        cities
                          .filter(c => selectedCities.includes(c.id))
                          .map(city => {
                            const exists = combinationExists(service.id, city.id)
                            return (
                              <Badge 
                                key={`${service.id}-${city.id}`} 
                                variant={exists ? "destructive" : "secondary"}
                                className={exists ? "opacity-60 line-through" : ""}
                              >
                                {service.name} - {city.name}
                                {exists && " (existe)"}
                              </Badge>
                            )
                          })
                      )
                    }
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pages List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Paginas Generadas</CardTitle>
                <CardDescription>
                  {isGenerating && `Generando ${currentGeneratingIndex + 1} de ${generatedPages.length}...`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {generatedPages.map((page, index) => (
                      <div 
                        key={page.id}
                        className={`p-3 cursor-pointer hover:bg-muted transition-colors ${
                          selectedPageIndex === index ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedPageIndex(index)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {page.service.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {page.city.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {page.status === 'pending' && (
                              <Badge variant="outline" className="text-xs">Pendiente</Badge>
                            )}
{page.status === 'generating' && (
  <Badge className="text-xs bg-yellow-500">
  <Loader2 className="h-3 w-3 animate-spin mr-1" />
  Generando
  </Badge>
  )}
  {page.status === 'saving' && (
  <Badge className="text-xs bg-blue-500">
  <Loader2 className="h-3 w-3 animate-spin mr-1" />
  Guardando
  </Badge>
  )}
                            {page.status === 'ready' && (
                              <Badge className="text-xs bg-green-500">Lista</Badge>
                            )}
                            {page.status === 'saved' && (
                              <Badge className="text-xs bg-purple-500">Guardada</Badge>
                            )}
                            {page.status === 'published' && (
                              <Badge className="text-xs bg-blue-500">Publicada</Badge>
                            )}
                            {page.status === 'error' && (
                              <Badge variant="destructive" className="text-xs">Error</Badge>
                            )}
                            {page.status === 'exists' && (
                              <Badge variant="outline" className="text-xs text-emerald-600 border-orange-500">Ya existe</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Page Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {generatedPages[selectedPageIndex]?.service.name} - {generatedPages[selectedPageIndex]?.city.name}
                    </CardTitle>
                    <CardDescription>
                      {generatedPages[selectedPageIndex]?.data?.slug || 'Sin slug'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedPageIndex(prev => Math.max(0, prev - 1))}
                      disabled={selectedPageIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedPageIndex + 1} / {generatedPages.length}
                    </span>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setSelectedPageIndex(prev => Math.min(generatedPages.length - 1, prev + 1))}
                      disabled={selectedPageIndex === generatedPages.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
{(generatedPages[selectedPageIndex]?.status === 'generating' || generatedPages[selectedPageIndex]?.status === 'saving') && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
  <p className="text-muted-foreground">
  {generatedPages[selectedPageIndex]?.status === 'generating' ? 'Generando contenido con IA...' : 'Guardando como borrador...'}
  </p>
  </div>
  )}
                
                {generatedPages[selectedPageIndex]?.status === 'pending' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground">Esperando en cola...</p>
                  </div>
                )}
                
                {generatedPages[selectedPageIndex]?.status === 'error' && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <X className="h-8 w-8 text-destructive mb-4" />
                    <p className="text-destructive">{generatedPages[selectedPageIndex]?.error}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => handleRegeneratePage(selectedPageIndex)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                )}
                
                {(generatedPages[selectedPageIndex]?.status === 'ready' || generatedPages[selectedPageIndex]?.status === 'published') && generatedPages[selectedPageIndex]?.data && (
                  <Tabs defaultValue="preview">
                    <TabsList className="mb-4 flex-wrap">
                      <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                      <TabsTrigger value="seo">SEO</TabsTrigger>
                      <TabsTrigger value="local">Datos Locales</TabsTrigger>
                      <TabsTrigger value="faqs">FAQs ({generatedPages[selectedPageIndex]?.data?.faqs?.length || 0})</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews ({generatedPages[selectedPageIndex]?.data?.reviews?.length || 0})</TabsTrigger>
                    </TabsList>
                    
<TabsContent value="preview" className="space-y-4">
                      {/* H1 and Highlight */}
                      <div>
                        <Label className="text-xs text-muted-foreground">H1</Label>
                        <p className="font-bold text-xl">{generatedPages[selectedPageIndex]?.data?.h1}</p>
                      </div>
                      {generatedPages[selectedPageIndex]?.data?.highlight && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Highlight</Label>
                          <p className="text-emerald-700 font-medium">{generatedPages[selectedPageIndex]?.data?.highlight}</p>
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge>{generatedPages[selectedPageIndex]?.data?.cta_badge_1}</Badge>
                        <Badge>{generatedPages[selectedPageIndex]?.data?.cta_badge_2}</Badge>
                        <Badge>{generatedPages[selectedPageIndex]?.data?.cta_badge_3}</Badge>
                      </div>
                      
                      {/* CTAs */}
                      <div className="flex gap-2">
                        <Button size="sm">{generatedPages[selectedPageIndex]?.data?.cta_button_text}</Button>
                        <Button size="sm" variant="outline">{generatedPages[selectedPageIndex]?.data?.cta_secondary_text}</Button>
                      </div>
                      
                      {/* Urgency */}
                      {generatedPages[selectedPageIndex]?.data?.urgency_message && (
                        <p className="text-sm text-green-600 font-medium">
                          {generatedPages[selectedPageIndex]?.data?.urgency_message}
                        </p>
                      )}
                      
                      {/* Main Content */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Contenido Principal ({generatedPages[selectedPageIndex]?.data?.intro_text?.length || 0} chars)</Label>
                        <div 
                          className="prose prose-sm max-w-none mt-1 p-4 bg-muted/50 rounded-lg overflow-auto max-h-[400px]"
                          dangerouslySetInnerHTML={{ __html: generatedPages[selectedPageIndex]?.data?.intro_text || '' }}
                        />
                      </div>
                      
                      {/* Final CTA */}
                      {generatedPages[selectedPageIndex]?.data?.final_cta_title && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-orange-200">
                          <p className="font-bold text-lg">{generatedPages[selectedPageIndex]?.data?.final_cta_title}</p>
                          <p className="text-sm text-muted-foreground">{generatedPages[selectedPageIndex]?.data?.final_cta_subtitle}</p>
                        </div>
                      )}
                      
                      {/* Map info */}
                      {generatedPages[selectedPageIndex]?.data?.show_map && generatedPages[selectedPageIndex]?.data?.latitude && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Label className="text-xs text-blue-600">Mapa</Label>
                          <p className="text-sm">Lat: {generatedPages[selectedPageIndex]?.data?.latitude}, Lng: {generatedPages[selectedPageIndex]?.data?.longitude}</p>
                        </div>
                      )}
                      
                      {/* Content Tone */}
                      {generatedPages[selectedPageIndex]?.data?.content_tone && (
                        <Badge variant="outline" className="text-xs">
                          Tono: {generatedPages[selectedPageIndex]?.data?.content_tone}
                        </Badge>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="seo" className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Title Tag</Label>
                        <p className="font-medium">{generatedPages[selectedPageIndex]?.data?.title}</p>
                        <p className="text-xs text-muted-foreground">{generatedPages[selectedPageIndex]?.data?.title?.length || 0} caracteres</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Meta Description</Label>
                        <p className="text-sm">{generatedPages[selectedPageIndex]?.data?.meta_description}</p>
                        <p className="text-xs text-muted-foreground">{generatedPages[selectedPageIndex]?.data?.meta_description?.length || 0} caracteres</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Slug</Label>
                        <p className="font-mono text-sm">/{generatedPages[selectedPageIndex]?.data?.slug}</p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="local" className="space-y-4">
                      {generatedPages[selectedPageIndex]?.data?.local_facts && (
                        <>
                          {generatedPages[selectedPageIndex]?.data?.local_facts?.population_approx && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Poblacion</Label>
                              <p className="text-sm">{generatedPages[selectedPageIndex]?.data?.local_facts?.population_approx}</p>
                            </div>
                          )}
                          {generatedPages[selectedPageIndex]?.data?.local_facts?.famous_for && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Conocida por</Label>
                              <p className="text-sm">{generatedPages[selectedPageIndex]?.data?.local_facts?.famous_for}</p>
                            </div>
                          )}
                          {generatedPages[selectedPageIndex]?.data?.local_facts?.local_landmark && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Lugar emblematico</Label>
                              <p className="text-sm">{generatedPages[selectedPageIndex]?.data?.local_facts?.local_landmark}</p>
                            </div>
                          )}
                          {generatedPages[selectedPageIndex]?.data?.local_facts?.interesting_fact && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Dato curioso</Label>
                              <p className="text-sm">{generatedPages[selectedPageIndex]?.data?.local_facts?.interesting_fact}</p>
                            </div>
                          )}
                        </>
                      )}
                      {generatedPages[selectedPageIndex]?.data?.extra_section_type && generatedPages[selectedPageIndex]?.data?.extra_section_type !== 'ninguno' && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Seccion extra: {generatedPages[selectedPageIndex]?.data?.extra_section_type}</Label>
                          <div 
                            className="prose prose-sm max-w-none mt-1 p-3 bg-muted/50 rounded-lg"
                            dangerouslySetInnerHTML={{ __html: generatedPages[selectedPageIndex]?.data?.extra_section_content || '' }}
                          />
                        </div>
                      )}
                      {(!generatedPages[selectedPageIndex]?.data?.local_facts?.population_approx && 
                        !generatedPages[selectedPageIndex]?.data?.local_facts?.famous_for) && (
                        <p className="text-muted-foreground text-sm">No hay datos locales disponibles</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="faqs" className="space-y-4">
                      {generatedPages[selectedPageIndex]?.data?.faqs?.map((faq, i) => (
                        <div key={i} className="border-b pb-3">
                          <p className="font-medium text-sm">{faq.question}</p>
                          <div 
                            className="text-sm text-muted-foreground mt-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="space-y-4">
                      {generatedPages[selectedPageIndex]?.data?.reviews?.map((review, i) => (
                        <div key={i} className="border-b pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{review.name}</span>
                            <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                          </div>
                          <p className="text-sm mt-1">{review.text}</p>
                          <p className="text-xs text-muted-foreground">{review.location} - {review.date}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                )}
                
                {/* Action Buttons */}
                {generatedPages[selectedPageIndex]?.status === 'ready' && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
                    <Button 
                      variant="outline"
                      onClick={() => handleSavePage(generatedPages[selectedPageIndex], false)}
                      disabled={publishing === generatedPages[selectedPageIndex]?.id}
                    >
                      {publishing === generatedPages[selectedPageIndex]?.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Guardar Borrador
                    </Button>
                    <Button 
                      onClick={() => handleSavePage(generatedPages[selectedPageIndex], true)}
                      disabled={publishing === generatedPages[selectedPageIndex]?.id}
                      className="flex-1"
                    >
                      {publishing === generatedPages[selectedPageIndex]?.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Publicar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setEditingPage(generatedPages[selectedPageIndex])}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleRegeneratePage(selectedPageIndex)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerar
                    </Button>
                    <Button 
                      variant="ghost"
                      onClick={() => handleRemovePage(generatedPages[selectedPageIndex]?.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {(generatedPages[selectedPageIndex]?.status === 'published' || generatedPages[selectedPageIndex]?.status === 'saved') && (
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className={`font-medium ${generatedPages[selectedPageIndex]?.status === 'published' ? 'text-green-600' : 'text-purple-600'}`}>
                      {generatedPages[selectedPageIndex]?.status === 'published' ? 'Pagina publicada' : 'Pagina guardada como borrador'}
                    </span>
                    {generatedPages[selectedPageIndex]?.status === 'published' && (
                      <a 
                        href={`/${generatedPages[selectedPageIndex]?.data?.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto"
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Pagina
                        </Button>
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Pagina</DialogTitle>
            <DialogDescription>
              {editingPage?.service.name} - {editingPage?.city.name}
            </DialogDescription>
          </DialogHeader>
          
          {editingPage?.data && (
            <Tabs defaultValue="basico" className="py-4">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="basico">Basico</TabsTrigger>
                <TabsTrigger value="contenido">Contenido</TabsTrigger>
                <TabsTrigger value="ctas">CTAs y Badges</TabsTrigger>
                <TabsTrigger value="local">Datos Locales</TabsTrigger>
                <TabsTrigger value="faqs">FAQs ({editingPage.data.faqs?.length || 0})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({editingPage.data.reviews?.length || 0})</TabsTrigger>
                <TabsTrigger value="extra">Extra</TabsTrigger>
              </TabsList>

              {/* Tab Basico */}
              <TabsContent value="basico" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title (SEO)</Label>
                    <Input 
                      value={editingPage.data.title}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, title: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label>H1</Label>
                    <Input 
                      value={editingPage.data.h1}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, h1: e.target.value }
                      } : null)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Meta Description</Label>
                  <Input 
                    value={editingPage.data.meta_description}
                    onChange={(e) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, meta_description: e.target.value }
                    } : null)}
                  />
                </div>

                <div>
                  <Label>Highlight (texto destacado)</Label>
                  <Input 
                    value={editingPage.data.highlight || ''}
                    onChange={(e) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, highlight: e.target.value }
                    } : null)}
                    placeholder="ej: Servicio 24h disponible"
                  />
                </div>

                <div>
                  <Label>Mensaje de Urgencia</Label>
                  <Input 
                    value={editingPage.data.urgency_message || ''}
                    onChange={(e) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, urgency_message: e.target.value }
                    } : null)}
                    placeholder="ej: Solo quedan 3 huecos hoy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latitud</Label>
                    <Input 
                      value={editingPage.data.latitude || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, latitude: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label>Longitud</Label>
                    <Input 
                      value={editingPage.data.longitude || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, longitude: e.target.value }
                      } : null)}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Contenido */}
              <TabsContent value="contenido" className="space-y-4">
                <div>
                  <Label>Contenido Principal</Label>
                  <RichTextEditor
                    content={editingPage.data.intro_text}
                    onChange={(value) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, intro_text: value }
                    } : null)}
                  />
                </div>
              </TabsContent>

              {/* Tab CTAs y Badges */}
              <TabsContent value="ctas" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Badge 1</Label>
                    <Input 
                      value={editingPage.data.cta_badge_1}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, cta_badge_1: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label>Badge 2</Label>
                    <Input 
                      value={editingPage.data.cta_badge_2}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, cta_badge_2: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label>Badge 3</Label>
                    <Input 
                      value={editingPage.data.cta_badge_3}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, cta_badge_3: e.target.value }
                      } : null)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Principal</Label>
                    <Input 
                      value={editingPage.data.cta_button_text}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, cta_button_text: e.target.value }
                      } : null)}
                    />
                  </div>
                  <div>
                    <Label>CTA Secundario</Label>
                    <Input 
                      value={editingPage.data.cta_secondary_text}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, cta_secondary_text: e.target.value }
                      } : null)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-3">CTA Final de Pagina</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Titulo CTA Final</Label>
                      <Input 
                        value={editingPage.data.final_cta_title || ''}
                        onChange={(e) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { ...prev.data!, final_cta_title: e.target.value }
                        } : null)}
                        placeholder="ej: No esperes mas, contactanos ahora"
                      />
                    </div>
                    <div>
                      <Label>Subtitulo CTA Final</Label>
                      <Input 
                        value={editingPage.data.final_cta_subtitle || ''}
                        onChange={(e) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { ...prev.data!, final_cta_subtitle: e.target.value }
                        } : null)}
                        placeholder="ej: Presupuesto sin compromiso en menos de 24h"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab Datos Locales */}
              <TabsContent value="local" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Poblacion aprox.</Label>
                    <Input 
                      value={editingPage.data.local_facts?.population_approx || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          local_facts: { ...prev.data!.local_facts, population_approx: e.target.value }
                        }
                      } : null)}
                      placeholder="ej: 45.000 habitantes"
                    />
                  </div>
                  <div>
                    <Label>Conocida por</Label>
                    <Input 
                      value={editingPage.data.local_facts?.famous_for || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          local_facts: { ...prev.data!.local_facts, famous_for: e.target.value }
                        }
                      } : null)}
                      placeholder="ej: Su arquitectura modernista"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lugar emblematico</Label>
                    <Input 
                      value={editingPage.data.local_facts?.local_landmark || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          local_facts: { ...prev.data!.local_facts, local_landmark: e.target.value }
                        }
                      } : null)}
                      placeholder="ej: Plaza Mayor"
                    />
                  </div>
                  <div>
                    <Label>Dato curioso</Label>
                    <Input 
                      value={editingPage.data.local_facts?.interesting_fact || ''}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          local_facts: { ...prev.data!.local_facts, interesting_fact: e.target.value }
                        }
                      } : null)}
                      placeholder="ej: Fundada en el siglo XII"
                    />
                  </div>
                </div>

                <div>
                  <Label>Problema local comun</Label>
                  <Input 
                    value={editingPage.data.local_facts?.local_problem || ''}
                    onChange={(e) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { 
                        ...prev.data!, 
                        local_facts: { ...prev.data!.local_facts, local_problem: e.target.value }
                      }
                    } : null)}
                    placeholder="ej: Tuberias antiguas que requieren mantenimiento frecuente"
                  />
                </div>

                <div>
                  <Label>Zonas cercanas (separadas por coma)</Label>
                  <Input 
                    value={editingPage.data.local_facts?.nearby_areas?.join(', ') || ''}
                    onChange={(e) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { 
                        ...prev.data!, 
                        local_facts: { 
                          ...prev.data!.local_facts, 
                          nearby_areas: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      }
                    } : null)}
                    placeholder="ej: Centro, La Marina, El Raval"
                  />
                </div>
              </TabsContent>

              {/* Tab Extra */}
              <TabsContent value="extra" className="space-y-4">
                <div>
                  <Label>Tipo de Seccion Extra</Label>
                  <Select 
                    value={editingPage.data.extra_section_type || 'ninguno'}
                    onValueChange={(v) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, extra_section_type: v }
                    } : null)}
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

                {editingPage.data.extra_section_type && editingPage.data.extra_section_type !== 'ninguno' && (
                  <div>
                    <Label>Contenido Seccion Extra</Label>
                    <RichTextEditor
                      content={editingPage.data.extra_section_content || ''}
                      onChange={(value) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { ...prev.data!, extra_section_content: value }
                      } : null)}
                    />
                  </div>
                )}

                <div>
                  <Label>Tono del Contenido</Label>
                  <Select 
                    value={editingPage.data.content_tone || 'profesional'}
                    onValueChange={(v) => setEditingPage(prev => prev ? {
                      ...prev,
                      data: { ...prev.data!, content_tone: v }
                    } : null)}
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
              </TabsContent>

              {/* Tab FAQs */}
              <TabsContent value="faqs" className="space-y-4 max-h-[400px] overflow-auto">
                {editingPage.data.faqs?.map((faq, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <Label className="text-xs text-muted-foreground">FAQ {idx + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-6 px-2"
                        onClick={() => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            faqs: prev.data!.faqs?.filter((_, i) => i !== idx)
                          }
                        } : null)}
                      >
                        Eliminar
                      </Button>
                    </div>
                    <Input 
                      value={faq.question}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          faqs: prev.data!.faqs?.map((f, i) => i === idx ? { ...f, question: e.target.value } : f)
                        }
                      } : null)}
                      placeholder="Pregunta"
                      className="font-medium"
                    />
                    <Textarea 
                      value={faq.answer}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          faqs: prev.data!.faqs?.map((f, i) => i === idx ? { ...f, answer: e.target.value } : f)
                        }
                      } : null)}
                      placeholder="Respuesta"
                      rows={2}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPage(prev => prev ? {
                    ...prev,
                    data: { 
                      ...prev.data!, 
                      faqs: [...(prev.data!.faqs || []), { question: '', answer: '' }]
                    }
                  } : null)}
                >
                  + Anadir FAQ
                </Button>
              </TabsContent>

              {/* Tab Reviews */}
              <TabsContent value="reviews" className="space-y-4 max-h-[400px] overflow-auto">
                {editingPage.data.reviews?.map((review, idx) => (
                  <div key={idx} className="p-3 border rounded-lg space-y-2">
                    <div className="flex justify-between items-start">
                      <Label className="text-xs text-muted-foreground">Review {idx + 1}</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 h-6 px-2"
                        onClick={() => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            reviews: prev.data!.reviews?.filter((_, i) => i !== idx)
                          }
                        } : null)}
                      >
                        Eliminar
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        value={review.name}
                        onChange={(e) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            reviews: prev.data!.reviews?.map((r, i) => i === idx ? { ...r, name: e.target.value } : r)
                          }
                        } : null)}
                        placeholder="Nombre"
                      />
                      <Input 
                        value={review.location || ''}
                        onChange={(e) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            reviews: prev.data!.reviews?.map((r, i) => i === idx ? { ...r, location: e.target.value } : r)
                          }
                        } : null)}
                        placeholder="Ubicacion"
                      />
                    </div>
                    <Textarea 
                      value={review.text}
                      onChange={(e) => setEditingPage(prev => prev ? {
                        ...prev,
                        data: { 
                          ...prev.data!, 
                          reviews: prev.data!.reviews?.map((r, i) => i === idx ? { ...r, text: e.target.value } : r)
                        }
                      } : null)}
                      placeholder="Texto de la resena"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={String(review.rating || 5)}
                        onValueChange={(v) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            reviews: prev.data!.reviews?.map((r, i) => i === idx ? { ...r, rating: Number(v) } : r)
                          }
                        } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 estrellas</SelectItem>
                          <SelectItem value="4">4 estrellas</SelectItem>
                          <SelectItem value="3">3 estrellas</SelectItem>
                          <SelectItem value="2">2 estrellas</SelectItem>
                          <SelectItem value="1">1 estrella</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        value={review.date_ago || ''}
                        onChange={(e) => setEditingPage(prev => prev ? {
                          ...prev,
                          data: { 
                            ...prev.data!, 
                            reviews: prev.data!.reviews?.map((r, i) => i === idx ? { ...r, date_ago: e.target.value } : r)
                          }
                        } : null)}
                        placeholder="Fecha (ej: 2024-03-15)"
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPage(prev => prev ? {
                    ...prev,
                    data: { 
                      ...prev.data!, 
                      reviews: [...(prev.data!.reviews || []), { name: '', text: '', rating: 5, location: '' }]
                    }
                  } : null)}
                >
                  + Anadir Review
                </Button>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPage(null)}>
              Cancelar
            </Button>
            <Button onClick={() => handleSaveEdit(editingPage?.data)}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
