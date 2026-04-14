import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  name: string
  location?: string
  text: string
  rating?: number
  service_type?: string
  date_ago?: string
}

interface TestimonialsProps {
  testimonials: Testimonial[]
  title?: string
  className?: string
  style?: string
  colorScheme?: string
  maxDisplay?: number
}

const colorVariants: Record<string, { bg: string; avatar: string; quote: string }> = {
  blue: { bg: "bg-blue-50", avatar: "bg-blue-100 text-blue-600", quote: "text-blue-200" },
  green: { bg: "bg-green-50", avatar: "bg-green-100 text-green-600", quote: "text-green-200" },
  orange: { bg: "bg-emerald-50", avatar: "bg-orange-100 text-emerald-700", quote: "text-orange-200" },
  teal: { bg: "bg-teal-50", avatar: "bg-teal-100 text-teal-600", quote: "text-teal-200" },
  indigo: { bg: "bg-indigo-50", avatar: "bg-indigo-100 text-indigo-600", quote: "text-indigo-200" },
  emerald: { bg: "bg-emerald-50", avatar: "bg-emerald-100 text-emerald-600", quote: "text-emerald-200" },
  amber: { bg: "bg-amber-50", avatar: "bg-amber-100 text-amber-600", quote: "text-amber-200" },
  cyan: { bg: "bg-cyan-50", avatar: "bg-cyan-100 text-cyan-600", quote: "text-cyan-200" },
}

export function Testimonials({ 
  testimonials, 
  title = "Lo que dicen nuestros clientes",
  className = "",
  style = "cards",
  colorScheme = "blue",
  maxDisplay,
}: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null

  const colors = colorVariants[colorScheme] || colorVariants.blue
  const displayTestimonials = maxDisplay ? testimonials.slice(0, maxDisplay) : testimonials

  // Style: Featured (primer testimonio destacado)
  if (style === "featured" && displayTestimonials.length > 0) {
    const featured = displayTestimonials[0]
    const rest = displayTestimonials.slice(1)
    
    return (
      <div className={cn("container mx-auto px-4", className)}>
        <h2 className="text-2xl font-bold mb-8 text-balance">{title}</h2>
        
        {/* Featured testimonial */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className={cn("h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0", colors.avatar)}>
                <span className="text-3xl font-bold">{featured.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <Quote className={cn("h-10 w-10 mb-4", colors.quote)} />
                <div 
                  className="prose prose-lg max-w-none prose-p:text-foreground prose-strong:font-bold mb-6"
                  dangerouslySetInnerHTML={{ __html: featured.text }}
                />
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="font-semibold">{featured.name}</p>
                    {featured.location && (
                      <p className="text-sm text-muted-foreground">{featured.location}</p>
                    )}
                  </div>
                  {featured.rating && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-5 w-5", i < featured.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                        />
                      ))}
                    </div>
                  )}
                  {featured.date_ago && (
                    <span className="text-sm text-muted-foreground">{featured.date_ago}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Rest of testimonials */}
        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} colors={colors} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Style: Grid (default "cards") - Masonry layout for variable content
  return (
    <div className={cn("container mx-auto px-4", className)}>
      <div className="bg-orange-100 border border-orange-200 rounded-3xl p-6 sm:p-8 lg:p-10">
        <h2 className="text-2xl font-bold mb-8 text-balance">{title}</h2>
        {/* CSS Columns masonry for natural content flow */}
        <div className={cn(
          "gap-6",
          displayTestimonials.length === 1 && "max-w-xl mx-auto",
          displayTestimonials.length === 2 && "columns-1 md:columns-2 max-w-4xl mx-auto",
          displayTestimonials.length >= 3 && "columns-1 md:columns-2 lg:columns-3"
        )}>
          {displayTestimonials.map((testimonial, index) => (
            <div key={index} className="break-inside-avoid mb-6">
              <TestimonialCard testimonial={testimonial} colors={colors} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Helper to strip HTML and decode entities for clean display
function cleanText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&ldquo;|&rdquo;|&quot;|"/g, '"')
    .replace(/&lsquo;|&rsquo;|'/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function TestimonialCard({ testimonial, colors }: { testimonial: Testimonial; colors: { bg: string; avatar: string; quote: string } }) {
  const cleanedText = cleanText(testimonial.text)
  
  return (
    <Card className="relative hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
      <CardContent className="p-6">
        <Quote className={cn("absolute top-4 right-4 h-10 w-10 opacity-20", colors.quote)} />
        
        <div className="flex items-start gap-4 mb-5">
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg", colors.avatar)}>
            {testimonial.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            {testimonial.location && (
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            )}
            {testimonial.rating && (
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn("h-4 w-4", i < testimonial.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-200")}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {`"${cleanedText}"`}
        </p>
        
        {testimonial.date_ago && (
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
            {testimonial.date_ago}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
