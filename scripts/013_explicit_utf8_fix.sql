-- Fix ALL Spanish characters explicitly
-- Albañiles
UPDATE services SET name = 'Albañiles', description = 'Servicios de albañilería: reformas, tabiques, alicatados, solados y pequeñas obras. Presupuesto sin compromiso para tu proyecto.' WHERE slug = 'albaniles';

-- Carpinteros
UPDATE services SET name = 'Carpinteros', description = 'Servicios de carpintería: instalación y reparación de muebles, puertas, armarios empotrados, tarimas y trabajos en madera.' WHERE slug = 'carpinteros';

-- Cristaleros  
UPDATE services SET name = 'Cristaleros', description = 'Servicios de cristalería: instalación de ventanas, mamparas, espejos, vidrios de seguridad y reparación de cristales rotos.' WHERE slug = 'cristaleros';

-- Técnicos de Aire Acondicionado
UPDATE services SET name = 'Técnicos de Aire Acondicionado', description = 'Servicios de climatización: instalación, reparación y mantenimiento de aire acondicionado, splits, conductos y bombas de calor.' WHERE slug = 'tecnicos-aire-acondicionado';

-- Técnicos de Calefacción
UPDATE services SET name = 'Técnicos de Calefacción', description = 'Servicios de calefacción: instalación y reparación de calderas, radiadores, suelo radiante, termos y sistemas de calefacción.' WHERE slug = 'tecnicos-calefaccion';

-- Verify
SELECT slug, name, description FROM services ORDER BY name;
