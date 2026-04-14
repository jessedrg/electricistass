import { generateText, Output } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminSession } from '@/lib/admin/auth'

const cityDataSchema = z.object({
  name: z.string().describe('City name properly capitalized'),
  province: z.string().describe('Province name in Spain'),
  autonomous_community: z.string().describe('Autonomous community in Spain (e.g., Cataluña, Madrid, Andalucía)'),
  population: z.number().describe('Approximate population'),
  latitude: z.number().describe('Latitude coordinate'),
  longitude: z.number().describe('Longitude coordinate'),
  local_context: z.string().describe('Brief description of the city in Spanish, 1-2 sentences about local context'),
})

export async function POST(req: Request) {
  const isValid = await verifyAdminSession()
  if (!isValid) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { cityName } = await req.json()

    if (!cityName) {
      return Response.json({ error: 'Nombre de ciudad requerido' }, { status: 400 })
    }

    // Generate city data with AI
    const { output } = await generateText({
      model: 'anthropic/claude-opus-4',
      output: Output.object({
        schema: cityDataSchema,
      }),
      messages: [
        {
          role: 'user',
          content: `Proporciona datos reales y precisos sobre la ciudad "${cityName}" en España.

Si es una ciudad conocida, usa datos reales.
Si es un pueblo pequeño o localidad menor, estima los datos de forma realista.

Necesito:
- Nombre correctamente escrito y capitalizado
- Provincia a la que pertenece
- Comunidad autónoma (autonomous_community): Cataluña, Madrid, Andalucía, etc.
- Población aproximada
- Coordenadas GPS exactas (latitud y longitud)
- Contexto local (local_context): breve descripción en español sobre la ciudad

Responde con datos precisos y reales de España.`
        }
      ],
    })

    if (!output) {
      return Response.json({ error: 'No se pudieron generar datos de la ciudad' }, { status: 500 })
    }

    // Create slug from city name
    const slug = output.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Save to database
    const supabase = await createClient()
    const { data: city, error } = await supabase
      .from('cities')
      .insert({
        name: output.name,
        slug,
        province: output.province,
        autonomous_community: output.autonomous_community,
        population: output.population,
        latitude: output.latitude,
        longitude: output.longitude,
        local_context: output.local_context,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating city:', error)
      return Response.json({ error: 'Error al crear la ciudad: ' + error.message }, { status: 500 })
    }

    return Response.json({ city })
  } catch (error) {
    console.error('Error generating city:', error)
    return Response.json({ error: 'Error al generar datos de la ciudad' }, { status: 500 })
  }
}
