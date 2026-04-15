import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateObject } from "ai"
import { z } from "zod"
import { generateDesignVariation, generateCityImageUrls } from "@/lib/ai/generate-content"

// Configuration
const MIN_POPULATION = 10000 // Minimum population for cities (Spain)
const CITIES_PER_EXECUTION = 10 // How many cities to process per cron run

export const maxDuration = 300 // 5 minutes max

// Same schema as generate-page API
const pageContentSchema = z.object({
  // LOCATION DETECTION
  is_neighborhood: z.boolean().describe('TRUE si es barrio/distrito, FALSE si es ciudad'),
  parent_city: z.string().nullable().describe('Ciudad principal si es barrio. null si es ciudad'),
  parent_city_slug: z.string().nullable().describe('Slug ciudad principal. null si es ciudad'),
  
  // DATOS LOCALES - longitud VARIABLE
  local_facts: z.object({
    population_approx: z.string().describe('Poblacion: varia formato "45.000 hab", "mas de 300 mil vecinos", "unos 50.000"'),
    famous_for: z.string().describe('Conocida por: longitud variable 5-25 palabras'),
    nearby_areas: z.array(z.string()).describe('2-5 zonas cercanas (cantidad ALEATORIA)'),
    local_landmark: z.string().describe('Lugar emblematico'),
    local_problem: z.string().describe('Problema local: longitud 8-30 palabras VARIABLE'),
    interesting_fact: z.string().describe('Dato curioso unico de esta zona 10-40 palabras'),
  }),
  
  // SEO - estructuras MUY DIFERENTES
  title: z.string().describe('Title 45-65 chars, estructura UNICA'),
  title_variant: z.string().describe('Title estructura COMPLETAMENTE diferente'),
  title_variant_2: z.string().describe('Title tercera estructura distinta'),
  meta_description: z.string().describe('Meta 130-165 chars VARIABLE, inicio diferente'),
  meta_description_variant: z.string().describe('Meta estructura opuesta al primero'),
  
  // H1 - 5 variantes muy diferentes
  h1: z.string().describe('H1 4-12 palabras'),
  h1_variant: z.string().describe('H1 tono opuesto, longitud diferente'),
  h1_variant_2: z.string().describe('H1 como pregunta'),
  h1_variant_3: z.string().describe('H1 con numero/estadistica'),
  h1_variant_4: z.string().describe('H1 informal/coloquial'),
  
  // HIGHLIGHTS - longitudes MUY variables
  highlight: z.string().describe('3-6 palabras'),
  highlight_variant: z.string().describe('6-10 palabras'),
  highlight_variant_2: z.string().describe('4-8 palabras con urgencia'),
  highlight_variant_3: z.string().describe('5-12 palabras con dato'),
  
  // INTRO TEXT - estructura ALEATORIA con HTML RICO
  intro_text: z.string().describe('250-550 palabras HTML RICO OBLIGATORIO. USA: <h2>Subtitulos</h2>, <p>parrafos</p>, <strong>palabras en negrita</strong> (minimo 5-8 negritas distribuidas), <ul><li>listas</li></ul>. Estructura ALEATORIA: 2-4 H2s, listas opcionales. Parrafos VARIABLE: algunos 1-2 lineas, otros 5-7 lineas. Emojis 3-12 (algunos inline, algunos solos). ALTERNA parrafos con negritas y sin negritas para variacion visual.'),
  intro_text_variant: z.string().describe('Intro HTML RICO estructura OPUESTA: si el primero tiene muchas negritas este menos, si tiene muchos H2 este menos. Longitud diferente. Enfoque narrativo opuesto.'),
  
  // CTAs - 10 variantes
  cta_buttons: z.array(z.object({
    text: z.string().describe('Texto 1-4 palabras, longitud VARIABLE'),
    emoji: z.string().describe('Emoji diferente cada uno'),
    type: z.enum(['primary', 'secondary', 'urgent']),
    style: z.enum(['formal', 'casual', 'urgente', 'amigable', 'informativo', 'profesional', 'cercano', 'directo']),
  })).describe('10 botones MUY diferentes en tono y longitud'),
  
  // URGENCY - 8 variantes longitud variable
  urgency_messages: z.array(z.string()).describe('8 mensajes: algunos 2 palabras, otros 8 palabras. Mezcla.'),
  
  // BADGES - 10 con longitudes variables
  badges: z.array(z.object({
    text: z.string().describe('2-5 palabras VARIABLE'),
    emoji: z.string(),
    category: z.enum(['tiempo', 'precio', 'garantia', 'experiencia', 'local', 'disponibilidad', 'calidad', 'confianza']),
  })).describe('10 badges longitudes MUY diferentes'),
  
  // FINAL CTA - 5 variantes
  final_ctas: z.array(z.object({
    title: z.string().describe('Titulo 4-15 palabras VARIABLE'),
    subtitle: z.string().describe('Subtitulo 8-30 palabras VARIABLE'),
    style: z.enum(['pregunta', 'afirmacion', 'urgencia', 'confianza', 'local']),
  })).describe('5 CTAs finales MUY diferentes en longitud'),
  
  // FAQs - cantidad y longitud ALEATORIA
  faqs: z.array(z.object({
    question: z.string().describe('Pregunta 5-15 palabras VARIABLE'),
    answer: z.string().describe('Respuesta 20-120 palabras MUY VARIABLE. Algunas cortas, otras largas con listas.'),
    has_list: z.boolean().describe('true si tiene lista en respuesta, false si es solo texto'),
  })).describe('5-10 FAQs (cantidad ALEATORIA), longitudes MUY variables'),
  
  // REVIEWS - longitudes MUY variables
  reviews: z.array(z.object({
    name: z.string().describe('Nombre: a veces solo nombre, a veces nombre+apellido, a veces iniciales'),
    rating: z.number().describe('4 o 5'),
    text: z.string().describe('15-90 palabras MUY VARIABLE. Algunos muy cortos, otros detallados.'),
    location: z.string().describe('Ubicacion: a veces barrio, a veces calle, a veces zona generica'),
    date: z.string(),
    service_type: z.string().describe('Servicio: a veces especifico, a veces general'),
    verified_badge: z.string().describe('Badge: varia texto cada vez'),
    has_emoji: z.boolean().describe('true si la review tiene emoji, false si no'),
  })).describe('4-8 reviews (cantidad ALEATORIA)'),
  
  // SERVICIOS - cantidad variable
  services_list: z.array(z.object({
    icon: z.string(),
    title: z.string().describe('2-6 palabras'),
    description: z.string().describe('10-40 palabras MUY VARIABLE'),
    price_hint: z.string().describe('Precio: formatos variables "30€", "Desde 25", "Consultar", "Economico", "40-80€"'),
  })).describe('4-8 servicios (cantidad ALEATORIA)'),
  
  // BENEFICIOS - cantidad variable
  benefits: z.array(z.object({
    icon: z.string(),
    title: z.string().describe('2-5 palabras'),
    description: z.string().describe('8-35 palabras VARIABLE'),
    local_touch: z.string().describe('Detalle local 5-20 palabras'),
  })).describe('3-6 beneficios (cantidad ALEATORIA)'),
  
  // CONTENIDO EXTRA ALEATORIO
  extra_section: z.object({
    type: z.enum(['testimonial_destacado', 'dato_curioso', 'proceso_trabajo', 'zona_cobertura', 'ninguno']),
    content: z.string().describe('Contenido HTML 30-100 palabras si aplica, vacio si tipo=ninguno'),
  }).describe('Seccion extra ALEATORIA - a veces aparece, a veces no'),
  
  // SEO
  keywords: z.array(z.string()).describe('8-15 keywords (cantidad VARIABLE)'),
  content_tone: z.enum(['profesional', 'cercano', 'urgente', 'informativo', 'persuasivo']).describe('Tono general del contenido'),
})

// Helper to generate random days ago date
function randomDaysAgo(): string {
  const days = Math.floor(Math.random() * 30) + 1
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

// Generate content with same prompt as generate-page API
async function generateContentWithFullPrompt(serviceName: string, cityName: string, cityProvince: string) {
  const randomSeed = Math.random().toString(36).substring(7)
  const currentDate = new Date().toISOString().split('T')[0]

  // Generar parametros aleatorios para maxima variacion
  const numFaqs = 5 + Math.floor(Math.random() * 6) // 5-10
  const numReviews = 4 + Math.floor(Math.random() * 5) // 4-8
  const numServices = 4 + Math.floor(Math.random() * 5) // 4-8
  const numBenefits = 3 + Math.floor(Math.random() * 4) // 3-6
  const introLength = 250 + Math.floor(Math.random() * 300) // 250-550
  const numH2s = 1 + Math.floor(Math.random() * 4) // 1-4
  const hasUlList = Math.random() > 0.3
  const hasOlList = Math.random() > 0.5
  const tones = ['profesional', 'cercano', 'urgente', 'informativo', 'persuasivo']
  const selectedTone = tones[Math.floor(Math.random() * tones.length)]
  const extraSections = ['testimonial_destacado', 'dato_curioso', 'proceso_trabajo', 'zona_cobertura', 'ninguno']
  const selectedExtra = extraSections[Math.floor(Math.random() * extraSections.length)]

  const result = await generateObject({
    model: "openai/gpt-4o", // Modelo mas capaz para schemas complejos
    schema: pageContentSchema,
    messages: [
      {
        role: 'user',
        content: `GENERA CONTENIDO 100% UNICO para ${serviceName} en ${cityName}${cityProvince ? ` (${cityProvince})` : ''}.

📞 DATOS DE CONTACTO (NUNCA INVENTAR OTROS):
- Telefono de llamadas: 900 433 214
- WhatsApp: +34 711 267 223
- Empresa: Electricistas 24H

🎲 PARAMETROS ALEATORIOS OBLIGATORIOS (SEED: ${randomSeed}):
- Tono general: "${selectedTone}"
- Numero FAQs: EXACTAMENTE ${numFaqs}
- Numero reviews: EXACTAMENTE ${numReviews}
- Numero servicios: EXACTAMENTE ${numServices}
- Numero beneficios: EXACTAMENTE ${numBenefits}
- Intro: ~${introLength} palabras con ${numH2s} subtitulos H2
- Lista ul: ${hasUlList ? 'SI incluir' : 'NO incluir'}
- Lista ol: ${hasOlList ? 'SI incluir' : 'NO incluir'}
- Seccion extra: "${selectedExtra}"

🏘️ BARRIO O CIUDAD:
Si "${cityName}" es BARRIO (Gracia->Barcelona, Chamberi->Madrid): is_neighborhood=true, parent_city="CiudadPrincipal"
Si es CIUDAD independiente: is_neighborhood=false

📍 DATOS LOCALES REALES de ${cityName}:
- population_approx: formato VARIABLE ("45.000", "unos 50 mil", "mas de 300.000 vecinos")
- famous_for: ${5 + Math.floor(Math.random() * 20)} palabras sobre historia/industria/cultura
- nearby_areas: ${2 + Math.floor(Math.random() * 4)} zonas cercanas REALES
- local_landmark: lugar emblematico real
- local_problem: problema local ${8 + Math.floor(Math.random() * 22)} palabras
- interesting_fact: dato curioso UNICO ${10 + Math.floor(Math.random() * 30)} palabras

📊 SEO - 3 TITULOS estructuras RADICALMENTE diferentes:
- Uno con emoji al inicio, otro al final, otro sin emoji
- Uno como pregunta, uno como afirmacion, uno con numero
- Longitudes: uno 45 chars, otro 55, otro 65

📝 INTRO_TEXT (~${introLength} palabras) - FORMATO HTML RICO OBLIGATORIO:
ESTRUCTURA ${selectedTone.toUpperCase()}:

📋 FORMATO HTML OBLIGATORIO - USA TODOS ESTOS ELEMENTOS:
<h2>Titulo de seccion con emoji ${Math.random() > 0.5 ? 'al inicio' : 'al final'}</h2>
<p>Parrafo con <strong>palabras importantes en negrita</strong> y texto normal mezclado.</p>
<p><strong>Frase completa en negrita para destacar.</strong></p>
<p>Parrafo largo sin negritas para variar el ritmo visual del contenido.</p>

REGLAS DE FORMATO:
- ${numH2s} subtitulos <h2> creativos (algunos con emoji, otros sin)
- MINIMO 5-8 fragmentos en <strong>negrita</strong> distribuidos
- Alterna: parrafo con negritas, parrafo sin negritas, parrafo mixto
- ${3 + Math.floor(Math.random() * 10)} emojis: algunos solos en parrafo, otros inline
${hasUlList ? '- UNA lista <ul><li>item con <strong>parte en negrita</strong></li></ul>' : '- SIN lista ul'}
${hasOlList ? '- UNA lista <ol><li>Paso con explicacion</li></ol>' : '- SIN lista ol'}
- Parrafos de longitud MUY VARIABLE:
  * 2-3 parrafos CORTOS (1-2 lineas)
  * 2-3 parrafos MEDIANOS (3-4 lineas)  
  * 1-2 parrafos LARGOS (5-7 lineas)
- Mencionar ${2 + Math.floor(Math.random() * 3)} zonas de ${cityName}

INTRO_TEXT_VARIANT: estructura OPUESTA (si el primero tiene muchas negritas, este menos; si tiene muchos h2, este menos; longitud diferente)

📞 10 CTAs DIFERENTES:
- Longitudes: algunos 1 palabra, otros 4 palabras
- Estilos: formal, casual, urgente, amigable (mezclar)
- NUNCA repetir estructura entre CTAs

⚠️ 8 MENSAJES URGENCIA:
- Longitudes MUY variables: "Ya!" (2 palabras) vs "Tecnico disponible en tu zona ahora mismo" (8 palabras)

🏷️ 10 BADGES:
- Longitudes: algunos 2 palabras, otros 5 palabras
- Categorias variadas, NO repetir patron

🎯 5 FINAL CTAs:
- Titulos: ${4 + Math.floor(Math.random() * 11)} palabras cada uno (VARIABLE)
- Subtitulos: ${8 + Math.floor(Math.random() * 22)} palabras cada uno (VARIABLE)

💬 ${numReviews} REVIEWS - SUPER ALEATORIAS (SEED: ${Math.random().toString(36).substring(2, 10)}):
NOMBRES COMPLETAMENTE UNICOS - NUNCA REPETIR ENTRE PAGINAS:
- Combina nombres y apellidos espanoles REALES poco comunes
- Ejemplos de formatos (NO USES ESTOS EXACTOS, inventa nuevos):
  * "Montserrat Vilaplana", "Fermin Roca", "Nuria Bosch", "Oriol Puigdemont"
  * "A. Fernandez", "M.C.", "Lucia P.", "Javier de la Torre"
  * Solo nombre: "Enric", "Laia", "Pol", "Mireia"
- PROHIBIDO: "Juan Garcia", "Maria Lopez", "Pedro Martinez" (MUY COMUNES)
- USA nombres catalanes, vascos, gallegos, asturianos MEZCLADOS
- Seed para nombres: ${Math.random().toString(36).substring(2, 8)}-${cityName.substring(0, 3)}

CONTENIDO DE CADA REVIEW - TOTALMENTE DIFERENTE:
- Review 1: ${10 + Math.floor(Math.random() * 15)} palabras, tono ${['entusiasta', 'profesional', 'agradecido', 'sorprendido'][Math.floor(Math.random() * 4)]}
- Review 2: ${25 + Math.floor(Math.random() * 35)} palabras, menciona problema especifico
- Review 3: ${15 + Math.floor(Math.random() * 20)} palabras, menciona tiempo de respuesta
- Review 4: ${40 + Math.floor(Math.random() * 50)} palabras, cuenta historia completa
- Review 5: ${8 + Math.floor(Math.random() * 12)} palabras, muy directo

FECHAS VARIABLES: ${randomDaysAgo()}, ${randomDaysAgo()}, ${randomDaysAgo()}, ${randomDaysAgo()}, ${currentDate}
EMOJIS: ${Math.floor(Math.random() * 3)} reviews con emoji al final, ${Math.floor(Math.random() * 2)} al inicio
UBICACIONES: barrio especifico de ${cityName}, "cerca de [monumento]", "zona [norte/sur/centro]"
ESTRELLAS: ${4 + Math.floor(Math.random() * 2)} de 5 (NUNCA todas 5 estrellas)

❓ ${numFaqs} FAQs:
- Preguntas: ${5 + Math.floor(Math.random() * 10)} palabras cada una (VARIABLE)
- Respuestas: ${Math.floor(numFaqs / 3)} cortas (20-30 palabras), ${Math.floor(numFaqs / 3)} largas (80-120 palabras con lista), resto medias
- has_list: true para las largas, false para cortas

🛠️ ${numServices} SERVICIOS:
- Titulos: 2-6 palabras (VARIABLE)
- Descripciones: algunas 10 palabras, otras 40 palabras
- Precios: formatos MUY variables ("30€", "Desde 25€", "40-80€", "Consultar", "Economico", "A convenir")

⭐ ${numBenefits} BENEFICIOS:
- Descripciones: longitudes MUY variables entre ellos

📦 SECCION EXTRA: "${selectedExtra}"
${selectedExtra !== 'ninguno' ? `Generar contenido HTML ${30 + Math.floor(Math.random() * 70)} palabras` : 'content vacio'}

🔑 ${8 + Math.floor(Math.random() * 8)} KEYWORDS long-tail unicas

⚠️ ANTI-SPAM: 
- NUNCA uses la misma estructura dos veces
- Longitudes SIEMPRE variables
- Cada pagina debe parecer escrita por PERSONA DIFERENTE
- Google detecta patrones: EVITA cualquier repeticion

✍️ CALIDAD DE ESCRITURA - MUY IMPORTANTE:
- PUNTUACION CORRECTA: Usa comas, puntos, puntos y coma donde corresponda
- NUNCA repitas la misma frase o idea dos veces seguidas
- NUNCA empieces dos parrafos seguidos con la misma palabra
- Cada oracion debe tener SENTIDO COMPLETO y estar bien construida
- Lee el texto mentalmente antes de generarlo: debe sonar NATURAL
- Evita frases cortadas, incompletas o que no tengan sentido
- NO uses estructuras raras como "ubicad" (debe ser "ubicados" o "ubicadas")
- REVISA que cada parrafo tenga principio, desarrollo y final logico
- Si mencionas un dato, COMPLETA la idea (no dejes frases a medias)
- Varia los conectores: "Ademas", "Por otro lado", "Asimismo", "Tambien", "Igualmente"
- PROHIBIDO: repetir palabras clave mas de 3 veces en el mismo parrafo`
      }
    ],
  })

  if (!result.object) {
    throw new Error("Failed to generate content - no object returned")
  }
  return result.object
}

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[CRON] ========== AUTO-GENERATE STARTED ==========")
  console.log("[CRON] Timestamp:", new Date().toISOString())
  
  const supabase = await createClient()
  
  try {
    // Step 1: Find Spanish cities with 10,000+ population that don't have pages yet
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("id, name, slug, province, population, neighborhoods, local_context, landmarks")
      .gte("population", MIN_POPULATION)
      .not("province", "is", null) // Only Spanish cities (have province)
      .order("population", { ascending: false })

    if (citiesError) {
      console.error("[CRON] Error fetching cities:", citiesError)
      return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
    }

    console.log(`[CRON] Found ${cities?.length || 0} cities with population >= ${MIN_POPULATION}`)

    if (!cities || cities.length === 0) {
      console.log("[CRON] No cities found, exiting")
      return NextResponse.json({ 
        message: "No cities found with population >= 10,000",
        generated: 0 
      })
    }

    // Step 1.5: Clean up ALL stuck "generating" pages (older than 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString()
    const { data: deletedPages } = await supabase
      .from("pages")
      .delete()
      .eq("status", "generating")
      .lt("created_at", twoMinutesAgo)
      .select("id")
    
    console.log(`[CRON] Cleaned up ${deletedPages?.length || 0} stuck generating pages`)

    // Step 2: Get ONLY electricista service (not cerrajero or others)
    const { data: services, error: servicesError } = await supabase
      .from("services")
      .select("id, name, slug, description")
      .eq("slug", "electricista")
      .limit(1)

    if (servicesError || !services || services.length === 0) {
      console.error("[CRON] Error fetching electricista service:", servicesError)
      return NextResponse.json({ error: "Electricista service not found" }, { status: 500 })
    }

    const service = services[0]
    console.log(`[CRON] Using service: ${service.name} (${service.slug})`)

    // Step 3: Find cities that don't have pages for this service yet
    // Get ALL existing page slugs that start with "electricista-"
    const { data: existingPages, error: pagesError } = await supabase
      .from("pages")
      .select("slug")
      .like("slug", "electricista-%")

    if (pagesError) {
      console.error("[CRON] Error fetching existing pages:", pagesError)
      return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
    }

    // Create set of city slugs that already have pages
    // slug format is "electricista-{city-slug}", so extract city slug
    const existingSlugs = new Set(
      existingPages?.map(p => p.slug.replace("electricista-", "")) || []
    )
    console.log(`[CRON] Existing electricista pages: ${existingSlugs.size}`)
    
    // Filter to cities without pages (by slug, not city_id)
    const citiesWithoutPages = cities.filter(city => !existingSlugs.has(city.slug))
    console.log(`[CRON] Cities without pages: ${citiesWithoutPages.length}`)

    if (citiesWithoutPages.length === 0) {
      return NextResponse.json({ 
        message: "All cities with 10,000+ population already have pages",
        generated: 0,
        totalCities: cities.length
      })
    }

    // Step 4: Shuffle and take random N cities (super aleatorio!)
    const shuffled = citiesWithoutPages
      .map(city => ({ city, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ city }) => city)
    
    const citiesToProcess = shuffled.slice(0, CITIES_PER_EXECUTION)
    console.log(`[CRON] Processing ${citiesToProcess.length} cities:`, citiesToProcess.map(c => c.name).join(", "))

    const results = {
      success: 0,
      failed: 0,
      pages: [] as string[],
      errors: [] as string[],
    }

    for (const city of citiesToProcess) {
      try {
        console.log(`[CRON] Generating page for ${service.name} in ${city.name}`)

        const pageSlug = `${service.slug}-${city.slug}`
        
        const { data: existingPage } = await supabase
          .from("pages")
          .select("id")
          .eq("slug", pageSlug)
          .single()

        if (existingPage) {
          console.log(`[CRON] Page ${pageSlug} already exists, skipping`)
          continue
        }

        // Insert page as generating
        const { data: newPage, error: insertError } = await supabase
          .from("pages")
          .insert({
            service_id: service.id,
            city_id: city.id,
            slug: pageSlug,
            status: "generating",
            sitemap_priority: 0.8,
            sitemap_changefreq: "weekly",
          })
          .select("id")
          .single()

        if (insertError || !newPage) {
          throw new Error(`Failed to create page record: ${insertError?.message}`)
        }

        // Generate content with FULL prompt (same as generate-page API)
        const content = await generateContentWithFullPrompt(
          service.name,
          city.name,
          city.province || ""
        )

        // Generate design variation (NO images - will be generated separately)
        const designVariation = generateDesignVariation(service.slug, city.slug)

        // Update page with generated content - set as DRAFT
        // ONLY columns from create-all-tables.sql
        const now = new Date().toISOString()
        const { error: updateError } = await supabase
          .from("pages")
          .update({
            // SEO (verified columns)
            title: content.title,
            meta_description: content.meta_description,
            h1: content.h1,
            h1_variant: content.h1_variant,
            highlight: content.highlight,
            
            // Contenido principal (verified columns)
            intro_text: content.intro_text,
            intro_highlight: content.highlight_variant,
            city_specific_content: content.intro_text_variant,
            content_tone: content.content_tone,
            
            // Seccion extra (verified columns)
            extra_section_type: content.extra_section?.type || null,
            extra_section_content: content.extra_section?.content || null,
            
            // CTAs (verified columns from schema)
            cta_main: content.cta_buttons?.[0]?.text || "Llamar ahora",
            cta_secondary: content.cta_buttons?.[1]?.text || "Solicitar presupuesto",
            cta_button_text: content.cta_buttons?.[2]?.text || "Contactar",
            cta_urgency: content.urgency_messages?.[0] || null,
            urgency_message: content.urgency_messages?.[1] || null,
            final_cta_title: content.final_ctas?.[0]?.title || null,
            final_cta_subtitle: content.final_ctas?.[0]?.subtitle || null,
            
            // Datos locales JSONB (verified columns)
            local_facts: content.local_facts || {},
            common_problems: content.services_list || [],
            
            // Contenido estructurado JSONB (verified columns)
            faqs: content.faqs || [],
            testimonials: content.reviews || [],
            services_offered: content.services_list || [],
            
            // Diseno JSONB (verified columns) - NO images, generate separately
            design_variation: designVariation,
            hero_image_url: null,
            gallery_images: null,
            
            // Estado (verified columns)
            is_neighborhood: content.is_neighborhood || false,
            status: "draft",
            updated_at: now,
          })
          .eq("id", newPage.id)

        if (updateError) {
          // Si falla el update, borrar la pagina para no dejarla en "generating"
          console.error(`[CRON] Update failed for ${city.name}, deleting page:`, updateError)
          await supabase.from("pages").delete().eq("id", newPage.id)
          throw updateError
        }

        results.success++
        results.pages.push(`${city.name} (${city.population?.toLocaleString()} hab)`)
        console.log(`[CRON] Successfully generated draft page for ${city.name}`)

      } catch (error) {
        console.error(`[CRON] Error generating page for ${city.name}:`, error)
        results.failed++
        results.errors.push(`${city.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
        
        // Limpiar cualquier pagina que haya quedado en generating para esta ciudad
        await supabase
          .from("pages")
          .delete()
          .eq("city_id", city.id)
          .eq("status", "generating")
      }
    }

    return NextResponse.json({
      message: `Generated ${results.success} draft pages, ${results.failed} failed`,
      ...results,
      remainingCities: citiesWithoutPages.length - results.success,
      totalCitiesWithPopulation: cities.length,
    })
    
  } catch (error) {
    console.error("[CRON] Auto-generate job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
