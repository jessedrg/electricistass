import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyAdminSession } from "@/lib/admin/auth"

// Coordenadas de ciudades españolas conocidas (fallback ampliado)
const SPANISH_CITIES_COORDS: Record<string, { lat: number; lng: number }> = {
  "madrid": { lat: 40.4168, lng: -3.7038 },
  "barcelona": { lat: 41.3851, lng: 2.1734 },
  "valencia": { lat: 39.4699, lng: -0.3763 },
  "sevilla": { lat: 37.3891, lng: -5.9845 },
  "zaragoza": { lat: 41.6488, lng: -0.8891 },
  "malaga": { lat: 36.7213, lng: -4.4214 },
  "murcia": { lat: 37.9922, lng: -1.1307 },
  "palma": { lat: 39.5696, lng: 2.6502 },
  "palma-de-mallorca": { lat: 39.5696, lng: 2.6502 },
  "bilbao": { lat: 43.2630, lng: -2.9350 },
  "alicante": { lat: 38.3452, lng: -0.4810 },
  "cordoba": { lat: 37.8882, lng: -4.7794 },
  "valladolid": { lat: 41.6523, lng: -4.7245 },
  "vigo": { lat: 42.2406, lng: -8.7207 },
  "gijon": { lat: 43.5453, lng: -5.6635 },
  "granada": { lat: 37.1773, lng: -3.5986 },
  "las-palmas-de-gran-canaria": { lat: 28.1235, lng: -15.4363 },
  "las-palmas": { lat: 28.1235, lng: -15.4363 },
  "santa-cruz-de-tenerife": { lat: 28.4636, lng: -16.2518 },
  "alcobendas": { lat: 40.5475, lng: -3.6420 },
  "hospitalet-de-llobregat": { lat: 41.3597, lng: 2.1002 },
  "getafe": { lat: 40.3088, lng: -3.7330 },
  "terrassa": { lat: 41.5631, lng: 2.0089 },
  "badalona": { lat: 41.4500, lng: 2.2474 },
  "sabadell": { lat: 41.5486, lng: 2.1075 },
  "oviedo": { lat: 43.3619, lng: -5.8494 },
  "pamplona": { lat: 42.8125, lng: -1.6458 },
  "almeria": { lat: 36.8340, lng: -2.4637 },
  "san-sebastian": { lat: 43.3183, lng: -1.9812 },
  "donostia": { lat: 43.3183, lng: -1.9812 },
  "santander": { lat: 43.4623, lng: -3.8100 },
  "burgos": { lat: 42.3439, lng: -3.6969 },
  "albacete": { lat: 38.9942, lng: -1.8564 },
  "castellon": { lat: 39.9864, lng: -0.0513 },
  "castellon-de-la-plana": { lat: 39.9864, lng: -0.0513 },
  "logrono": { lat: 42.4627, lng: -2.4449 },
  "badajoz": { lat: 38.8794, lng: -6.9706 },
  "salamanca": { lat: 40.9701, lng: -5.6635 },
  "huelva": { lat: 37.2614, lng: -6.9447 },
  "lleida": { lat: 41.6176, lng: 0.6200 },
  "tarragona": { lat: 41.1189, lng: 1.2445 },
  "leon": { lat: 42.5987, lng: -5.5671 },
  "cadiz": { lat: 36.5271, lng: -6.2886 },
  "jaen": { lat: 37.7796, lng: -3.7849 },
  "ourense": { lat: 42.3364, lng: -7.8642 },
  "girona": { lat: 41.9794, lng: 2.8214 },
  "lugo": { lat: 43.0097, lng: -7.5567 },
  "caceres": { lat: 39.4753, lng: -6.3724 },
  "a-coruna": { lat: 43.3623, lng: -8.4115 },
  "la-coruna": { lat: 43.3623, lng: -8.4115 },
  "elche": { lat: 38.2669, lng: -0.6983 },
  "cartagena": { lat: 37.6257, lng: -0.9966 },
  "jerez-de-la-frontera": { lat: 36.6850, lng: -6.1261 },
  "talavera-de-la-reina": { lat: 39.9634, lng: -4.8306 },
  "santa-coloma-de-gramenet": { lat: 41.4516, lng: 2.2080 },
  "marbella": { lat: 36.5099, lng: -4.8827 },
  "algeciras": { lat: 36.1408, lng: -5.4536 },
  "alcala-de-henares": { lat: 40.4819, lng: -3.3635 },
  "fuenlabrada": { lat: 40.2839, lng: -3.7944 },
  "leganes": { lat: 40.3281, lng: -3.7635 },
  "mostoles": { lat: 40.3223, lng: -3.8649 },
  "alcorcon": { lat: 40.3452, lng: -3.8247 },
  "pozuelo-de-alarcon": { lat: 40.4353, lng: -3.8136 },
  "torrejón-de-ardoz": { lat: 40.4603, lng: -3.4694 },
  "torrejon-de-ardoz": { lat: 40.4603, lng: -3.4694 },
  "parla": { lat: 40.2381, lng: -3.7675 },
  "coslada": { lat: 40.4242, lng: -3.5617 },
  "rivas-vaciamadrid": { lat: 40.3528, lng: -3.5417 },
  "las-rozas": { lat: 40.4928, lng: -3.8736 },
  "san-sebastian-de-los-reyes": { lat: 40.5475, lng: -3.6261 },
  "torrevieja": { lat: 37.9786, lng: -0.6822 },
  "benidorm": { lat: 38.5411, lng: -0.1225 },
  "mataró": { lat: 41.5381, lng: 2.4445 },
  "mataro": { lat: 41.5381, lng: 2.4445 },
  "reus": { lat: 41.1561, lng: 1.1069 },
  "toledo": { lat: 39.8628, lng: -4.0273 },
  "ciudad-real": { lat: 38.9848, lng: -3.9273 },
  "guadalajara": { lat: 40.6337, lng: -3.1674 },
  "cuenca": { lat: 40.0704, lng: -2.1374 },
  "pontevedra": { lat: 42.4309, lng: -8.6441 },
  "santiago-de-compostela": { lat: 42.8805, lng: -8.5459 },
  "ferrol": { lat: 43.4843, lng: -8.2328 },
  "vitoria-gasteiz": { lat: 42.8467, lng: -2.6726 },
  "vitoria": { lat: 42.8467, lng: -2.6726 },
  "aviles": { lat: 43.5547, lng: -5.9248 },
  "huesca": { lat: 42.1401, lng: -0.4089 },
  "teruel": { lat: 40.3456, lng: -1.1065 },
  "soria": { lat: 41.7636, lng: -2.4649 },
  "segovia": { lat: 40.9429, lng: -4.1088 },
  "avila": { lat: 40.6566, lng: -4.6818 },
  "zamora": { lat: 41.5034, lng: -5.7467 },
  "palencia": { lat: 42.0096, lng: -4.5288 },
  "ponferrada": { lat: 42.5499, lng: -6.5962 },
  "merida": { lat: 38.9163, lng: -6.3436 },
  "plasencia": { lat: 40.0303, lng: -6.0906 },
  "melilla": { lat: 35.2923, lng: -2.9381 },
  "ceuta": { lat: 35.8894, lng: -5.3198 },
  "ibiza": { lat: 38.9067, lng: 1.4206 },
  "mahon": { lat: 39.8858, lng: 4.2663 },
  "arrecife": { lat: 28.9630, lng: -13.5477 },
  "puerto-del-rosario": { lat: 28.5004, lng: -13.8627 },
  "san-cristobal-de-la-laguna": { lat: 28.4853, lng: -16.3156 },
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
    const { pageIds, batchSize = 100, offset = 0 } = body

    // Buscar paginas sin coordenadas (sin limite para procesar todas)
    let query = supabase
      .from("pages")
      .select("id, slug, latitude, longitude, city_id")
      .or("latitude.is.null,longitude.is.null")

    if (pageIds && pageIds.length > 0) {
      query = query.in("id", pageIds)
    }

    // Usar paginacion para procesar en lotes
    const { data: pages, error: pagesError } = await query
      .range(offset, offset + batchSize - 1)

    if (pagesError) {
      console.error("Error fetching pages:", pagesError)
      return NextResponse.json({ error: "Error obteniendo paginas: " + pagesError.message }, { status: 500 })
    }

    // Obtener las ciudades por separado
    const cityIds = [...new Set(pages?.map(p => p.city_id).filter(Boolean))]
    const { data: citiesData } = await supabase
      .from("cities")
      .select("id, name, slug, province, latitude, longitude")
      .in("id", cityIds)
    
    const citiesMap = new Map(citiesData?.map(c => [c.id, c]) || [])

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
      const city = citiesMap.get(page.city_id)
      
      // Si la ciudad ya tiene coordenadas, usarlas
      let coords: { lat: number; lng: number; zoom: number } | null = null
      let cityNameForSearch = ""
      
      if (city) {
        cityNameForSearch = city.name
        if (city.latitude && city.longitude) {
          coords = { lat: city.latitude, lng: city.longitude, zoom: 13 }
        }
      } else {
        // Extraer nombre de ciudad del slug (ej: "electricista-madrid" -> "madrid")
        const slugParts = page.slug.split("-")
        // Remover el primer elemento (nombre del servicio como "electricista")
        if (slugParts.length > 1) {
          cityNameForSearch = slugParts.slice(1).join("-")
        }
      }
      
      if (!coords && cityNameForSearch) {
        // Primero intentar buscar en el cache local
        const normalizedCity = cityNameForSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (SPANISH_CITIES_COORDS[normalizedCity]) {
          const cachedCoords = SPANISH_CITIES_COORDS[normalizedCity]
          coords = { lat: cachedCoords.lat, lng: cachedCoords.lng, zoom: 13 }
        } else {
          // Buscar coordenadas con Nominatim (solo si no esta en cache)
          const province = city?.province || undefined
          coords = await getCoordinates(cityNameForSearch.replace(/-/g, " "), province)
          
          // Solo esperar si hubo llamada a Nominatim (para respetar rate limit)
          if (coords) {
            await new Promise(r => setTimeout(r, 200)) // Reducido a 200ms
          }
        }
      }

      if (!coords) {
        results.errors.push(`${page.slug}: No se encontraron coordenadas para "${cityNameForSearch}"`)
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

      // Tambien actualizar la ciudad si existe y no tenia coordenadas
      if (city && (!city.latitude || !city.longitude)) {
        await supabase
          .from("cities")
          .update({
            latitude: coords.lat,
            longitude: coords.lng
          })
          .eq("id", city.id)
      }
    }

    // Verificar si hay mas paginas
    const { count: remainingCount } = await supabase
      .from("pages")
      .select("id", { count: "exact", head: true })
      .or("latitude.is.null,longitude.is.null")

    return NextResponse.json({
      message: "Generacion de mapas completada",
      processed: pages.length,
      updated: results.updated,
      failed: results.failed,
      errors: results.errors,
      remaining: remainingCount || 0,
      hasMore: (remainingCount || 0) > 0
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
