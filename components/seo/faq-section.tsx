"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface FAQSectionProps {
  faqs: FAQItem[]
  title?: string
  className?: string
  style?: "accordion" | "grid" | "simple"
  showCategories?: boolean
}

export function FAQSection({ 
  faqs, 
  title = "Preguntas Frecuentes",
  className = "",
  style = "accordion",
  showCategories = false,
}: FAQSectionProps) {
  if (!faqs || faqs.length === 0) return null

  return (
    <section className={`py-12 ${className}`}>
      <h2 className="text-2xl font-bold mb-8 text-balance">{title}</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent>
              <div 
                className="prose prose-sm max-w-none prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-emerald-700 hover:prose-a:text-orange-700"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
