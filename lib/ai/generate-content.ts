import { generateText, Output } from "ai"
import { z } from "zod"

// Schema completo para contenido anti thin-content
const pageContentSchema = z.object({
  // SEO
  title: z.string().describe("Titulo SEO optimizado, 55-60 caracteres max"),
  meta_description: z.string().describe("Meta description, 150-155 caracteres"),
  h1: z.string().describe("H1 principal unico y atractivo"),
  h1_variant: z.string().describe("Variante del H1 para A/B test"),
  
  // Contenido principal extenso
  intro_text: z.string().describe("Parrafo introductorio de 300+ palabras"),
  intro_highlight: z.string().describe("Frase destacada del intro"),
  
  // Servicios con mucho detalle
  services_offered: z.array(z.object({
    name: z.string(),
    description: z.string().describe("Descripcion de 80+ palabras"),
    icon: z.string().describe("wrench, zap, shield, droplet, flame, thermometer, hammer, paintbrush, key, bug"),
    price_from: z.number().nullable(),
    duration: z.string().nullable(),
  })).describe("8-12 servicios detallados"),
  
  // Zonas de cobertura reales
  coverage_zones: z.array(z.object({
    name: z.string().describe("Nombre del barrio real"),
    description: z.string().describe("Info especifica 50+ palabras"),
    zip_codes: z.array(z.string()).nullable(),
    highlight: z.string().nullable(),
  })).describe("6-10 barrios reales"),
  
  // Tips locales
  local_tips: z.string().describe("Consejos de 250+ palabras"),
  local_tips_list: z.array(z.object({
    tip: z.string(),
    explanation: z.string(),
  })).describe("5-7 consejos"),
  
  // Testimonios realistas
  testimonials: z.array(z.object({
    name: z.string().describe("Nombre espanol realista"),
    location: z.string().describe("Barrio de la ciudad"),
    text: z.string().describe("40-60 palabras"),
    rating: z.number(),
    service_type: z.string(),
    date_ago: z.string().describe("ej: hace 2 semanas"),
  })).describe("5-7 testimonios"),
  
  // FAQs extensas
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string().describe("Respuesta de 100+ palabras"),
    category: z.string().describe("precios, servicios, urgencias, garantia"),
  })).describe("8-12 FAQs"),
  
  // Precios
  price_range: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
    unit: z.string(),
    factors: z.array(z.string()).describe("Factores que afectan precio"),
  }),
  
  // Razones para elegirnos
  why_choose_us: z.array(z.object({
    title: z.string(),
    description: z.string().describe("50+ palabras"),
    icon: z.string(),
  })).describe("4-6 razones"),
  
  // Problemas comunes locales
  common_problems: z.array(z.object({
    problem: z.string(),
    description: z.string(),
    solution: z.string(),
  })).describe("4-6 problemas comunes"),
  
  // CTAs personalizados
  cta_main: z.string(),
  cta_secondary: z.string(),
  cta_urgency: z.string(),
  
  // Contenido unico de ciudad
  city_specific_content: z.string().describe("200+ palabras sobre el servicio en esta ciudad especifica"),
})

export type PageContent = z.infer<typeof pageContentSchema>

interface ServiceInfo {
  name: string
  slug: string
  description: string
}

interface CityInfo {
  name: string
  slug: string
  province: string
  population: number
  neighborhoods: Array<{ name: string; description?: string }> | string[]
  local_context: string
  landmarks?: string[]
}

export async function generatePageContent(
  service: ServiceInfo,
  city: CityInfo
): Promise<PageContent> {
  const neighborhoodNames = Array.isArray(city.neighborhoods) 
    ? city.neighborhoods.map(n => typeof n === 'string' ? n : n.name).join(", ")
    : "centro y alrededores"
  
  const landmarks = city.landmarks?.join(", ") || "centro historico"

  // Definir servicios específicos según el tipo
  const serviceSpecifics: Record<string, string> = {
    fontanero: `
SERVICIOS ESPECIFICOS DE FONTANERIA:
- Reparación de fugas de agua en tuberías, grifos y cisternas
- Desatascos de tuberías, fregaderos, WC y bajantes
- Instalación y reparación de calentadores y termos eléctricos
- Detección de fugas ocultas con cámara termográfica
- Instalación de grifería y sanitarios
- Reparación de calderas y calefacción
- Urgencias 24h por inundaciones y roturas`,
    electricista: `
SERVICIOS ESPECIFICOS DE ELECTRICIDAD:
- Reparación de averías eléctricas urgentes
- Instalación y cambio de cuadros eléctricos
- Boletines eléctricos y certificados de instalación
- Instalación de puntos de luz, enchufes e interruptores
- Reparación de cortocircuitos y subidas de tensión
- Instalación de aire acondicionado y splits
- Urgencias 24h por apagones y chispazos`,
    cerrajero: `
SERVICIOS ESPECIFICOS DE CERRAJERIA:
- Apertura de puertas sin daños (casa, coche, caja fuerte)
- Cambio de cerraduras de seguridad
- Instalación de cerraduras antibumping y antipalanca
- Copia de llaves y amaestramiento
- Reparación de persianas metálicas
- Instalación de mirillas digitales
- Urgencias 24h por cierres accidentales`,
  }

  const serviceContext = serviceSpecifics[service.slug] || ""

  const prompt = `Genera contenido SEO EXTENSO y UNICO en español para una página de ${service.name} en ${city.name}, ${city.province}, España.

EMPRESA: Electricistas 24H - Teléfono: 900 433 214

INFORMACION DE LA CIUDAD:
- Población: ${city.population?.toLocaleString() || "desconocida"} habitantes
- Barrios principales: ${neighborhoodNames}
- Lugares conocidos: ${landmarks}
- Contexto local: ${city.local_context || "Ciudad española"}

SERVICIO: ${service.name}
DESCRIPCION: ${service.description}
${serviceContext}

REQUISITOS CRITICOS ANTI THIN-CONTENT:
1. TODO el contenido DEBE ser ÚNICO y específico para ${city.name}
2. Mencionar barrios REALES de ${city.name} con detalles específicos
3. El intro DEBE tener 300+ palabras, natural y útil
4. Cada FAQ DEBE tener respuesta de 100+ palabras mínimo
5. Incluir problemas comunes REALES de la zona (clima, tipo de edificios antiguos/modernos)
6. Los testimonios DEBEN mencionar barrios reales de ${city.name}
7. El contenido debe ser ÚTIL para alguien que REALMENTE busca ${service.name} en ${city.name}
8. NO contenido genérico - todo debe sentirse escrito ESPECÍFICAMENTE para ${city.name}
9. Usa datos y contexto local real de ${city.province}
10. Tono profesional pero cercano, como un vecino experto
11. SIEMPRE mencionar el teléfono 900 433 214 en los CTAs
12. Usar ñ, tildes y caracteres españoles correctamente

VARIACIONES IMPORTANTES:
- El H1 y h1_variant deben ser diferentes pero ambos efectivos para SEO
- Los CTAs deben ser urgentes pero NO agresivos (ej: "Llama al 900 433 214")
- Incluir precios realistas para España 2024
- Mencionar que somos Electricistas 24H, empresa de confianza`

  const result = await generateText({
    model: "anthropic/claude-sonnet-4-20250514",
    prompt,
    output: Output.object({ schema: pageContentSchema }),
    maxOutputTokens: 8000,
  })

  if (!result.object) {
    throw new Error("Failed to generate content - no object returned")
  }

  return result.object
}

// Generar variaciones de diseno consistentes basadas en hash
export function generateDesignVariation(serviceSlug: string, citySlug: string) {
  const hash = (serviceSlug + citySlug).split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const abs = Math.abs(hash)
  
  const layouts = ["standard", "hero-split", "hero-centered", "hero-minimal", "hero-full"]
  const colorSchemes = ["blue", "green", "orange", "teal", "indigo", "emerald", "amber", "cyan"]
  const heroStyles = ["gradient", "image-overlay", "solid", "pattern", "split-image"]
  const ctaStyles = ["button-primary", "button-gradient", "card-cta", "floating-cta"]
  const testimonialStyles = ["cards", "carousel", "grid", "list", "featured"]
  const faqStyles = ["accordion", "grid", "tabs", "list"]
  const spacingVariants = ["compact", "standard", "spacious", "generous"]
  
  return {
    layout_variant: layouts[abs % layouts.length],
    color_scheme: colorSchemes[abs % colorSchemes.length],
    hero_style: heroStyles[(abs >> 3) % heroStyles.length],
    cta_style: ctaStyles[(abs >> 6) % ctaStyles.length],
    testimonial_style: testimonialStyles[(abs >> 9) % testimonialStyles.length],
    faq_style: faqStyles[(abs >> 12) % faqStyles.length],
    spacing_variant: spacingVariants[(abs >> 15) % spacingVariants.length],
  }
}

// URLs de imagenes de ciudad usando Unsplash
export function generateCityImageUrls(cityName: string) {
  const encoded = encodeURIComponent(cityName + " spain")
  const base = "https://source.unsplash.com"
  
  return {
    hero: `${base}/1600x900/?${encoded},city,architecture`,
    thumbnail: `${base}/400x300/?${encoded},cityscape`,
    gallery: [
      `${base}/800x600/?${encoded},street`,
      `${base}/800x600/?${encoded},building`,
      `${base}/800x600/?${encoded},landmark`,
      `${base}/800x600/?${encoded},plaza`,
    ],
  }
}
