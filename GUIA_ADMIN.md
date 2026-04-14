# Guía de Administración - Electricistas 24H pSEO

## Seguridad de Endpoints

**IMPORTANTE**: Los endpoints de administración requieren una contraseña (`CRON_SECRET`) en producción.

### Configurar la contraseña

1. Ve a la configuración del proyecto en Vercel o v0
2. Añade la variable de entorno: `CRON_SECRET=tu_contraseña_segura_aqui`
3. Usa una contraseña larga y aleatoria (ej: `openssl rand -hex 32`)

---

## Ejecutar Generación de Páginas Manualmente

### Opción 1: Query parameter (más fácil)
```bash
# Ver estadísticas
curl "https://www.electricistass.com/api/admin/generate-pages?secret=TU_CRON_SECRET"

# Generar 5 páginas
curl -X POST "https://www.electricistass.com/api/admin/generate-pages?count=5&secret=TU_CRON_SECRET"

# Generar 10 páginas
curl -X POST "https://www.electricistass.com/api/admin/generate-pages?count=10&secret=TU_CRON_SECRET"
```

### Opción 2: Header Authorization (más seguro)
```bash
# Ver estadísticas
curl -H "Authorization: Bearer TU_CRON_SECRET" \
  "https://www.electricistass.com/api/admin/generate-pages"

# Generar 5 páginas
curl -X POST -H "Authorization: Bearer TU_CRON_SECRET" \
  "https://www.electricistass.com/api/admin/generate-pages?count=5"
```

### Desarrollo local (sin contraseña)
Si no tienes `CRON_SECRET` configurado localmente, puedes usar los endpoints sin autenticación:
```bash
curl -X POST "http://localhost:3000/api/admin/generate-pages?count=5"
```

### Cron automático
El cron se ejecuta 3 veces al día (8:00, 14:00, 20:00 hora España) y genera ~7 páginas por ejecución.
Vercel envía automáticamente el header `Authorization: Bearer CRON_SECRET` a los crons.

---

## Configuración de Páginas desde Supabase

### Tabla: `pages`

Cada página tiene campos JSON completamente configurables:

#### `layout_config` - Configuración de layout
```json
{
  "hero_height": "medium",       // "small" | "medium" | "large" | "full"
  "hero_overlay_opacity": 0.7,   // 0-1
  "content_max_width": "medium", // "narrow" | "medium" | "wide" | "full"
  "section_spacing": "standard", // "compact" | "standard" | "spacious" | "generous"
  "show_breadcrumbs": true,
  "show_map": true,
  "show_prices": true,
  "sections_order": ["hero", "intro", "services", "testimonials", "faq", "cta"]
}
```

#### `design_variation` - Variaciones de diseño
```json
{
  "layout_variant": "standard",      // "standard" | "hero-split" | "hero-centered" | "hero-minimal" | "hero-full"
  "color_scheme": "orange",          // "blue" | "green" | "orange" | "teal" | "indigo" | "emerald" | "amber" | "cyan"
  "hero_style": "gradient",
  "cta_style": "banner",             // "banner" | "card" | "gradient" | "minimal"
  "testimonial_style": "carousel",   // "carousel" | "grid" | "masonry"
  "faq_style": "accordion",          // "accordion" | "grid" | "simple"
  "spacing_variant": "standard"      // "compact" | "standard" | "spacious" | "generous"
}
```

#### `seo_config` - Configuración SEO (Meta Tags para Google)

Controla cómo aparece la página en los resultados de Google y redes sociales:

```json
{
  // === TÍTULOS ===
  "title_override": "Fontanero Madrid 24h - Urgencias | Electricistas 24H",
  "meta_title": "Fontanero en Madrid - Servicio Urgente 24 horas",
  
  // === DESCRIPCIONES ===
  "meta_description_override": "Fontaneros profesionales en Madrid. Llama al 900 433 214...",
  
  // === OPEN GRAPH (Facebook, WhatsApp, LinkedIn) ===
  "og_title": "Fontanero Madrid - Servicio 24h",
  "og_description": "Los mejores fontaneros de Madrid...",
  "og_image": "https://ejemplo.com/imagen-compartir.jpg",
  "og_type": "website",
  
  // === TWITTER/X ===
  "twitter_card": "summary_large_image",
  "twitter_title": "Fontanero Madrid 24h",
  "twitter_description": "Servicio urgente de fontanería...",
  "twitter_image": "https://ejemplo.com/twitter-image.jpg",
  
  // === INDEXACIÓN ===
  "canonical_url": "https://www.electricistass.com/fontanero/madrid",
  "no_index": false,
  "no_follow": false,
  
  // === KEYWORDS ===
  "keywords": [
    "fontanero madrid",
    "fontanería urgente madrid",
    "desatascos madrid 24h"
  ],
  
  // === OTROS ===
  "author": "Electricistas 24H",
  "schema_type": "LocalBusiness"
}
```

**Campos más importantes para Google:**
- `title_override` - El título que aparece en la pestaña del navegador y en Google
- `meta_description_override` - La descripción que aparece en Google bajo el título
- `og_image` - La imagen que aparece al compartir en redes sociales
- `keywords` - Palabras clave adicionales (se combinan con las del servicio)
- `no_index` - Si es `true`, Google NO indexará esta página

#### `custom_reviews` - Reviews personalizadas
```json
[
  {
    "name": "María García",
    "avatar": "https://...",
    "location": "Chamberí, Madrid",
    "rating": 5,
    "text": "Excelente servicio, llegaron en 30 minutos...",
    "service_type": "Reparación de fugas",
    "date": "hace 2 semanas",
    "verified": true,
    "helpful_count": 12
  }
]
```

#### `images_config` - Configuración de imágenes
```json
{
  "hero_image": "https://...",
  "hero_image_alt": "Fontanero profesional en Madrid",
  "gallery": [
    {
      "url": "https://...",
      "alt": "Reparación de tuberías",
      "caption": "Trabajo realizado en Chamberí"
    }
  ],
  "logo_override": "https://...",
  "og_image": "https://..."
}
```

#### `sections_config` - Configuración de secciones
```json
{
  "hero": {
    "enabled": true,
    "variant": "hero-split",
    "height": "large",
    "overlay": 0.6
  },
  "intro": {
    "enabled": true,
    "show_highlight": true,
    "columns": 1
  },
  "services": {
    "enabled": true,
    "layout": "grid",      // "grid" | "list" | "cards"
    "show_prices": true,
    "show_duration": true
  },
  "testimonials": {
    "enabled": true,
    "layout": "carousel",
    "max_display": 6
  },
  "faq": {
    "enabled": true,
    "layout": "accordion",
    "show_categories": true
  },
  "map": {
    "enabled": true,
    "height": 450,
    "zoom": 13
  },
  "cta": {
    "enabled": true,
    "variant": "banner",
    "position": "bottom"
  }
}
```

#### `style_overrides` - Overrides de estilos
```json
{
  "primary_color": "#f97316",
  "secondary_color": "#1e40af",
  "accent_color": "#10b981",
  "background_color": "#ffffff",
  "text_color": "#1f2937",
  "border_radius": "0.75rem",
  "font_heading": "Inter",
  "font_body": "Inter",
  "custom_css": ".hero-section { background: linear-gradient(...); }"
}
```

---

## Tabla: `services`

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre del servicio (con tildes: "Fontanería") |
| `slug` | URL amigable (sin tildes: "fontanero") |
| `description` | Descripción SEO del servicio |
| `hero_image_url` | Imagen por defecto para el servicio |
| `is_active` | Activar/desactivar servicio |

---

## Tabla: `cities`

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre de la ciudad |
| `slug` | URL amigable |
| `province` | Provincia |
| `latitude/longitude` | Coordenadas para el mapa |
| `population` | Población (para personalizar contenido) |
| `neighborhoods` | JSON con barrios `[{"name": "Chamberí", "description": "..."}]` |
| `landmarks` | JSON con lugares conocidos |
| `local_context` | Contexto local para la IA |
| `city_image_url` | Imagen de la ciudad para hero |

---

## Flujo de Generación

1. El cron selecciona páginas con `status = 'pending'`
2. Genera contenido con IA (Claude vía Vercel AI Gateway)
3. Actualiza la página con el contenido generado
4. Cambia `status` a `'published'` y establece `published_at`
5. El sitemap se actualiza automáticamente con la nueva fecha

---

## Configuración del Sitemap

Cada página, servicio y blog post tiene campos para controlar su aparición en el sitemap:

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `sitemap_priority` | decimal | 0.8 | Prioridad de la página (0.0 - 1.0). Más alto = más importante para Google |
| `sitemap_changefreq` | text | "weekly" | Frecuencia de cambio: "always", "hourly", "daily", "weekly", "monthly", "yearly", "never" |
| `sitemap_exclude` | boolean | false | Si es `true`, la página NO aparecerá en el sitemap |

**Ejemplo SQL para configurar:**
```sql
-- Aumentar prioridad de una página importante
UPDATE pages SET sitemap_priority = 0.95 WHERE slug = 'fontanero/madrid';

-- Excluir una página del sitemap
UPDATE pages SET sitemap_exclude = true WHERE slug = 'test/page';

-- Cambiar frecuencia para páginas que se actualizan mucho
UPDATE pages SET sitemap_changefreq = 'daily' WHERE slug LIKE 'electricista/%';

-- Configurar servicios
UPDATE services SET sitemap_priority = 0.9, sitemap_changefreq = 'weekly' WHERE slug = 'fontanero';
```

**Prioridades recomendadas:**
- Home: 1.0 (automático)
- Índices de servicios: 0.9
- Páginas pSEO principales: 0.8-0.85
- Páginas pSEO secundarias: 0.7-0.75
- Blog posts: 0.6-0.7

---

## Prioridad de Generación

Para generar primero ciertas páginas, puedes:
1. Usar el campo `sitemap_priority` - las páginas con mayor prioridad se generan primero
2. O añadir un campo `generation_priority` adicional si necesitas separar la prioridad de generación de la del sitemap

---

## Añadir una Nueva Ciudad

### Pasos:

1. **Copiar el template**: `scripts/templates/nueva_ciudad_template.sql`
2. **Rellenar los datos** de la ciudad (ver campos abajo)
3. **Ejecutar en Supabase** SQL Editor
4. **Generar páginas** con el cron manual o esperar al automático

### Campos obligatorios de `cities`:

| Campo | Tipo | Ejemplo | Descripción |
|-------|------|---------|-------------|
| `name` | text | "Valencia" | Nombre oficial con tildes |
| `slug` | text | "valencia" | URL amigable (minúsculas, sin tildes) |
| `province` | text | "Valencia" | Provincia |
| `autonomous_community` | text | "Comunidad Valenciana" | Comunidad Autónoma |
| `population` | integer | 800215 | Población (número) |
| `latitude` | decimal | 39.4699 | Latitud GPS |
| `longitude` | decimal | -0.3763 | Longitud GPS |
| `neighborhoods` | jsonb | Ver abajo | Barrios principales |
| `landmarks` | text[] | ARRAY['...'] | Monumentos/lugares conocidos |
| `local_context` | text | "..." | Contexto para la IA |

### Formato de `neighborhoods`:
```json
[
  {"name": "El Carmen", "description": "Casco histórico con calles estrechas..."},
  {"name": "Ruzafa", "description": "Barrio bohemio con edificios modernistas..."}
]
```

### Ejemplo completo (Valencia):
```sql
-- Ver: scripts/examples/ejemplo_add_valencia.sql
INSERT INTO cities (
  name, slug, province, autonomous_community,
  population, latitude, longitude,
  neighborhoods, landmarks, local_context
) VALUES (
  'Valencia',
  'valencia', 
  'Valencia',
  'Comunidad Valenciana',
  800215,
  39.4699,
  -0.3763,
  '[
    {"name": "El Carmen", "description": "Casco histórico medieval"},
    {"name": "Ruzafa", "description": "Barrio bohemio con edificios modernistas"},
    {"name": "Benimaclet", "description": "Zona universitaria"}
  ]'::jsonb,
  ARRAY['Ciudad de las Artes', 'La Lonja', 'Catedral', 'Mercado Central'],
  'Valencia tiene clima mediterráneo húmedo. Edificios antiguos con tuberías de hierro...'
);

-- Crear páginas automáticamente
INSERT INTO pages (service_id, city_id, slug, status, sitemap_priority)
SELECT s.id, c.id, s.slug || '/' || c.slug, 'pending', 0.8
FROM services s CROSS JOIN cities c
WHERE c.slug = 'valencia'
AND NOT EXISTS (SELECT 1 FROM pages p WHERE p.service_id = s.id AND p.city_id = c.id);
```

### Después de añadir la ciudad:
```bash
# Generar las páginas con IA
curl -X POST "https://www.electricistass.com/api/admin/generate-pages?count=10&secret=TU_SECRET"
```

---

## Preguntas Frecuentes

**¿Cómo añado una nueva ciudad?**
1. Usar el template en `scripts/templates/nueva_ciudad_template.sql`
2. Ejecutar el SQL en Supabase
3. Las páginas se crean automáticamente en estado `pending`
4. El cron genera el contenido con IA

**¿Cómo personalizo una página específica?**
1. Buscar la página en `pages` por slug (ej: "fontanero/madrid")
2. Editar los campos JSON (`custom_reviews`, `layout_config`, etc.)
3. Los cambios se reflejan inmediatamente

**¿Cómo cambio el teléfono?**
El teléfono 900 433 214 está hardcodeado en:
- `components/layout/header.tsx`
- `components/layout/footer.tsx`
- `components/pages/hero-section.tsx`
- `components/pages/cta-section.tsx`

Buscar `PHONE_NUMBER` y `PHONE_DISPLAY` para cambiar.

---

## Variables de Entorno Necesarias

```env
# Supabase (automático con integración)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cron (para producción)
CRON_SECRET=tu_secret_seguro

# Sitio
NEXT_PUBLIC_SITE_URL=https://www.electricistass.com
```
