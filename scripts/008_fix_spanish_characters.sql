-- Fix Spanish characters (ñ, tildes) in services table
-- Albañiles
UPDATE services SET 
  name = 'Albañiles',
  description = 'Servicios de albañilería: reformas, tabiques, alicatados, solados y pequeñas obras. Presupuesto sin compromiso para tu proyecto.'
WHERE slug = 'albaniles';

-- Carpinteros
UPDATE services SET 
  description = 'Servicios de carpintería: instalación y reparación de muebles, puertas, armarios empotrados, tarimas y trabajos en madera.'
WHERE slug = 'carpinteros';

-- Cerrajero
UPDATE services SET 
  description = 'Cerrajeros profesionales disponibles 24/7. Apertura de puertas, cambio de cerraduras, instalación de cerrojos de seguridad y cajas fuertes. Servicio urgente.'
WHERE slug = 'cerrajero';

-- Cristaleros
UPDATE services SET 
  description = 'Servicios de cristalería: instalación de ventanas, mamparas, espejos, vidrios de seguridad y reparación de cristales rotos.'
WHERE slug = 'cristaleros';

-- Electricista
UPDATE services SET 
  description = 'Electricistas certificados para instalaciones, reparaciones y averías eléctricas. Cuadros eléctricos, enchufes, iluminación y certificados. Urgencias 24h.'
WHERE slug = 'electricista';

-- Empresas de Limpieza
UPDATE services SET 
  description = 'Servicios profesionales de limpieza: limpieza de hogar, oficinas, comunidades, limpiezas a fondo, cristales y mantenimiento.'
WHERE slug = 'limpieza';

-- Fontanero
UPDATE services SET 
  description = 'Servicio profesional de fontanería 24 horas. Reparación de fugas, atascos, instalación de grifería, calentadores y calderas. Urgencias en toda España.'
WHERE slug = 'fontanero';

-- Pintores
UPDATE services SET 
  description = 'Pintores profesionales para interiores y exteriores. Pintura decorativa, lacado, eliminación de humedades y acabados de alta calidad.'
WHERE slug = 'pintores';

-- Técnicos de Aire Acondicionado
UPDATE services SET 
  name = 'Técnicos de Aire Acondicionado',
  description = 'Servicios de climatización: instalación, reparación y mantenimiento de aire acondicionado, splits, conductos y bombas de calor.'
WHERE slug = 'climatizacion';

-- Técnicos de Calefacción
UPDATE services SET 
  name = 'Técnicos de Calefacción',
  description = 'Servicios de calefacción: instalación y reparación de calderas, radiadores, suelo radiante, termos y sistemas de calefacción.'
WHERE slug = 'calefaccion';

-- Verify the updates
SELECT name, description FROM services ORDER BY name;
