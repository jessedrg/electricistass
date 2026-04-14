-- Crear todas las combinaciones de servicio+ciudad como paginas pendientes
-- Esto crea 500 paginas (10 servicios x 50 ciudades)

-- Primero insertar las paginas
INSERT INTO pages (service_id, city_id, slug, title, meta_description, h1, status)
SELECT 
  s.id as service_id,
  c.id as city_id,
  s.slug || '/' || c.slug as slug,
  s.name_singular || ' en ' || c.name || ' - Servicio Profesional' as title,
  'Necesitas un ' || LOWER(s.name_singular) || ' en ' || c.name || '? Servicio profesional y de confianza. Presupuesto gratis. Cobertura en toda ' || c.name || ' y alrededores.' as meta_description,
  s.name_singular || ' en ' || c.name as h1,
  'pending' as status
FROM services s
CROSS JOIN cities c
ON CONFLICT (service_id, city_id) DO NOTHING;

-- Luego crear la cola de generacion para las paginas pendientes
INSERT INTO generation_queue (page_id, priority, scheduled_for)
SELECT 
  p.id,
  -- Prioridad: ciudades mas grandes primero
  CASE 
    WHEN c.population > 1000000 THEN 10
    WHEN c.population > 500000 THEN 8
    WHEN c.population > 300000 THEN 6
    WHEN c.population > 200000 THEN 4
    WHEN c.population > 100000 THEN 2
    ELSE 1
  END as priority,
  -- Programar escalonadamente para no saturar
  NOW() + (ROW_NUMBER() OVER (ORDER BY c.population DESC, s.slug) * INTERVAL '1 minute')
FROM pages p
JOIN services s ON p.service_id = s.id
JOIN cities c ON p.city_id = c.id
WHERE p.status = 'pending'
AND NOT EXISTS (
  SELECT 1 FROM generation_queue gq WHERE gq.page_id = p.id
)
ORDER BY c.population DESC, s.slug;
