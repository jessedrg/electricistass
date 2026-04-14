-- Script para arreglar TODOS los caracteres españoles en servicios

-- Albañiles
UPDATE services SET 
  name = 'Albañiles',
  description = 'Servicios de albañilería: reformas, tabiques, alicatados, solados y pequeñas obras. Presupuesto sin compromiso para tu proyecto.'
WHERE slug = 'albaniles';

-- Carpinteros  
UPDATE services SET
  description = 'Servicios de carpintería: instalación y reparación de muebles, puertas, armarios empotrados, tarimas y trabajos en madera.'
WHERE slug = 'carpinteros';

-- Cristaleros
UPDATE services SET
  description = 'Servicios de cristalería: instalación de ventanas, mamparas, espejos, vidrios de seguridad y reparación de cristales rotos.'
WHERE slug = 'cristaleros';

-- Técnicos de Aire Acondicionado
UPDATE services SET
  name = 'Técnicos de Aire Acondicionado',
  description = 'Servicios de climatización: instalación, reparación y mantenimiento de aire acondicionado, splits, conductos y bombas de calor.'
WHERE slug = 'tecnicos-aire-acondicionado';

-- Técnicos de Calefacción (ya correcto pero verificar)
UPDATE services SET
  name = 'Técnicos de Calefacción',
  description = 'Servicios de calefacción: instalación y reparación de calderas, radiadores, suelo radiante, termos y sistemas de calefacción.'
WHERE slug = 'tecnicos-calefaccion';

-- Fontanero (verificar)
UPDATE services SET
  description = 'Servicio profesional de fontanería 24 horas. Reparación de fugas, atascos, instalación de grifería, calentadores y calderas. Urgencias en toda España.'
WHERE slug = 'fontanero';

-- Electricista (verificar)
UPDATE services SET
  description = 'Electricistas certificados para instalaciones, reparaciones y averías eléctricas. Cuadros eléctricos, enchufes, iluminación y certificados. Urgencias 24h.'
WHERE slug = 'electricista';

-- Cerrajero (verificar)
UPDATE services SET
  description = 'Cerrajeros profesionales disponibles 24/7. Apertura de puertas, cambio de cerraduras, instalación de cerrojos de seguridad y cajas fuertes. Servicio urgente.'
WHERE slug = 'cerrajero';

-- Verificar resultado
SELECT name, description FROM services ORDER BY name;
