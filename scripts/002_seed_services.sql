-- Seed: 10 servicios del hogar

INSERT INTO services (slug, name, name_singular, description, icon, keywords) VALUES
(
  'fontanero',
  'Fontaneros',
  'Fontanero',
  'Servicios profesionales de fontaneria: reparacion de tuberias, instalacion de grifos, desatascos, deteccion de fugas y mantenimiento de sistemas de agua.',
  'droplet',
  ARRAY['fontanero', 'fontaneria', 'plomero', 'tuberias', 'desatasco', 'fugas', 'grifos']
),
(
  'electricista',
  'Electricistas',
  'Electricista',
  'Servicios de electricidad: instalaciones electricas, reparacion de averias, cuadros electricos, iluminacion y certificados electricos.',
  'zap',
  ARRAY['electricista', 'electricidad', 'instalacion electrica', 'averias', 'cuadro electrico']
),
(
  'cerrajero',
  'Cerrajeros',
  'Cerrajero',
  'Servicios de cerrajeria: apertura de puertas, cambio de cerraduras, instalacion de bombillos de seguridad y sistemas de acceso.',
  'key',
  ARRAY['cerrajero', 'cerrajeria', 'cerraduras', 'llaves', 'puertas', 'seguridad']
),
(
  'pintor',
  'Pintores',
  'Pintor',
  'Servicios de pintura profesional: pintura de interiores y exteriores, lacado, empapelado, tratamiento de humedades y acabados decorativos.',
  'paintbrush',
  ARRAY['pintor', 'pintura', 'decoracion', 'paredes', 'fachadas', 'lacado']
),
(
  'albanil',
  'Albaniles',
  'Albanil',
  'Servicios de albanileria: reformas, construccion, alicatados, solados, tabiques, reparacion de fachadas y trabajos de obra.',
  'hard-hat',
  ARRAY['albanil', 'albanileria', 'reformas', 'obra', 'construccion', 'alicatado']
),
(
  'carpintero',
  'Carpinteros',
  'Carpintero',
  'Servicios de carpinteria: instalacion y reparacion de muebles, puertas, armarios empotrados, tarimas y trabajos en madera.',
  'hammer',
  ARRAY['carpintero', 'carpinteria', 'muebles', 'madera', 'armarios', 'puertas']
),
(
  'cristalero',
  'Cristaleros',
  'Cristalero',
  'Servicios de cristaleria: instalacion de ventanas, mamparas, espejos, vidrios de seguridad y reparacion de cristales rotos.',
  'square',
  ARRAY['cristalero', 'cristaleria', 'ventanas', 'cristales', 'vidrios', 'mamparas']
),
(
  'aire-acondicionado',
  'Tecnicos de Aire Acondicionado',
  'Tecnico de Aire Acondicionado',
  'Servicios de climatizacion: instalacion, reparacion y mantenimiento de aire acondicionado, splits, conductos y bombas de calor.',
  'wind',
  ARRAY['aire acondicionado', 'climatizacion', 'split', 'refrigeracion', 'bomba de calor']
),
(
  'calefaccion',
  'Tecnicos de Calefaccion',
  'Tecnico de Calefaccion',
  'Servicios de calefaccion: instalacion y reparacion de calderas, radiadores, suelo radiante, termos y sistemas de calefaccion.',
  'flame',
  ARRAY['calefaccion', 'calderas', 'radiadores', 'gas', 'termos', 'suelo radiante']
),
(
  'limpieza',
  'Empresas de Limpieza',
  'Empresa de Limpieza',
  'Servicios profesionales de limpieza: limpieza de hogar, oficinas, comunidades, limpiezas a fondo, cristales y mantenimiento.',
  'sparkles',
  ARRAY['limpieza', 'limpiador', 'hogar', 'oficinas', 'comunidades', 'mantenimiento']
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  name_singular = EXCLUDED.name_singular,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  keywords = EXCLUDED.keywords;
