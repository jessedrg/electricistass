"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ImageUploader } from "./image-uploader"
import { RichTextEditor } from "./rich-text-editor"
import { Plus, Trash2, Star, GripVertical, ChevronUp, ChevronDown, MessageCircle } from "lucide-react"

interface Review {
  name: string
  rating: number
  text: string
  location?: string
  date?: string
  avatar_url?: string
  verified?: boolean
}

interface ReviewsEditorProps {
  reviews: Review[]
  onChange: (reviews: Review[]) => void
}

export function ReviewsEditor({ reviews, onChange }: ReviewsEditorProps) {
  const addReview = () => {
    onChange([
      ...reviews,
      {
        name: "",
        rating: 5,
        text: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
        avatar_url: "",
        verified: true,
      },
    ])
  }

  const removeReview = (index: number) => {
    onChange(reviews.filter((_, i) => i !== index))
  }

  const updateReview = (index: number, field: keyof Review, value: unknown) => {
    const updated = [...reviews]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews personalizadas</CardTitle>
        <CardDescription>
          Añade testimonios de clientes que aparecerán en la página
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Review {index + 1}</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeReview(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del cliente</Label>
                <Input
                  value={review.name}
                  onChange={(e) => updateReview(index, "name", e.target.value)}
                  placeholder="María García"
                />
              </div>
              <div className="space-y-2">
                <Label>Ubicación</Label>
                <Input
                  value={review.location || ""}
                  onChange={(e) => updateReview(index, "location", e.target.value)}
                  placeholder="Barrio de Salamanca, Madrid"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valoración</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateReview(index, "rating", star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Input
                  type="date"
                  value={review.date || ""}
                  onChange={(e) => updateReview(index, "date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comentario</Label>
              <p className="text-xs text-muted-foreground">
                Usa negrita para destacar palabras clave del servicio.
              </p>
              <RichTextEditor
                content={review.text}
                onChange={(content) => updateReview(index, "text", content)}
                placeholder="Excelente servicio, muy profesionales y puntuales..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Avatar (opcional)</Label>
                <ImageUploader
                  value={review.avatar_url}
                  onChange={(url) => updateReview(index, "avatar_url", url)}
                  folder="avatars"
                />
              </div>
              <div className="space-y-2">
                <Label>Opciones</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Switch
                    checked={review.verified}
                    onCheckedChange={(checked) => updateReview(index, "verified", checked)}
                  />
                  <Label className="font-normal">Cliente verificado</Label>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={addReview} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Añadir review
        </Button>
      </CardContent>
    </Card>
  )
}
