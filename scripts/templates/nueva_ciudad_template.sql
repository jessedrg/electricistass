-- ============================================================
-- SCRIPT PARA AÑADIR UNA NUEVA CIUDAD - Electricistas 24H
-- ============================================================
-- 
-- PASOS PARA USAR ESTE SCRIPT:
-- 
-- 1. Copia este archivo y renómbralo con el nombre de la ciudad
--    Ejemplo: scripts/ciudades/017_add_valencia.sql
-- 
-- 2. Reemplaza TODOS los valores marcados con [VALOR] por los datos reales
-- 
-- 3. Ejecuta el script en Supabase SQL Editor o mediante el endpoint admin
-- 
-- 4. El cron generará automáticamente las páginas con IA
--    O puedes ejecutar manualmente: POST /api/admin/generate-pages?count=10&secret=TU_SECRET
-- 
-- ============================================================

-- ============================================================
-- PASO 1: DATOS DE LA CIUDAD (OBLIGATORIO)
-- ============================================================

INSERT INTO cities (
  name,
  slug,
  province,
  autonomous_community,
  population,
  latitude,
  longitude,
  neighborhoods,
  landmarks,
  local_context,
  city_image_url,
  monument_image_url,
  skyline_image_url,
  city_images
) VALUES (
  -- name: Nombre oficial de la ciudad (con tildes)
  '[NOMBRE_CIUDAD]',
  
  -- slug: URL amigable (sin tildes, minúsculas, guiones)
  '[slug-ciudad]',
  
  -- province: Provincia (con tildes)
  '[PROVINCIA]',
  
  -- autonomous_community: Comunidad Autónoma
  '[COMUNIDAD_AUTONOMA]',
  
  -- population: Población aproximada (número entero)
  [POBLACION],
  
  -- latitude: Latitud (decimal, ej: 39.4699)
  [LATITUD],
  
  -- longitude: Longitud (decimal, ej: -0.3763)
  [LONGITUD],
  
  -- neighborhoods: Barrios principales (JSON array con objetos)
  '[
    {"name": "[BARRIO_1]", "description": "Descripción del barrio 1"},
    {"name": "[BARRIO_2]", "description": "Descripción del barrio 2"},
    {"name": "[BARRIO_3]", "description": "Descripción del barrio 3"},
    {"name": "[BARRIO_4]", "description": "Descripción del barrio 4"},
    {"name": "[BARRIO_5]", "description": "Descripción del barrio 5"}
  ]'::jsonb,
  
  -- landmarks: Lugares conocidos (array de texto)
  ARRAY['[MONUMENTO_1]', '[MONUMENTO_2]', '[LUGAR_CONOCIDO_3]', '[LUGAR_CONOCIDO_4]'],
  
  -- local_context: Contexto local para la IA (problemas típicos, clima, tipo de viviendas)
  '[CONTEXTO_LOCAL: Describe el clima, tipo de edificios (antiguos/modernos), 
    problemas comunes de fontanería/electricidad en la zona, etc.]',
  
  -- city_image_url: Imagen principal de la ciudad (opcional)
  NULL,
  
  -- monument_image_url: Imagen del monumento principal (opcional)
  NULL,
  
  -- skyline_image_url: Imagen del skyline (opcional)
  NULL,
  
  -- city_images: Galería de imágenes (opcional)
  NULL
);

-- ============================================================
-- PASO 2: CREAR PÁGINAS PARA CADA SERVICIO (AUTOMÁTICO)
-- ============================================================
-- Este bloque crea una página pendiente para cada servicio activo

INSERT INTO pages (
  service_id,
  city_id,
  slug,
  status,
  sitemap_priority,
  sitemap_changefreq
)
SELECT 
  s.id AS service_id,
  c.id AS city_id,
  s.slug || '/' || c.slug AS slug,
  'pending' AS status,
  0.8 AS sitemap_priority,
  'weekly' AS sitemap_changefreq
FROM services s
CROSS JOIN cities c
WHERE c.slug = '[slug-ciudad]'
  AND NOT EXISTS (
    SELECT 1 FROM pages p 
    WHERE p.service_id = s.id AND p.city_id = c.id
  );

-- ============================================================
-- VERIFICACIÓN
-- ============================================================

-- Ver la ciudad creada
SELECT id, name, slug, province, population 
FROM cities 
WHERE slug = '[slug-ciudad]';

-- Ver las páginas creadas
SELECT p.slug, s.name AS servicio, p.status
FROM pages p
JOIN services s ON p.service_id = s.id
JOIN cities c ON p.city_id = c.id
WHERE c.slug = '[slug-ciudad]'
ORDER BY s.name;

-- ============================================================
-- EJEMPLO COMPLETADO: VALENCIA
-- ============================================================
-- 
-- Descomenta y ejecuta este ejemplo para ver cómo funciona:
-- 
-- INSERT INTO cities (
--   name, slug, province, autonomous_community,
--   population, latitude, longitude,
--   neighborhoods, landmarks, local_context
-- ) VALUES (
--   'Valencia',
--   'valencia',
--   'Valencia',
--   'Comunidad Valenciana',
--   800000,
--   39.4699,
--   -0.3763,
--   '[
--     {"name": "El Carmen", "description": "Casco histórico con calles estrechas y edificios antiguos"},
--     {"name": "Ruzafa", "description": "Barrio bohemio con edificios de principios del siglo XX"},
--     {"name": "Benimaclet", "description": "Zona universitaria con mezcla de viviendas"},
--     {"name": "Patraix", "description": "Barrio residencial tradicional"},
--     {"name": "Campanar", "description": "Zona moderna con edificios nuevos"}
--   ]'::jsonb,
--   ARRAY['Ciudad de las Artes y las Ciencias', 'La Lonja de la Seda', 'Catedral de Valencia', 'Mercado Central'],
--   'Valencia tiene clima mediterráneo húmedo. Los edificios del centro histórico son antiguos 
--    con instalaciones de fontanería y electricidad que requieren actualización frecuente. 
--    Los problemas más comunes son humedades por proximidad al mar, atascos en tuberías antiguas 
--    y cuadros eléctricos obsoletos. En verano hay alta demanda de aire acondicionado.'
-- );
