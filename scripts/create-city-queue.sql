-- ============================================
-- COLA DE GENERACION DE CIUDADES
-- ============================================
-- Tabla para gestionar la cola de ciudades pendientes de generar
-- El cron coge de aquí en orden y marca como completada

-- Crear tabla de cola de ciudades
CREATE TABLE IF NOT EXISTS city_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ciudad info
  city_name TEXT NOT NULL,
  city_slug TEXT NOT NULL,
  province TEXT,
  population INTEGER DEFAULT 0,
  
  -- Servicio (para generar multiples servicios por ciudad)
  service_slug TEXT NOT NULL DEFAULT 'electricista',
  
  -- Estado de la cola
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
  priority INTEGER DEFAULT 0, -- Mayor numero = mayor prioridad
  
  -- Tracking
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  
  -- Resultado
  generated_page_id UUID,
  generated_page_slug TEXT,
  
  -- Evitar duplicados
  UNIQUE(city_slug, service_slug)
);

-- Indices para queries eficientes
CREATE INDEX IF NOT EXISTS idx_city_queue_status ON city_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_city_queue_priority ON city_generation_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_city_queue_service ON city_generation_queue(service_slug);
CREATE INDEX IF NOT EXISTS idx_city_queue_pending ON city_generation_queue(status, priority DESC) WHERE status = 'pending';

-- ============================================
-- POBLAR COLA CON CIUDADES DE ESPAÑA (+10,000 hab)
-- ============================================
-- Insertar ciudades que NO tienen pagina de electricista todavia

INSERT INTO city_generation_queue (city_name, city_slug, province, population, service_slug, priority)
SELECT 
  c.name,
  c.slug,
  c.province,
  c.population,
  'electricista',
  -- Prioridad basada en poblacion (ciudades grandes primero)
  CASE 
    WHEN c.population >= 500000 THEN 100
    WHEN c.population >= 200000 THEN 80
    WHEN c.population >= 100000 THEN 60
    WHEN c.population >= 50000 THEN 40
    WHEN c.population >= 20000 THEN 20
    ELSE 10
  END as priority
FROM cities c
WHERE c.population >= 10000
  AND c.province IS NOT NULL
  -- Excluir las que ya tienen pagina
  AND NOT EXISTS (
    SELECT 1 FROM pages p 
    WHERE p.slug = 'electricista-' || c.slug
  )
ON CONFLICT (city_slug, service_slug) DO NOTHING;

-- Mostrar estadisticas
SELECT 
  status,
  COUNT(*) as total,
  SUM(population) as total_population
FROM city_generation_queue
GROUP BY status;
