-- Fix ALL Spanish characters - complete rewrite of each service

UPDATE services SET 
  name = 'Albañiles',
  description = 'Servicios de albañilería: reformas, tabiques, alicatados, solados y pequeñas obras. Presupuesto sin compromiso para tu proyecto.'
WHERE slug = 'albanil';

UPDATE services SET 
  name = 'Carpinteros',
  description = 'Servicios de carpintería: instalación y reparación de muebles, puertas, armarios empotrados, tarimas y trabajos en madera.'
WHERE slug = 'carpintero';

UPDATE services SET 
  name = 'Cerrajeros',
  description = 'Cerrajeros profesionales disponibles 24/7. Apertura de puertas, cambio de cerraduras, instalación de cerrojos de seguridad y cajas fuertes. Servicio urgente.'
WHERE slug = 'cerrajero';

UPDATE services SET 
  name = 'Cristaleros',
  description = 'Servicios de cristalería: instalación de ventanas, mamparas, espejos, vidrios de seguridad y reparación de cristales rotos.'
WHERE slug = 'cristalero';

UPDATE services SET 
  name = 'Electricistas',
  description = 'Electricistas certificados para instalaciones, reparaciones y averías eléctricas. Cuadros eléctricos, enchufes, iluminación y certificados. Urgencias 24h.'
WHERE slug = 'electricista';

UPDATE services SET 
  name = 'Empresas de Limpieza',
  description = 'Servicios profesionales de limpieza: limpieza de hogar, oficinas, comunidades, limpiezas a fondo, cristales y mantenimiento.'
WHERE slug = 'limpieza';

UPDATE services SET 
  name = 'Fontaneros',
  description = 'Servicio profesional de fontanería 24 horas. Reparación de fugas, atascos, instalación de grifería, calentadores y calderas. Urgencias en toda España.'
WHERE slug = 'fontanero';

UPDATE services SET 
  name = 'Pintores',
  description = 'Pintores profesionales para interiores y exteriores. Pintura decorativa, lacado, eliminación de humedades y acabados de alta calidad.'
WHERE slug = 'pintor';

UPDATE services SET 
  name = 'Técnicos de Aire Acondicionado',
  description = 'Servicios de climatización: instalación, reparación y mantenimiento de aire acondicionado, splits, conductos y bombas de calor.'
WHERE slug = 'aire-acondicionado';

UPDATE services SET 
  name = 'Técnicos de Calefacción',
  description = 'Servicios de calefacción: instalación y reparación de calderas, radiadores, suelo radiante, termos y sistemas de calefacción.'
WHERE slug = 'calefaccion';

-- Verify the changes
SELECT slug, name, description FROM services ORDER BY name;
