import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

// Coordenadas de ciudades españolas conocidas (fallback)
const SPANISH_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  "madrid": { lat: 40.4168, lng: -3.7038 },
  "barcelona": { lat: 41.3851, lng: 2.1734 },
  "valencia": { lat: 39.4699, lng: -0.3763 },
  "sevilla": { lat: 37.3891, lng: -5.9845 },
  "zaragoza": { lat: 41.6488, lng: -0.8891 },
  "malaga": { lat: 36.7213, lng: -4.4214 },
  "murcia": { lat: 37.9922, lng: -1.1307 },
  "palma": { lat: 39.5696, lng: 2.6502 },
  "bilbao": { lat: 43.2630, lng: -2.9350 },
  "alicante": { lat: 38.3452, lng: -0.4810 },
  "cordoba": { lat: 37.8882, lng: -4.7794 },
  "valladolid": { lat: 41.6523, lng: -4.7245 },
  "vigo": { lat: 42.2406, lng: -8.7207 },
  "gijon": { lat: 43.5453, lng: -5.6635 },
  "granada": { lat: 37.1773, lng: -3.5986 },
}

// Funcion para obtener coordenadas usando Nominatim (OpenStreetMap)
async function getCoordinates(cityName: string, province?: string): Promise<{ lat: number; lng: number; zoom: number } | null> {
  try {
    // Primero buscar en nuestro cache
    const normalizedCity = cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    if (SPANISH_CITIES_COORDS[normalizedCity]) {
      const coords = SPANISH_CITIES_COORDS[normalizedCity]
      return { lat: coords.lat, lng: coords.lng, zoom: 13 }
    }

    // Usar Nominatim API (gratuito, sin API key)
    const searchQuery = province 
      ? `${cityName}, ${province}, Spain`
      : `${cityName}, Spain`
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'ElectricistasApp/1.0'
        }
      }
    )

    if (!response.ok) {
      console.error(`Nominatim error for ${cityName}:`, response.status)
      return null
    }

    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        zoom: 13 // Zoom por defecto para ciudades
      }
    }

    return null
  } catch (error) {
    console.error(`Error getting coordinates for ${cityName}:`, error)
    return null
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    const body = await request.json()
    const { pageIds } = body // Si se pasan IDs especificos, solo procesar esos

    // Buscar paginas sin coordenadas
    let query = supabase
      .from("pages")
      .select(`
        id,
        slug,
        latitude,
        longitude,
        cities (
          id,
          name,
          slug,
          province,
          latitude,
          longitude
        )
      `)
      .or("latitude.is.null,longitude.is.null")

    if (pageIds && pageIds.length > 0) {
      query = query.in("id", pageIds)
    }

    const { data: pages, error: pagesError } = await query.limit(50)

    if (pagesError) {
      console.error("Error fetching pages:", pagesError)
      return NextResponse.json({ error: "Error obteniendo paginas" }, { status: 500 })
    }

    if (!pages || pages.length === 0) {
      return NextResponse.json({ 
        message: "Todas las paginas ya tienen coordenadas",
        updated: 0,
        total: 0
      })
    }

    const results = {
      updated: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const page of pages) {
      const city = page.cities as { id: string; name: string; slug: string; province: string | null; latitude: number | null; longitude: number | null } | null
      
      if (!city) {
        results.errors.push(`${page.slug}: No tiene ciudad asociada`)
        results.failed++
        continue
      }

      // Si la ciudad ya tiene coordenadas, usarlas
      let coords: { lat: number; lng: number; zoom: number } | null = null
      
      if (city.latitude && city.longitude) {
        coords = { lat: city.latitude, lng: city.longitude, zoom: 13 }
      } else {
        // Buscar coordenadas con Nominatim
        coords = await getCoordinates(city.name, city.province || undefined)
        
        // Esperar un poco para no sobrecargar Nominatim (limite de 1 request/segundo)
        await new Promise(r => setTimeout(r, 1100))
      }

      if (!coords) {
        results.errors.push(`${page.slug}: No se encontraron coordenadas para ${city.name}`)
        results.failed++
        continue
      }

      // Actualizar pagina con coordenadas
      const { error: updateError } = await supabase
        .from("pages")
        .update({
          latitude: coords.lat,
          longitude: coords.lng,
          show_map: true
        })
        .eq("id", page.id)

      if (updateError) {
        results.errors.push(`${page.slug}: Error actualizando - ${updateError.message}`)
        results.failed++
      } else {
        results.updated++
      }

      // Tambien actualizar la ciudad si no tenia coordenadas
      if (!city.latitude || !city.longitude) {
        await supabase
          .from("cities")
          .update({
            latitude: coords.lat,
            longitude: coords.lng
          })
          .eq("id", city.id)
      }
    }

    return NextResponse.json({
      message: "Generacion de mapas completada",
      total: pages.length,
      updated: results.updated,
      failed: results.failed,
      errors: results.errors
    })

  } catch (error) {
    console.error("Error generating maps:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 })
  }
}

// GET para verificar cuantas paginas necesitan coordenadas
export async function GET() {
  const isAdmin = await verifyAdminSession()
  if (!isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const supabase = await createClient()

  const { count, error } = await supabase
    .from("pages")
    .select("id", { count: "exact", head: true })
    .or("latitude.is.null,longitude.is.null")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    pagesWithoutMaps: count || 0 
  })
}
