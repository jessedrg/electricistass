"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2, Plus, Trash2, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"

interface Neighborhood {
  name: string
  description: string
}

interface CityFormProps {
  city?: {
    id: string
    name: string
    slug: string
    province: string
    autonomous_community: string
    population: number
    latitude: number
    longitude: number
    neighborhoods: Neighborhood[]
    landmarks: string[]
    local_context: string
    city_image_url: string | null
  }
}

export function CityForm({ city }: CityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: city?.name || "",
    slug: city?.slug || "",
    province: city?.province || "",
    autonomous_community: city?.autonomous_community || "",
    population: city?.population || 0,
    latitude: city?.latitude || 0,
    longitude: city?.longitude || 0,
    local_context: city?.local_context || "",
  })
  
  const [cityImageUrl, setCityImageUrl] = useState<string>(city?.city_image_url || "")
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>(
    city?.neighborhoods || [{ name: "", description: "" }]
  )
  
  const [landmarks, setLandmarks] = useState<string[]>(
    city?.landmarks || [""]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }))
    
    // Auto-generate slug from name
    if (name === "name" && !city) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }))
    }
  }

  const addNeighborhood = () => {
    setNeighborhoods([...neighborhoods, { name: "", description: "" }])
  }

  const removeNeighborhood = (index: number) => {
    setNeighborhoods(neighborhoods.filter((_, i) => i !== index))
  }

  const updateNeighborhood = (index: number, field: keyof Neighborhood, value: string) => {
    const updated = [...neighborhoods]
    updated[index][field] = value
    setNeighborhoods(updated)
  }

  const addLandmark = () => {
    setLandmarks([...landmarks, ""])
  }

  const removeLandmark = (index: number) => {
    setLandmarks(landmarks.filter((_, i) => i !== index))
  }

  const updateLandmark = (index: number, value: string) => {
    const updated = [...landmarks]
    updated[index] = value
    setLandmarks(updated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "cities")

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al subir imagen")

      const data = await res.json()
      setCityImageUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen")
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setCityImageUrl("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        ...formData,
        neighborhoods: neighborhoods.filter(n => n.name),
        landmarks: landmarks.filter(l => l),
        city_image_url: cityImageUrl || null,
      }

      const url = city 
        ? `/api/admin/cities/${city.id}`
        : "/api/admin/cities"
      
      const res = await fetch(url, {
        method: city ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Error al guardar")
      }

      router.push("/admin/ciudades")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="barrios">Barrios</TabsTrigger>
          <TabsTrigger value="contexto">Contexto IA</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información básica</CardTitle>
              <CardDescription>Datos principales de la ciudad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Madrid"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="madrid"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Provincia *</Label>
                  <Input
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    placeholder="Madrid"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autonomous_community">Comunidad Autónoma *</Label>
                  <Input
                    id="autonomous_community"
                    name="autonomous_community"
                    value={formData.autonomous_community}
                    onChange={handleChange}
                    placeholder="Comunidad de Madrid"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="population">Población</Label>
                  <Input
                    id="population"
                    name="population"
                    type="number"
                    value={formData.population || ""}
                    onChange={handleChange}
                    placeholder="3200000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={handleChange}
                    placeholder="40.4168"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={handleChange}
                    placeholder="-3.7038"
                  />
                </div>
              </div>

              {/* Imagen de la ciudad */}
              <div className="space-y-2">
                <Label>Imagen de la ciudad</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Una foto representativa de la ciudad que aparecera en las paginas dinamicas
                </p>
                {cityImageUrl ? (
                  <div className="relative w-full max-w-md">
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                      <Image
                        src={cityImageUrl}
                        alt={`Imagen de ${formData.name}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Haz clic para subir una imagen
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lugares de interes</CardTitle>
              <CardDescription>Monumentos, edificios famosos, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {landmarks.map((landmark, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={landmark}
                    onChange={(e) => updateLandmark(index, e.target.value)}
                    placeholder="Puerta del Sol, Gran Vía..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLandmark(index)}
                    disabled={landmarks.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLandmark}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir lugar
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="barrios" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Barrios principales</CardTitle>
              <CardDescription>
                Añade los barrios más importantes para SEO local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {neighborhoods.map((neighborhood, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Barrio {index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNeighborhood(index)}
                      disabled={neighborhoods.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={neighborhood.name}
                    onChange={(e) => updateNeighborhood(index, "name", e.target.value)}
                    placeholder="Nombre del barrio"
                  />
                  <Textarea
                    value={neighborhood.description}
                    onChange={(e) => updateNeighborhood(index, "description", e.target.value)}
                    placeholder="Descripción breve del barrio (tipo de edificios, problemas comunes...)"
                    rows={2}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addNeighborhood}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir barrio
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contexto" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contexto para la IA</CardTitle>
              <CardDescription>
                Información que la IA usará para generar contenido único
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="local_context">Contexto local</Label>
                <Textarea
                  id="local_context"
                  name="local_context"
                  value={formData.local_context}
                  onChange={handleChange}
                  placeholder="Describe el clima, tipo de edificios (antiguos/modernos), problemas comunes de fontanería/electricidad en la zona, materiales típicos de construcción..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Cuanta más información proporciones, mejor será el contenido generado.
                </p>
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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {city ? "Guardar cambios" : "Crear ciudad"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
