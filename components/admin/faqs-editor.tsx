"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { 
  Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  HelpCircle, MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQ {
  question: string
  answer: string
}

interface FAQsEditorProps {
  faqs: FAQ[]
  onChange: (faqs: FAQ[]) => void
}

export function FAQsEditor({ faqs, onChange }: FAQsEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const addFaq = () => {
    onChange([...faqs, { question: "", answer: "" }])
    setExpandedIndex(faqs.length)
  }

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index))
    if (expandedIndex === index) {
      setExpandedIndex(null)
    }
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const updated = [...faqs]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    onChange(updated)
    setExpandedIndex(index - 1)
  }

  const moveDown = (index: number) => {
    if (index === faqs.length - 1) return
    const updated = [...faqs]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    onChange(updated)
    setExpandedIndex(index + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          Preguntas Frecuentes
        </CardTitle>
        <CardDescription>
          FAQs que aparecen en la página. Usa el editor para dar formato a las respuestas.
          El orden se mantiene igual que aquí.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {faqs.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No hay preguntas frecuentes todavía</p>
            <Button type="button" variant="outline" onClick={addFaq}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir primera pregunta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={cn(
                  "border rounded-lg overflow-hidden transition-all",
                  expandedIndex === index ? "ring-2 ring-orange-200" : ""
                )}
              >
                {/* Header - always visible */}
                <div 
                  className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer"
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-emerald-700 flex-shrink-0">
                    FAQ {index + 1}
                  </span>
                  <span className="flex-1 truncate text-sm">
                    {faq.question || "(Sin pregunta)"}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); moveUp(index) }}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); moveDown(index) }}
                      disabled={index === faqs.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); removeFaq(index) }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedIndex === index && (
                  <div className="p-4 space-y-4 border-t bg-background">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-emerald-600" />
                        Pregunta
                      </Label>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                        placeholder="¿Cuánto cuesta un fontanero en Madrid?"
                        className="font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        Respuesta
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Usa negrita, listas, enlaces para hacer la respuesta más clara y útil.
                      </p>
                      <RichTextEditor
                        content={faq.answer}
                        onChange={(content) => updateFaq(index, "answer", content)}
                        placeholder="Escribe una respuesta detallada y útil..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {faqs.length > 0 && (
          <Button type="button" variant="outline" onClick={addFaq} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Añadir pregunta
          </Button>
        )}

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-medium text-blue-900 mb-2">Consejos para FAQs efectivas:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Usa preguntas que tus clientes realmente hacen</li>
            <li>• Incluye precios, tiempos, y garantías en las respuestas</li>
            <li>• Usa <strong>negrita</strong> para destacar información clave</li>
            <li>• Añade enlaces a otras páginas relevantes</li>
            <li>• Las FAQs aparecen en el schema de Google (rich results)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
