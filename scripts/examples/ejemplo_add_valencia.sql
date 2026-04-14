-- ============================================================
-- EJEMPLO: AÑADIR VALENCIA
-- ============================================================
-- Ejecuta este script en Supabase SQL Editor
-- o usa: POST /api/admin/execute-sql (próximamente)
-- ============================================================

-- PASO 1: Crear la ciudad
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
  local_context
) VALUES (
  'Valencia',
  'valencia',
  'Valencia',
  'Comunidad Valenciana',
  800215,
  39.4699,
  -0.3763,
  '[
    {"name": "El Carmen", "description": "Casco histórico medieval con calles estrechas y edificios del siglo XV-XVIII. Instalaciones antiguas que requieren actualización."},
    {"name": "Ruzafa", "description": "Barrio bohemio con edificios de principios del siglo XX. Mezcla de viviendas rehabilitadas y antiguas."},
    {"name": "Benimaclet", "description": "Zona universitaria con edificios de los años 60-70. Muchas instalaciones eléctricas necesitan actualización."},
    {"name": "Patraix", "description": "Barrio residencial tradicional con edificios de varias épocas."},
    {"name": "Campanar", "description": "Zona moderna junto al antiguo cauce del Turia. Edificios más nuevos."},
    {"name": "Ciutat Vella", "description": "Centro histórico con la Catedral y La Lonja. Edificios muy antiguos."},
    {"name": "L Eixample", "description": "Ensanche modernista con edificios de finales del XIX y principios del XX."},
    {"name": "Poblats Marítims", "description": "Zona costera incluyendo El Cabanyal. Problemas de humedad por cercanía al mar."}
  ]'::jsonb,
  ARRAY[
    'Ciudad de las Artes y las Ciencias',
    'La Lonja de la Seda',
    'Catedral de Valencia',
    'Mercado Central',
    'Torres de Serranos',
    'Bioparc Valencia',
    'Jardines del Turia',
    'Playa de la Malvarrosa'
  ],
  'Valencia tiene clima mediterráneo con veranos calurosos e inviernos suaves. La humedad es alta por la cercanía al mar, causando problemas de condensación y moho en viviendas. El casco histórico (El Carmen, Ciutat Vella) tiene edificios muy antiguos con tuberías de plomo y hierro que necesitan sustitución. Los problemas más frecuentes son: atascos por tuberías estrechas, fugas en instalaciones antiguas, humedades por capilaridad, y cuadros eléctricos obsoletos sin diferencial. En verano alta demanda de instalación de aire acondicionado y en invierno averías de calefacción.'
)
ON CONFLICT (slug) DO NOTHING;

-- PASO 2: Crear páginas para cada servicio
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
WHERE c.slug = 'valencia'
  AND NOT EXISTS (
    SELECT 1 FROM pages p 
    WHERE p.service_id = s.id AND p.city_id = c.id
  );

-- PASO 3: Verificar
SELECT 
  'Ciudad creada:' AS info,
  c.name, c.slug, c.province, c.population
FROM cities c WHERE c.slug = 'valencia';

SELECT 
  'Páginas creadas:' AS info,
  COUNT(*) AS total_paginas
FROM pages p
JOIN cities c ON p.city_id = c.id
WHERE c.slug = 'valencia';

-- Ver detalle de páginas
SELECT p.slug, s.name AS servicio, p.status
FROM pages p
JOIN services s ON p.service_id = s.id
JOIN cities c ON p.city_id = c.id
WHERE c.slug = 'valencia'
ORDER BY s.name;
