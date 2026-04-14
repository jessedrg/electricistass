-- Actualizar los servicios principales con mejores descripciones
-- Centrado en fontanería, cerrajería y electricidad

UPDATE services SET 
  description = 'Servicio profesional de fontanería 24 horas. Reparación de fugas, atascos, instalación de grifería, calentadores y calderas. Urgencias en toda España.',
  hero_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=900&fit=crop'
WHERE slug = 'fontanero';

UPDATE services SET 
  description = 'Cerrajeros profesionales disponibles 24/7. Apertura de puertas, cambio de cerraduras, instalación de cerrojos de seguridad y cajas fuertes. Servicio urgente.',
  hero_image_url = 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1600&h=900&fit=crop'
WHERE slug = 'cerrajero';

UPDATE services SET 
  description = 'Electricistas certificados para instalaciones, reparaciones y averías eléctricas. Cuadros eléctricos, enchufes, iluminación y certificados. Urgencias 24h.',
  hero_image_url = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1600&h=900&fit=crop'
WHERE slug = 'electricista';

-- Actualizar otros servicios con descripciones mejoradas
UPDATE services SET 
  description = 'Técnicos en climatización: instalación y reparación de aire acondicionado, calderas y sistemas de calefacción. Mantenimiento preventivo incluido.'
WHERE slug = 'climatizacion';

UPDATE services SET 
  description = 'Pintores profesionales para interiores y exteriores. Pintura decorativa, lacado, eliminación de humedades y acabados de alta calidad.'
WHERE slug = 'pintor';

UPDATE services SET 
  description = 'Servicios de albañilería: reformas, tabiques, alicatados, solados y pequeñas obras. Presupuesto sin compromiso para tu proyecto.'
WHERE slug = 'albanil';

-- Asegurar que los servicios principales tienen prioridad (orden)
UPDATE services SET name = 'Fontanero' WHERE slug = 'fontanero';
UPDATE services SET name = 'Electricista' WHERE slug = 'electricista';  
UPDATE services SET name = 'Cerrajero' WHERE slug = 'cerrajero';
