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
  // Mas ciudades importantes
  "lhospitalet-de-llobregat": { lat: 41.3597, lng: 2.1002 },
  "l-hospitalet-de-llobregat": { lat: 41.3597, lng: 2.1002 },
  "hospitalet": { lat: 41.3597, lng: 2.1002 },
  "cornella-de-llobregat": { lat: 41.3550, lng: 2.0700 },
  "cornella": { lat: 41.3550, lng: 2.0700 },
  "sant-boi-de-llobregat": { lat: 41.3467, lng: 2.0408 },
  "sant-cugat-del-valles": { lat: 41.4736, lng: 2.0867 },
  "sant-cugat": { lat: 41.4736, lng: 2.0867 },
  "mollet-del-valles": { lat: 41.5400, lng: 2.2133 },
  "granollers": { lat: 41.6083, lng: 2.2875 },
  "manresa": { lat: 41.7286, lng: 1.8286 },
  "vic": { lat: 41.9303, lng: 2.2544 },
  "igualada": { lat: 41.5792, lng: 1.6175 },
  "vilafranca-del-penedes": { lat: 41.3458, lng: 1.6972 },
  "vendrell": { lat: 41.2167, lng: 1.5333 },
  "el-vendrell": { lat: 41.2167, lng: 1.5333 },
  "viladecans": { lat: 41.3136, lng: 2.0136 },
  "prat-de-llobregat": { lat: 41.3267, lng: 2.0947 },
  "el-prat-de-llobregat": { lat: 41.3267, lng: 2.0947 },
  "gava": { lat: 41.3050, lng: 1.9947 },
  "sitges": { lat: 41.2350, lng: 1.8119 },
  "castelldefels": { lat: 41.2800, lng: 1.9767 },
  "esplugues-de-llobregat": { lat: 41.3783, lng: 2.0886 },
  "sant-joan-despi": { lat: 41.3683, lng: 2.0556 },
  "sant-feliu-de-llobregat": { lat: 41.3833, lng: 2.0439 },
  "rubí": { lat: 41.4942, lng: 2.0328 },
  "rubi": { lat: 41.4942, lng: 2.0328 },
  "cerdanyola-del-valles": { lat: 41.4911, lng: 2.1403 },
  "ripollet": { lat: 41.4967, lng: 2.1567 },
  "montcada-i-reixac": { lat: 41.4833, lng: 2.1833 },
  "santa-coloma": { lat: 41.4516, lng: 2.2080 },
  "sant-adria-de-besos": { lat: 41.4300, lng: 2.2200 },
  "el-masnou": { lat: 41.4789, lng: 2.3147 },
  "premia-de-mar": { lat: 41.4917, lng: 2.3617 },
  "vilanova-i-la-geltru": { lat: 41.2244, lng: 1.7256 },
  "calella": { lat: 41.6142, lng: 2.6567 },
  "pineda-de-mar": { lat: 41.6275, lng: 2.6889 },
  "lloret-de-mar": { lat: 41.7000, lng: 2.8456 },
  "blanes": { lat: 41.6742, lng: 2.7903 },
  "figueres": { lat: 42.2667, lng: 2.9617 },
  "olot": { lat: 42.1828, lng: 2.4903 },
  "salt": { lat: 41.9750, lng: 2.7917 },
  "palafrugell": { lat: 41.9178, lng: 3.1636 },
  "roses": { lat: 42.2606, lng: 3.1769 },
  "palamos": { lat: 41.8481, lng: 3.1297 },
  "cambrils": { lat: 41.0667, lng: 1.0583 },
  "salou": { lat: 41.0764, lng: 1.1417 },
  "tortosa": { lat: 40.8125, lng: 0.5217 },
  "amposta": { lat: 40.7128, lng: 0.5808 },
  "valls": { lat: 41.2861, lng: 1.2494 },
  "el-ejido": { lat: 36.7764, lng: -2.8144 },
  "roquetas-de-mar": { lat: 36.7642, lng: -2.6147 },
  "nijar": { lat: 36.9667, lng: -2.2058 },
  "adra": { lat: 36.7500, lng: -3.0217 },
  "motril": { lat: 36.7500, lng: -3.5167 },
  "almunecar": { lat: 36.7336, lng: -3.6906 },
  "linares": { lat: 38.0950, lng: -3.6358 },
  "andujar": { lat: 38.0392, lng: -4.0508 },
  "ubeda": { lat: 38.0133, lng: -3.3703 },
  "baeza": { lat: 37.9939, lng: -3.4711 },
  "martos": { lat: 37.7211, lng: -3.9722 },
  "alcala-la-real": { lat: 37.4611, lng: -3.9231 },
  "dos-hermanas": { lat: 37.2833, lng: -5.9222 },
  "alcala-de-guadaira": { lat: 37.3383, lng: -5.8392 },
  "utrera": { lat: 37.1833, lng: -5.7833 },
  "ecija": { lat: 37.5417, lng: -5.0825 },
  "carmona": { lat: 37.4717, lng: -5.6417 },
  "moron-de-la-frontera": { lat: 37.1217, lng: -5.4508 },
  "sanlucar-de-barrameda": { lat: 36.7778, lng: -6.3514 },
  "el-puerto-de-santa-maria": { lat: 36.5933, lng: -6.2322 },
  "chiclana-de-la-frontera": { lat: 36.4192, lng: -6.1467 },
  "puerto-real": { lat: 36.5283, lng: -6.1886 },
  "la-linea-de-la-concepcion": { lat: 36.1717, lng: -5.3486 },
  "ronda": { lat: 36.7461, lng: -5.1611 },
  "estepona": { lat: 36.4267, lng: -5.1458 },
  "fuengirola": { lat: 36.5400, lng: -4.6250 },
  "benalmadena": { lat: 36.5983, lng: -4.5167 },
  "torremolinos": { lat: 36.6217, lng: -4.4989 },
  "mijas": { lat: 36.5958, lng: -4.6372 },
  "velez-malaga": { lat: 36.7844, lng: -4.1014 },
  "rincon-de-la-victoria": { lat: 36.7133, lng: -4.2758 },
  "antequera": { lat: 37.0194, lng: -4.5614 },
  "lorca": { lat: 37.6717, lng: -1.7008 },
  "molina-de-segura": { lat: 38.0550, lng: -1.2122 },
  "alcantarilla": { lat: 37.9692, lng: -1.2142 },
  "cieza": { lat: 38.2392, lng: -1.4214 },
  "yecla": { lat: 38.6133, lng: -1.1136 },
  "jumilla": { lat: 38.4789, lng: -1.3250 },
  "aguilas": { lat: 37.4067, lng: -1.5833 },
  "mazarron": { lat: 37.5986, lng: -1.3147 },
  "san-javier": { lat: 37.8072, lng: -0.8375 },
  "torre-pacheco": { lat: 37.7428, lng: -0.9533 },
  "orihuela": { lat: 38.0847, lng: -0.9444 },
  "elda": { lat: 38.4789, lng: -0.7936 },
  "petrer": { lat: 38.4847, lng: -0.7722 },
  "alcoy": { lat: 38.7056, lng: -0.4736 },
  "denia": { lat: 38.8408, lng: 0.1058 },
  "javea": { lat: 38.7875, lng: 0.1656 },
  "xativa": { lat: 38.9903, lng: -0.5186 },
  "gandia": { lat: 38.9678, lng: -0.1811 },
  "ontinyent": { lat: 38.8219, lng: -0.6067 },
  "sagunto": { lat: 39.6797, lng: -0.2656 },
  "requena": { lat: 39.4878, lng: -1.1003 },
  "manises": { lat: 39.4925, lng: -0.4614 },
  "mislata": { lat: 39.4756, lng: -0.4181 },
  "quart-de-poblet": { lat: 39.4828, lng: -0.4417 },
  "aldaia": { lat: 39.4653, lng: -0.4603 },
  "xirivella": { lat: 39.4650, lng: -0.4267 },
  "burjassot": { lat: 39.5092, lng: -0.4131 },
  "paterna": { lat: 39.5028, lng: -0.4406 },
  "alboraya": { lat: 39.5003, lng: -0.3528 },
  "irun": { lat: 43.3378, lng: -1.7886 },
  "hondarribia": { lat: 43.3636, lng: -1.7961 },
  "eibar": { lat: 43.1847, lng: -2.4722 },
  "zarautz": { lat: 43.2836, lng: -2.1697 },
  "tolosa": { lat: 43.1350, lng: -2.0761 },
  "hernani": { lat: 43.2656, lng: -1.9764 },
  "errenteria": { lat: 43.3119, lng: -1.9017 },
  "renteria": { lat: 43.3119, lng: -1.9017 },
  "barakaldo": { lat: 43.2956, lng: -2.9897 },
  "getxo": { lat: 43.3567, lng: -3.0117 },
  "portugalete": { lat: 43.3206, lng: -3.0206 },
  "santurtzi": { lat: 43.3283, lng: -3.0319 },
  "basauri": { lat: 43.2367, lng: -2.8856 },
  "galdakao": { lat: 43.2319, lng: -2.8436 },
  "durango": { lat: 43.1703, lng: -2.6336 },
  "leioa": { lat: 43.3283, lng: -2.9897 },
  "erandio": { lat: 43.3100, lng: -2.9728 },
  "santurce": { lat: 43.3283, lng: -3.0319 },
  "sestao": { lat: 43.3092, lng: -3.0067 },
  "tudela": { lat: 42.0617, lng: -1.6053 },
  "barañain": { lat: 42.8022, lng: -1.6717 },
  "burlada": { lat: 42.8278, lng: -1.6167 },
  "estella": { lat: 42.6714, lng: -2.0306 },
  "ansoain": { lat: 42.8333, lng: -1.6333 },
  "tafalla": { lat: 42.5272, lng: -1.6742 },
  "ordizia": { lat: 43.0542, lng: -2.1767 },
  "azpeitia": { lat: 43.1819, lng: -2.2656 },
  "mondragon": { lat: 43.0647, lng: -2.4903 },
  "arrasate": { lat: 43.0647, lng: -2.4903 },
  "bergara": { lat: 43.1186, lng: -2.4133 },
  "telde": { lat: 27.9947, lng: -15.4178 },
  "santa-lucia-de-tirajana": { lat: 27.9117, lng: -15.5406 },
  "san-bartolome-de-tirajana": { lat: 27.9256, lng: -15.5731 },
  "arucas": { lat: 28.1197, lng: -15.5228 },
  "ingenio": { lat: 27.9194, lng: -15.4339 },
  "aguimes": { lat: 27.9047, lng: -15.4458 },
  "galdar": { lat: 28.1467, lng: -15.6500 },
  "la-laguna": { lat: 28.4853, lng: -16.3156 },
  "arona": { lat: 28.0994, lng: -16.6811 },
  "adeje": { lat: 28.1225, lng: -16.7261 },
  "granadilla-de-abona": { lat: 28.1175, lng: -16.5750 },
  "la-orotava": { lat: 28.3906, lng: -16.5231 },
  "puerto-de-la-cruz": { lat: 28.4147, lng: -16.5489 },
  "los-realejos": { lat: 28.3728, lng: -16.5906 },
  "icod-de-los-vinos": { lat: 28.3675, lng: -16.7167 },
  "candelaria": { lat: 28.3544, lng: -16.3728 },
  "guia-de-isora": { lat: 28.2111, lng: -16.7789 },
  "tacoronte": { lat: 28.4761, lng: -16.4103 },
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
      
      // Primero intentar obtener nombre de ciudad de la relacion
      if (city?.name) {
        cityNameForSearch = city.name
        if (city.latitude && city.longitude) {
          coords = { lat: city.latitude, lng: city.longitude, zoom: 13 }
        }
      }
      
      // Si no hay ciudad o no tiene nombre, extraer del slug
      if (!cityNameForSearch && page.slug) {
        // Extraer nombre de ciudad del slug (ej: "electricista-madrid" -> "madrid")
        // Soporta multiples formatos: "electricista-las-palmas-de-gran-canaria", "fontanero-bilbao"
        const slugParts = page.slug.split("-")
        if (slugParts.length > 1) {
          // Remover el primer elemento (nombre del servicio)
          cityNameForSearch = slugParts.slice(1).join("-")
        }
      }
      
      // Si aun no hay nombre, intentar con el slug completo
      if (!cityNameForSearch) {
        cityNameForSearch = page.slug || ""
      }
      
      if (!cityNameForSearch) {
        results.errors.push(`${page.slug}: No se pudo determinar la ciudad`)
        results.failed++
        continue
      }
      
      if (!coords) {
        // Primero intentar buscar en el cache local
        const normalizedCity = cityNameForSearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        
        // Buscar coincidencia exacta primero
        if (SPANISH_CITIES_COORDS[normalizedCity]) {
          const cachedCoords = SPANISH_CITIES_COORDS[normalizedCity]
          coords = { lat: cachedCoords.lat, lng: cachedCoords.lng, zoom: 13 }
        } else {
          // Buscar coincidencia parcial (por si el slug tiene mas info)
          const cityKeys = Object.keys(SPANISH_CITIES_COORDS)
          const partialMatch = cityKeys.find(key => normalizedCity.includes(key) || key.includes(normalizedCity))
          
          if (partialMatch) {
            const cachedCoords = SPANISH_CITIES_COORDS[partialMatch]
            coords = { lat: cachedCoords.lat, lng: cachedCoords.lng, zoom: 13 }
          } else {
            // Buscar coordenadas con Nominatim (solo si no esta en cache)
            const searchTerm = cityNameForSearch.replace(/-/g, " ")
            const province = city?.province || undefined
            coords = await getCoordinates(searchTerm, province)
            
            // Solo esperar si hubo llamada a Nominatim (para respetar rate limit)
            if (coords) {
              await new Promise(r => setTimeout(r, 200))
            }
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
