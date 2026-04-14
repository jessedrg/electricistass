-- Seed: Top 50 ciudades de Espana con datos enriquecidos

INSERT INTO cities (slug, name, province, autonomous_community, latitude, longitude, population, neighborhoods, local_context) VALUES
('madrid', 'Madrid', 'Madrid', 'Comunidad de Madrid', 40.4168, -3.7038, 3223334, 
  '[{"name": "Chamberi", "description": "Barrio residencial con edificios historicos"}, {"name": "Salamanca", "description": "Zona exclusiva con comercios de lujo"}, {"name": "Lavapies", "description": "Barrio multicultural y bohemio"}, {"name": "Malasana", "description": "Zona alternativa con vida nocturna"}, {"name": "Retiro", "description": "Barrio tranquilo junto al parque"}, {"name": "Usera", "description": "Barrio en expansion con gran comunidad china"}, {"name": "Vallecas", "description": "Barrio obrero con fuerte identidad"}, {"name": "Moncloa", "description": "Zona universitaria"}, {"name": "Tetuan", "description": "Barrio diverso en transformacion"}, {"name": "Chamartin", "description": "Zona de negocios y residencial"}]',
  'Capital de Espana con clima continental. Edificios antiguos del siglo XIX-XX predominan en el centro, con problemas frecuentes de tuberias antiguas de plomo y sistemas electricos obsoletos. Veranos muy calurosos que exigen buen mantenimiento del aire acondicionado.'),

('barcelona', 'Barcelona', 'Barcelona', 'Cataluna', 41.3851, 2.1734, 1620343,
  '[{"name": "Eixample", "description": "Barrio modernista con edificios de Gaudi"}, {"name": "Gracia", "description": "Ambiente de pueblo con plazas"}, {"name": "Born", "description": "Barrio historico con tiendas artesanales"}, {"name": "Barceloneta", "description": "Barrio marinero junto a la playa"}, {"name": "Sants", "description": "Barrio obrero con buenas conexiones"}, {"name": "Sant Andreu", "description": "Barrio familiar del norte"}, {"name": "Horta", "description": "Zona residencial en la montana"}, {"name": "Poble Sec", "description": "Barrio en auge cerca de Montjuic"}, {"name": "Les Corts", "description": "Zona del Camp Nou"}, {"name": "Sarria", "description": "Barrio residencial de alto nivel"}]',
  'Ciudad mediterranea con alta humedad. Los edificios modernistas requieren mantenimiento especializado. Problemas comunes de humedad en fachadas y sistemas de ventilacion en pisos interiores.'),

('valencia', 'Valencia', 'Valencia', 'Comunidad Valenciana', 39.4699, -0.3763, 791413,
  '[{"name": "Ciutat Vella", "description": "Centro historico con edificios antiguos"}, {"name": "Russafa", "description": "Barrio de moda con ambiente alternativo"}, {"name": "El Carmen", "description": "Zona bohemia con vida nocturna"}, {"name": "Benimaclet", "description": "Barrio universitario"}, {"name": "Poblats Maritims", "description": "Zona de playa"}, {"name": "Campanar", "description": "Barrio residencial moderno"}, {"name": "Patraix", "description": "Barrio familiar"}, {"name": "Exposicio", "description": "Zona cerca de la Ciudad de las Artes"}, {"name": "Benicalap", "description": "Barrio en expansion"}, {"name": "Quatre Carreres", "description": "Zona mixta residencial"}]',
  'Clima mediterraneo con veranos calurosos. La proximidad al mar causa problemas de corrosion en instalaciones metalicas. Muchos edificios del boom inmobiliario de los 2000.'),

('sevilla', 'Sevilla', 'Sevilla', 'Andalucia', 37.3891, -5.9845, 684234,
  '[{"name": "Triana", "description": "Barrio flamenco con caracter propio"}, {"name": "Santa Cruz", "description": "Antiguo barrio judio, muy turistico"}, {"name": "Macarena", "description": "Barrio popular con tradicion"}, {"name": "Nervion", "description": "Zona comercial moderna"}, {"name": "Los Remedios", "description": "Barrio residencial de clase media-alta"}, {"name": "Alameda", "description": "Zona de ocio y restaurantes"}, {"name": "San Bernardo", "description": "Barrio obrero historico"}, {"name": "Heliopolis", "description": "Urbanizacion exclusiva"}]',
  'Veranos extremadamente calurosos (mas de 40C). El aire acondicionado es esencial. Casas con patios interiores tipicos. Problemas de cal en el agua que afecta a tuberias y electrodomesticos.'),

('zaragoza', 'Zaragoza', 'Zaragoza', 'Aragon', 41.6488, -0.8891, 674997,
  '[{"name": "Casco Historico", "description": "Centro antiguo con edificios historicos"}, {"name": "Delicias", "description": "Barrio obrero muy poblado"}, {"name": "Actur", "description": "Barrio moderno de la Expo 2008"}, {"name": "San Jose", "description": "Barrio residencial"}, {"name": "Las Fuentes", "description": "Barrio obrero tradicional"}, {"name": "Torrero", "description": "Zona residencial tranquila"}, {"name": "Universidad", "description": "Zona estudiantil"}, {"name": "Romareda", "description": "Barrio del estadio de futbol"}]',
  'Clima continental con el famoso cierzo (viento fuerte). Inviernos frios y veranos calurosos. El viento causa problemas en ventanas y persianas. Agua muy dura que calcifica tuberias.'),

('malaga', 'Malaga', 'Malaga', 'Andalucia', 36.7213, -4.4214, 577405,
  '[{"name": "Centro Historico", "description": "Zona peatonal turistica"}, {"name": "La Malagueta", "description": "Zona de playa y toros"}, {"name": "El Palo", "description": "Antiguo barrio de pescadores"}, {"name": "Pedregalejo", "description": "Zona de playa con chiringuitos"}, {"name": "Teatinos", "description": "Barrio universitario moderno"}, {"name": "Carretera de Cadiz", "description": "Zona industrial y residencial"}, {"name": "Cruz de Humilladero", "description": "Barrio obrero"}, {"name": "Ciudad Jardin", "description": "Zona residencial"}]',
  'Clima subtropical con alta humedad por el mar. Problemas de salitre en fachadas y humedades. Muchas urbanizaciones de los anos 70-80 que necesitan reformas.'),

('murcia', 'Murcia', 'Murcia', 'Region de Murcia', 37.9922, -1.1307, 453258,
  '[{"name": "Centro", "description": "Zona historica comercial"}, {"name": "El Carmen", "description": "Barrio popular"}, {"name": "Vistabella", "description": "Zona residencial"}, {"name": "La Flota", "description": "Barrio moderno"}, {"name": "Infante Juan Manuel", "description": "Zona de expansion"}, {"name": "San Andres", "description": "Barrio obrero"}, {"name": "Santiago el Mayor", "description": "Zona tradicional"}, {"name": "Espinardo", "description": "Barrio universitario"}]',
  'Clima semiarido muy caluroso. Temperaturas extremas en verano. Agua muy dura con muchos problemas de cal. Aires acondicionados imprescindibles.'),

('palma-de-mallorca', 'Palma de Mallorca', 'Baleares', 'Islas Baleares', 39.5696, 2.6502, 416065,
  '[{"name": "Casco Antiguo", "description": "Centro historico con la Catedral"}, {"name": "Santa Catalina", "description": "Barrio de moda con restaurantes"}, {"name": "El Terreno", "description": "Zona de ocio nocturno"}, {"name": "Son Espanyolet", "description": "Barrio residencial"}, {"name": "Son Armadams", "description": "Zona de paseo maritimo"}, {"name": "Genova", "description": "Pueblo integrado en la ciudad"}, {"name": "Son Rapinya", "description": "Urbanizacion residencial"}, {"name": "Portitxol", "description": "Antiguo barrio de pescadores"}]',
  'Clima mediterraneo insular con alta humedad. Problemas de corrosion por salitre muy frecuentes. Temporada alta turistica con mucha demanda de servicios.'),

('las-palmas', 'Las Palmas de Gran Canaria', 'Las Palmas', 'Canarias', 28.1235, -15.4366, 379925,
  '[{"name": "Vegueta", "description": "Centro historico fundacional"}, {"name": "Triana", "description": "Zona comercial historica"}, {"name": "Las Canteras", "description": "Playa urbana famosa"}, {"name": "Guanarteme", "description": "Barrio residencial"}, {"name": "Schamann", "description": "Barrio popular"}, {"name": "Tamaraceite", "description": "Zona de expansion"}, {"name": "Tafira", "description": "Zona residencial universitaria"}, {"name": "Puerto", "description": "Zona portuaria"}]',
  'Clima subtropical con temperaturas estables todo el ano. Alta humedad que causa problemas de moho. Corrosion severa en zonas costeras. No necesita calefaccion pero si deshumidificadores.'),

('bilbao', 'Bilbao', 'Vizcaya', 'Pais Vasco', 43.2630, -2.9350, 346843,
  '[{"name": "Casco Viejo", "description": "Siete calles historicas"}, {"name": "Abando", "description": "Centro financiero y de negocios"}, {"name": "Deusto", "description": "Barrio universitario"}, {"name": "Santutxu", "description": "Barrio obrero"}, {"name": "San Ignacio", "description": "Zona residencial"}, {"name": "Rekalde", "description": "Barrio popular"}, {"name": "Indautxu", "description": "Zona comercial"}, {"name": "Abandoibarra", "description": "Zona del Guggenheim"}]',
  'Clima oceanico muy lluvioso. Problemas constantes de humedades y goteras. Calefaccion imprescindible en invierno. Muchos edificios industriales reconvertidos.'),

('alicante', 'Alicante', 'Alicante', 'Comunidad Valenciana', 38.3452, -0.4810, 337304,
  '[{"name": "Centro", "description": "Zona comercial y administrativa"}, {"name": "Playa de San Juan", "description": "Zona turistica de playa"}, {"name": "Carolinas", "description": "Barrio popular"}, {"name": "Alipark", "description": "Zona residencial moderna"}, {"name": "Cabo de las Huertas", "description": "Zona costera residencial"}, {"name": "San Blas", "description": "Barrio obrero"}, {"name": "Florida", "description": "Zona del estadio"}, {"name": "Altozano", "description": "Barrio tradicional"}]',
  'Clima mediterraneo seco con muchas horas de sol. Problemas de salitre en zonas costeras. Agua calcarea. Muchas viviendas turisticas que requieren mantenimiento intensivo.'),

('cordoba', 'Cordoba', 'Cordoba', 'Andalucia', 37.8882, -4.7794, 325708,
  '[{"name": "Centro Historico", "description": "Patrimonio de la Humanidad"}, {"name": "San Basilio", "description": "Barrio de los patios"}, {"name": "Ciudad Jardin", "description": "Zona residencial"}, {"name": "Zoco", "description": "Zona comercial moderna"}, {"name": "Fátima", "description": "Barrio popular"}, {"name": "Levante", "description": "Zona de expansion"}, {"name": "Poniente", "description": "Barrio residencial"}, {"name": "Brillante", "description": "Urbanizacion en la sierra"}]',
  'Veranos muy calurosos (record de temperaturas en Espana). Casas con patios tradicionales. Problemas de cal severos en el agua. Aire acondicionado es necesidad basica.'),

('valladolid', 'Valladolid', 'Valladolid', 'Castilla y Leon', 41.6523, -4.7245, 298866,
  '[{"name": "Centro", "description": "Zona historica y comercial"}, {"name": "Parquesol", "description": "Barrio residencial moderno"}, {"name": "Huerta del Rey", "description": "Zona de expansion"}, {"name": "Delicias", "description": "Barrio obrero historico"}, {"name": "Rondilla", "description": "Barrio popular"}, {"name": "Pajarillos", "description": "Barrio en transformacion"}, {"name": "La Victoria", "description": "Zona del estadio"}, {"name": "Covaresa", "description": "Urbanizacion residencial"}]',
  'Clima continental extremo: inviernos muy frios y veranos calurosos. Calefaccion fundamental. Problemas de heladas que afectan tuberias exteriores.'),

('vigo', 'Vigo', 'Pontevedra', 'Galicia', 42.2328, -8.7226, 293642,
  '[{"name": "Casco Vello", "description": "Centro historico"}, {"name": "Bouzas", "description": "Barrio marinero"}, {"name": "Castrelos", "description": "Zona del parque"}, {"name": "Travesas", "description": "Barrio residencial"}, {"name": "Coia", "description": "Zona de expansion"}, {"name": "Teis", "description": "Barrio industrial"}, {"name": "Lavadores", "description": "Zona obrera"}, {"name": "Samil", "description": "Zona de playa"}]',
  'Clima oceanico muy humedo con lluvias frecuentes. Problemas cronicas de humedades, goteras y moho. Las fachadas requieren tratamientos impermeabilizantes constantes.'),

('gijon', 'Gijon', 'Asturias', 'Asturias', 43.5322, -5.6611, 271843,
  '[{"name": "Cimadevilla", "description": "Barrio marinero historico"}, {"name": "Centro", "description": "Zona comercial"}, {"name": "La Arena", "description": "Zona de playa"}, {"name": "El Llano", "description": "Barrio residencial"}, {"name": "Pumarín", "description": "Barrio obrero"}, {"name": "La Calzada", "description": "Barrio industrial"}, {"name": "Viesques", "description": "Urbanizacion moderna"}, {"name": "Somio", "description": "Zona residencial exclusiva"}]',
  'Clima oceanico humedo todo el ano. Problemas de humedades muy frecuentes. La siderurgia historica ha dejado edificios industriales. Calefaccion necesaria todo el invierno.'),

('hospitalet-de-llobregat', 'Hospitalet de Llobregat', 'Barcelona', 'Cataluna', 41.3597, 2.0997, 264923,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Santa Eulàlia", "description": "Barrio tradicional"}, {"name": "Collblanc", "description": "Barrio obrero"}, {"name": "Bellvitge", "description": "Gran barrio residencial"}, {"name": "La Torrassa", "description": "Zona multicultural"}, {"name": "Sant Josep", "description": "Barrio tranquilo"}, {"name": "Pubilla Cases", "description": "Zona residencial"}, {"name": "Gran Via", "description": "Zona comercial"}]',
  'Segunda ciudad mas densa de Espana. Muchos edificios de los anos 60-70 que necesitan reformas. Problemas tipicos de construcciones de esa epoca: instalaciones obsoletas.'),

('a-coruna', 'A Coruna', 'A Coruna', 'Galicia', 43.3623, -8.4115, 245711,
  '[{"name": "Ciudad Vieja", "description": "Centro historico amurallado"}, {"name": "Pescaderia", "description": "Zona del puerto"}, {"name": "Monte Alto", "description": "Barrio de la Torre de Hercules"}, {"name": "Os Mallos", "description": "Barrio obrero"}, {"name": "Riazor", "description": "Zona de playa y estadio"}, {"name": "Elviña", "description": "Barrio universitario"}, {"name": "Matogrande", "description": "Zona residencial"}, {"name": "Palavea", "description": "Barrio en expansion"}]',
  'Clima oceanico humedo con viento constante. Problemas severos de humedad y salitre por el mar. Las fachadas de las galerias tipicas requieren mantenimiento especial.'),

('vitoria-gasteiz', 'Vitoria-Gasteiz', 'Alava', 'Pais Vasco', 42.8469, -2.6716, 253672,
  '[{"name": "Casco Medieval", "description": "Centro historico almendrado"}, {"name": "Ensanche", "description": "Zona comercial"}, {"name": "Lakua", "description": "Barrio moderno"}, {"name": "Zaramaga", "description": "Barrio obrero"}, {"name": "Coronacion", "description": "Zona residencial"}, {"name": "Txagorritxu", "description": "Barrio del hospital"}, {"name": "Salburua", "description": "Zona de expansion ecologica"}, {"name": "Armentia", "description": "Zona universitaria"}]',
  'Ciudad verde con clima continental frio. Inviernos largos que requieren buena calefaccion. Arquitectura sostenible en barrios nuevos. Problemas de heladas en tuberias.'),

('granada', 'Granada', 'Granada', 'Andalucia', 37.1773, -3.5986, 232462,
  '[{"name": "Albaicin", "description": "Barrio arabe Patrimonio de la Humanidad"}, {"name": "Realejo", "description": "Antiguo barrio judio"}, {"name": "Centro", "description": "Zona comercial"}, {"name": "Zaidin", "description": "Barrio popular"}, {"name": "Chana", "description": "Barrio obrero"}, {"name": "Genil", "description": "Zona residencial"}, {"name": "Beiro", "description": "Barrio de expansion"}, {"name": "Cartuja", "description": "Zona universitaria"}]',
  'Clima continental mediterraneo con nevadas ocasionales. Edificios historicos del Albaicin con estructuras muy antiguas. Veranos calurosos. Inviernos frios con Sierra Nevada cerca.'),

('elche', 'Elche', 'Alicante', 'Comunidad Valenciana', 38.2669, -0.6983, 234765,
  '[{"name": "Centro", "description": "Zona de palmeras"}, {"name": "Carrús", "description": "Barrio popular"}, {"name": "Altabix", "description": "Zona residencial"}, {"name": "Ciutat Universitària", "description": "Zona de campus"}, {"name": "El Raval", "description": "Barrio historico"}, {"name": "Los Palmerales", "description": "Zona de huertos de palmeras"}, {"name": "San Anton", "description": "Barrio tradicional"}, {"name": "Torrellano", "description": "Zona del aeropuerto"}]',
  'Clima semiarido muy caluroso. Ciudad del calzado con industria local. Agua muy dura y calcarea. El famoso palmeral requiere sistemas de riego especiales.'),

('oviedo', 'Oviedo', 'Asturias', 'Asturias', 43.3619, -5.8494, 220020,
  '[{"name": "Casco Antiguo", "description": "Centro historico"}, {"name": "El Cristo", "description": "Barrio residencial"}, {"name": "Buenavista", "description": "Zona universitaria"}, {"name": "Ventanielles", "description": "Barrio obrero"}, {"name": "La Corredoria", "description": "Zona de expansion"}, {"name": "Ciudad Naranco", "description": "Urbanizacion residencial"}, {"name": "Pumpido", "description": "Barrio tradicional"}, {"name": "Teatinos", "description": "Zona moderna"}]',
  'Clima oceanico lluvioso todo el ano. Problemas constantes de humedades. La ciudad tiene mucho edificio del siglo XX. Calefaccion central en muchas comunidades.'),

('badalona', 'Badalona', 'Barcelona', 'Cataluna', 41.4501, 2.2475, 223506,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "La Salut", "description": "Barrio residencial"}, {"name": "Sant Roc", "description": "Barrio en transformacion"}, {"name": "Llefià", "description": "Barrio obrero"}, {"name": "Gorg", "description": "Zona del Forum"}, {"name": "Pomar", "description": "Barrio popular"}, {"name": "Montigalà", "description": "Zona comercial"}, {"name": "Artigues", "description": "Barrio residencial"}]',
  'Ciudad costera junto a Barcelona. Problemas de humedad y salitre. Muchos edificios de los anos 60-70 con instalaciones antiguas. Buena conexion de metro.'),

('cartagena', 'Cartagena', 'Murcia', 'Region de Murcia', 37.6257, -0.9966, 216451,
  '[{"name": "Casco Antiguo", "description": "Centro historico con ruinas romanas"}, {"name": "Barrio Peral", "description": "Zona residencial"}, {"name": "Los Dolores", "description": "Barrio popular"}, {"name": "Santa Lucia", "description": "Zona marinera"}, {"name": "La Union", "description": "Zona minera historica"}, {"name": "Ensanche", "description": "Barrio de expansion"}, {"name": "San Anton", "description": "Barrio tradicional"}, {"name": "Los Juncos", "description": "Urbanizacion moderna"}]',
  'Clima semiarido con influencia marina. Base naval historica. Problemas de salitre y corrosion. Agua muy dura con cal. Veranos muy calurosos.'),

('terrassa', 'Terrassa', 'Barcelona', 'Cataluna', 41.5630, 2.0089, 223627,
  '[{"name": "Centro", "description": "Zona comercial e industrial"}, {"name": "Ca nAnglada", "description": "Barrio obrero"}, {"name": "Egara", "description": "Zona historica"}, {"name": "Les Fonts", "description": "Barrio residencial"}, {"name": "Sant Pere", "description": "Barrio popular"}, {"name": "Can Palet", "description": "Zona residencial"}, {"name": "Vallparadis", "description": "Zona del parque"}, {"name": "Torre-sana", "description": "Barrio de expansion"}]',
  'Ciudad industrial textil historica. Muchas naves y edificios industriales reconvertidos. Clima mediterraneo continental. Problemas de tuberias antiguas en fabricas reconvertidas.'),

('jerez-de-la-frontera', 'Jerez de la Frontera', 'Cadiz', 'Andalucia', 36.6850, -6.1261, 212879,
  '[{"name": "Centro", "description": "Zona de bodegas y flamenco"}, {"name": "San Miguel", "description": "Barrio flamenco"}, {"name": "Santiago", "description": "Barrio gitano historico"}, {"name": "La Plata", "description": "Zona residencial"}, {"name": "Guadalcacin", "description": "Poblado rural"}, {"name": "Federico Mayo", "description": "Barrio moderno"}, {"name": "San Telmo", "description": "Barrio tradicional"}, {"name": "Estella", "description": "Urbanizacion"}]',
  'Capital del vino y el caballo. Clima mediterraneo con influencia atlantica. Las bodegas historicas tienen sistemas de climatizacion especiales. Agua dura.'),

('sabadell', 'Sabadell', 'Barcelona', 'Cataluna', 41.5463, 2.1086, 213644,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Torre-romeu", "description": "Barrio obrero"}, {"name": "Can Puiggener", "description": "Barrio en transformacion"}, {"name": "Gracia", "description": "Barrio residencial"}, {"name": "La Creu Alta", "description": "Zona tradicional"}, {"name": "Can Feu", "description": "Barrio popular"}, {"name": "Sant Oleguer", "description": "Zona de expansion"}, {"name": "Covadonga", "description": "Barrio residencial"}]',
  'Ciudad industrial textil. Patrimonio industrial con fabricas reconvertidas. Problemas tipicos de edificios industriales antiguos: instalaciones obsoletas, humedades.'),

('mostoles', 'Mostoles', 'Madrid', 'Comunidad de Madrid', 40.3223, -3.8650, 207095,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Pradillo", "description": "Barrio historico"}, {"name": "Parque Lisboa", "description": "Zona residencial moderna"}, {"name": "Villafontana", "description": "Barrio popular"}, {"name": "Parque Coimbra", "description": "Zona verde"}, {"name": "Universidad", "description": "Campus universitario"}, {"name": "Arroyomolinos", "description": "Zona de expansion"}, {"name": "Manuela Malasana", "description": "Barrio nuevo"}]',
  'Ciudad dormitorio de Madrid con crecimiento de los 80-90. Construcciones de esa epoca con algunos problemas estructurales. Clima continental como Madrid.'),

('santa-cruz-de-tenerife', 'Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 'Canarias', 28.4636, -16.2518, 207312,
  '[{"name": "Centro", "description": "Zona comercial y administrativa"}, {"name": "La Salud", "description": "Barrio historico"}, {"name": "Añaza", "description": "Zona residencial moderna"}, {"name": "Ofra", "description": "Barrio popular"}, {"name": "El Sobradillo", "description": "Zona de expansion"}, {"name": "Salamanca", "description": "Barrio obrero"}, {"name": "La Salle", "description": "Zona residencial"}, {"name": "Garcia Escamez", "description": "Barrio tradicional"}]',
  'Clima subtropical estable todo el ano. Alta humedad con problemas de moho. Corrosion por salitre en zonas costeras. No necesita calefaccion ni mucho aire acondicionado.'),

('pamplona', 'Pamplona', 'Navarra', 'Navarra', 42.8125, -1.6458, 203418,
  '[{"name": "Casco Viejo", "description": "Centro historico amurallado"}, {"name": "Ensanche", "description": "Zona comercial"}, {"name": "Iturrama", "description": "Barrio residencial"}, {"name": "San Juan", "description": "Barrio popular"}, {"name": "Mendebaldea", "description": "Zona moderna"}, {"name": "Rochapea", "description": "Barrio obrero"}, {"name": "Txantrea", "description": "Barrio residencial"}, {"name": "Buztintxuri", "description": "Zona de expansion"}]',
  'Clima de transicion oceanico-continental. Inviernos frios y humedos. Veranos suaves. Famosa por los Sanfermines. Edificios historicos bien conservados.'),

('almeria', 'Almeria', 'Almeria', 'Andalucia', 36.8340, -2.4637, 198533,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "La Chanca", "description": "Barrio historico marinero"}, {"name": "Oliveros", "description": "Barrio residencial"}, {"name": "Nueva Almeria", "description": "Zona de expansion"}, {"name": "Zapillo", "description": "Zona de playa"}, {"name": "El Puche", "description": "Barrio obrero"}, {"name": "Los Angeles", "description": "Barrio popular"}, {"name": "Aguadulce", "description": "Zona turistica"}]',
  'Ciudad mas seca de Europa con clima desertico. Problemas de cal extremos en el agua. Aire acondicionado imprescindible. La sequia afecta a la presion del agua.'),

('alcala-de-henares', 'Alcala de Henares', 'Madrid', 'Comunidad de Madrid', 40.4820, -3.3635, 197562,
  '[{"name": "Centro Historico", "description": "Patrimonio de la Humanidad"}, {"name": "Nueva Alcala", "description": "Zona moderna"}, {"name": "El Val", "description": "Barrio residencial"}, {"name": "Reyes Catolicos", "description": "Barrio popular"}, {"name": "La Garena", "description": "Zona comercial"}, {"name": "Espartales", "description": "Zona universitaria"}, {"name": "Ensanche", "description": "Zona de expansion"}, {"name": "Juan de Austria", "description": "Barrio residencial"}]',
  'Ciudad universitaria historica. Centro patrimonio de la humanidad con edificios muy antiguos que requieren mantenimiento especializado. Clima continental como Madrid.'),

('fuenlabrada', 'Fuenlabrada', 'Madrid', 'Comunidad de Madrid', 40.2838, -3.7947, 193700,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "El Naranjo", "description": "Barrio residencial"}, {"name": "Loranca", "description": "Zona nueva"}, {"name": "La Serna", "description": "Barrio popular"}, {"name": "El Cerro", "description": "Zona industrial"}, {"name": "Parque Europa", "description": "Zona verde residencial"}, {"name": "Polvoranca", "description": "Barrio historico"}, {"name": "Vivero", "description": "Zona de expansion"}]',
  'Ciudad dormitorio con mucho crecimiento de los 80. Construcciones de esa decada con instalaciones que necesitan actualizacion. Clima continental.'),

('leganes', 'Leganes', 'Madrid', 'Comunidad de Madrid', 40.3281, -3.7641, 189861,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Zarzaquemada", "description": "Barrio obrero"}, {"name": "La Fortuna", "description": "Zona residencial"}, {"name": "San Nicasio", "description": "Barrio popular"}, {"name": "El Carrascal", "description": "Zona moderna"}, {"name": "Arroyo Culebro", "description": "Zona verde"}, {"name": "Butarque", "description": "Barrio de expansion"}, {"name": "Vereda de Estudiantes", "description": "Zona universitaria"}]',
  'Ciudad del sur metropolitano de Madrid. Construcciones masivas de los anos 70-80. Problemas tipicos de esa construccion: humedades, instalaciones antiguas.'),

('san-sebastian', 'San Sebastian', 'Guipuzcoa', 'Pais Vasco', 43.3183, -1.9812, 187415,
  '[{"name": "Parte Vieja", "description": "Centro historico gastronomico"}, {"name": "Centro", "description": "Zona del Ensanche"}, {"name": "Gros", "description": "Barrio surfero"}, {"name": "Antiguo", "description": "Barrio residencial"}, {"name": "Amara", "description": "Zona del estadio"}, {"name": "Ibaeta", "description": "Barrio universitario"}, {"name": "Intxaurrondo", "description": "Barrio popular"}, {"name": "Aiete", "description": "Zona residencial exclusiva"}]',
  'Clima oceanico muy lluvioso. Ciudad turistica de alto nivel. Edificios de calidad pero con problemas de humedad constantes. Precios de servicios mas altos que media.'),

('getafe', 'Getafe', 'Madrid', 'Comunidad de Madrid', 40.3058, -3.7329, 183374,
  '[{"name": "Centro", "description": "Zona comercial historica"}, {"name": "Sector III", "description": "Barrio residencial"}, {"name": "El Bercial", "description": "Zona de expansion"}, {"name": "Las Margaritas", "description": "Barrio obrero"}, {"name": "Juan de la Cierva", "description": "Zona residencial"}, {"name": "Los Molinos", "description": "Barrio popular"}, {"name": "Perales del Rio", "description": "Zona verde"}, {"name": "La Alhondiga", "description": "Zona del hospital"}]',
  'Ciudad del sur de Madrid con base aerea. Crecimiento de los 80 con construcciones de esa epoca. Problemas similares a otras ciudades dormitorio: instalaciones antiguas.'),

('burgos', 'Burgos', 'Burgos', 'Castilla y Leon', 42.3439, -3.6969, 176418,
  '[{"name": "Centro Historico", "description": "Zona de la Catedral"}, {"name": "Gamonal", "description": "Barrio obrero grande"}, {"name": "San Pedro", "description": "Barrio residencial"}, {"name": "Capiscol", "description": "Barrio popular"}, {"name": "La Castellana", "description": "Zona de expansion"}, {"name": "Villimar", "description": "Urbanizacion"}, {"name": "San Julian", "description": "Barrio tradicional"}, {"name": "Universidad", "description": "Zona universitaria"}]',
  'Clima continental muy frio. La Catedral esta en el casco historico con edificios muy antiguos. Calefaccion imprescindible gran parte del ano. Heladas frecuentes.'),

('albacete', 'Albacete', 'Albacete', 'Castilla-La Mancha', 38.9943, -1.8585, 173329,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Carretas", "description": "Barrio obrero"}, {"name": "San Pablo", "description": "Barrio popular"}, {"name": "Villacerrada", "description": "Zona nueva"}, {"name": "Ensanche", "description": "Barrio residencial"}, {"name": "Feria", "description": "Zona del recinto ferial"}, {"name": "Santa Teresa", "description": "Barrio tradicional"}, {"name": "San Antonio Abad", "description": "Zona de expansion"}]',
  'Clima continental extremo: muy frio en invierno y muy caluroso en verano. Famosa por sus navajas. Aire acondicionado y calefaccion necesarios. Viento frecuente.'),

('santander', 'Santander', 'Cantabria', 'Cantabria', 43.4623, -3.8099, 172044,
  '[{"name": "Centro", "description": "Zona comercial reconstruida"}, {"name": "El Sardinero", "description": "Zona de playa exclusiva"}, {"name": "Cuatro Caminos", "description": "Barrio obrero"}, {"name": "Monte", "description": "Zona residencial"}, {"name": "Castilla", "description": "Barrio popular"}, {"name": "Nueva Montana", "description": "Zona industrial"}, {"name": "Puertochico", "description": "Puerto deportivo"}, {"name": "Cazoña", "description": "Barrio residencial"}]',
  'Clima oceanico humedo todo el ano. Ciudad reconstruida tras el incendio de 1941. Problemas de humedad y salitre por el mar. Calefaccion imprescindible en invierno.'),

('castellon', 'Castellon de la Plana', 'Castellon', 'Comunidad Valenciana', 39.9864, -0.0513, 171728,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "Grao", "description": "Zona de playa"}, {"name": "Rafalafena", "description": "Barrio residencial"}, {"name": "San Agustin", "description": "Barrio popular"}, {"name": "Fadrell", "description": "Zona de expansion"}, {"name": "San Lorenzo", "description": "Barrio tradicional"}, {"name": "Sequiol", "description": "Barrio residencial"}, {"name": "Cremor", "description": "Zona industrial"}]',
  'Clima mediterraneo. Ciudad de la ceramica con industria azulejera. Zona del Grao tiene problemas de humedad marina. Agua bastante calcarea.'),

('alcorcon', 'Alcorcon', 'Madrid', 'Comunidad de Madrid', 40.3451, -3.8245, 170514,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "San Jose de Valderas", "description": "Barrio residencial"}, {"name": "Parque Lisboa", "description": "Zona verde"}, {"name": "Campodón", "description": "Barrio popular"}, {"name": "Parque Oeste", "description": "Urbanizacion moderna"}, {"name": "Los Cantos", "description": "Barrio residencial"}, {"name": "Ensanche Sur", "description": "Zona nueva"}, {"name": "Prado Santo Domingo", "description": "Zona de expansion"}]',
  'Ciudad dormitorio al oeste de Madrid. Crecimiento de los 70-80 con construcciones de esa epoca. Mismos problemas que otras ciudades del cinturon: instalaciones antiguas.'),

('logrono', 'Logrono', 'La Rioja', 'La Rioja', 42.4627, -2.4449, 150979,
  '[{"name": "Casco Antiguo", "description": "Zona de tapeo"}, {"name": "Ensanche", "description": "Zona comercial"}, {"name": "Cascajos", "description": "Zona nueva"}, {"name": "El Cubo", "description": "Barrio popular"}, {"name": "San Adrian", "description": "Barrio obrero"}, {"name": "Madre de Dios", "description": "Barrio residencial"}, {"name": "Yagüe", "description": "Zona de expansion"}, {"name": "Valdegastea", "description": "Urbanizacion"}]',
  'Capital del vino de Rioja. Clima de transicion con inviernos frios. Casco antiguo con edificios historicos bien conservados. Calefaccion necesaria en invierno.'),

('san-cristobal-de-la-laguna', 'San Cristobal de La Laguna', 'Santa Cruz de Tenerife', 'Canarias', 28.4853, -16.3166, 158010,
  '[{"name": "Centro Historico", "description": "Patrimonio de la Humanidad"}, {"name": "La Cuesta", "description": "Barrio comercial"}, {"name": "Taco", "description": "Zona popular"}, {"name": "Finca España", "description": "Barrio residencial"}, {"name": "Geneto", "description": "Zona de expansion"}, {"name": "Gracia", "description": "Barrio tradicional"}, {"name": "San Benito", "description": "Zona universitaria"}, {"name": "Valle Guerra", "description": "Zona rural"}]',
  'Ciudad universitaria Patrimonio de la Humanidad. Clima subtropical con nubes frecuentes (mar de nubes). Humedad moderada. Edificios coloniales historicos.'),

('badajoz', 'Badajoz', 'Badajoz', 'Extremadura', 38.8794, -6.9707, 150702,
  '[{"name": "Casco Antiguo", "description": "Zona amurallada"}, {"name": "Centro", "description": "Zona comercial"}, {"name": "San Fernando", "description": "Barrio residencial"}, {"name": "Cerro de Reyes", "description": "Barrio popular"}, {"name": "San Roque", "description": "Barrio obrero"}, {"name": "Valdepasillas", "description": "Zona de expansion"}, {"name": "Pardaleras", "description": "Barrio tradicional"}, {"name": "Suerte de Saavedra", "description": "Urbanizacion"}]',
  'Ciudad fronteriza con Portugal. Veranos muy calurosos y secos. Inviernos suaves. Agua bastante buena. Aire acondicionado necesario en verano.'),

('salamanca', 'Salamanca', 'Salamanca', 'Castilla y Leon', 40.9701, -5.6635, 144228,
  '[{"name": "Centro Historico", "description": "Patrimonio de la Humanidad"}, {"name": "Garrido", "description": "Barrio obrero grande"}, {"name": "Pizarrales", "description": "Barrio popular"}, {"name": "Capuchinos", "description": "Barrio residencial"}, {"name": "San Jose", "description": "Barrio tradicional"}, {"name": "Arrabal", "description": "Zona del rio"}, {"name": "Tejares", "description": "Barrio de expansion"}, {"name": "Chamberí", "description": "Zona universitaria"}]',
  'Ciudad universitaria historica. Centro Patrimonio de la Humanidad con edificios de piedra arenisca. Clima continental frio. Problemas de restauracion de piedra.'),

('huelva', 'Huelva', 'Huelva', 'Andalucia', 37.2614, -6.9447, 143663,
  '[{"name": "Centro", "description": "Zona comercial"}, {"name": "La Orden", "description": "Barrio obrero"}, {"name": "El Torrejón", "description": "Barrio residencial"}, {"name": "Isla Chica", "description": "Zona historica"}, {"name": "Pescadería", "description": "Barrio marinero"}, {"name": "Las Colonias", "description": "Barrio popular"}, {"name": "Marismas del Odiel", "description": "Zona natural"}, {"name": "Nuevo Molino", "description": "Urbanizacion"}]',
  'Ciudad portuaria con industria quimica. Clima mediterraneo atlantico. Problemas de corrosion por cercanía al mar y zona industrial. Aire bastante humedo.'),

('lleida', 'Lleida', 'Lleida', 'Cataluna', 41.6176, 0.6200, 140797,
  '[{"name": "Centre Historic", "description": "Casco antiguo con la Seu"}, {"name": "Cappont", "description": "Zona universitaria"}, {"name": "Pardinyes", "description": "Barrio residencial"}, {"name": "Balàfia", "description": "Barrio obrero"}, {"name": "Secà de Sant Pere", "description": "Zona industrial"}, {"name": "Bordeta", "description": "Barrio popular"}, {"name": "Magraners", "description": "Zona de expansion"}, {"name": "Mariola", "description": "Barrio diverso"}]',
  'Ciudad del interior de Cataluña con clima continental. Veranos muy calurosos e inviernos frios con nieblas. Agricultura de regadio importante. Agua del Segre.'),

('marbella', 'Marbella', 'Malaga', 'Andalucia', 36.5099, -4.8861, 147633,
  '[{"name": "Casco Antiguo", "description": "Centro historico"}, {"name": "Puerto Banus", "description": "Puerto deportivo de lujo"}, {"name": "Nueva Andalucia", "description": "Urbanizacion exclusiva"}, {"name": "San Pedro de Alcantara", "description": "Pueblo integrado"}, {"name": "Las Chapas", "description": "Zona de urbanizaciones"}, {"name": "El Rosario", "description": "Zona residencial"}, {"name": "La Campana", "description": "Barrio popular"}, {"name": "Nagüeles", "description": "Urbanizacion de lujo"}]',
  'Ciudad turistica de lujo con clientela exigente. Muchas villas y urbanizaciones de alto nivel. Problemas de salitre por el mar. Servicios premium.'),

('tarragona', 'Tarragona', 'Tarragona', 'Cataluna', 41.1189, 1.2445, 134515,
  '[{"name": "Part Alta", "description": "Casco romano Patrimonio de la Humanidad"}, {"name": "Serrallo", "description": "Barrio marinero"}, {"name": "Sant Pere i Sant Pau", "description": "Barrio obrero"}, {"name": "Ponent", "description": "Zona industrial"}, {"name": "Bonavista", "description": "Barrio popular"}, {"name": "Llevant", "description": "Zona residencial"}, {"name": "Torreforta", "description": "Barrio de expansion"}, {"name": "Nou Eixample", "description": "Zona nueva"}]',
  'Ciudad romana Patrimonio de la Humanidad con ruinas importantes. Industria petroquimica cerca. Clima mediterraneo. Problemas de conservacion de patrimonio historico.'),

('leon', 'Leon', 'Leon', 'Castilla y Leon', 42.5987, -5.5671, 124028,
  '[{"name": "Casco Antiguo", "description": "Barrio Humedo historico"}, {"name": "Eras de Renueva", "description": "Zona de expansion"}, {"name": "El Crucero", "description": "Barrio obrero"}, {"name": "San Mamés", "description": "Barrio residencial"}, {"name": "La Palomera", "description": "Barrio popular"}, {"name": "Polígono X", "description": "Zona moderna"}, {"name": "Armunia", "description": "Barrio industrial"}, {"name": "Las Ventas", "description": "Zona comercial"}]',
  'Ciudad del Camino de Santiago con Catedral gotica famosa. Clima continental muy frio en invierno. Calefaccion imprescindible. Edificios historicos bien conservados.'),

('cadiz', 'Cadiz', 'Cadiz', 'Andalucia', 36.5271, -6.2886, 116027,
  '[{"name": "Casco Antiguo", "description": "Peninsula historica"}, {"name": "Bahía Blanca", "description": "Zona moderna"}, {"name": "Puntales", "description": "Barrio obrero"}, {"name": "La Laguna", "description": "Zona popular"}, {"name": "Segunda Aguada", "description": "Barrio residencial"}, {"name": "La Paz", "description": "Barrio tradicional"}, {"name": "Astilleros", "description": "Zona portuaria"}, {"name": "Cortadura", "description": "Zona de playa"}]',
  'Ciudad mas antigua de Occidente rodeada de mar. Problemas severos de humedad y salitre. Edificios historicos del siglo XVIII. Viento de levante frecuente.')

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  province = EXCLUDED.province,
  autonomous_community = EXCLUDED.autonomous_community,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  population = EXCLUDED.population,
  neighborhoods = EXCLUDED.neighborhoods,
  local_context = EXCLUDED.local_context;
