-- ============================================
-- ELECTRICISTAS 24H - Script Unificado de Base de Datos
-- ============================================
-- Este script crea todas las tablas necesarias para el proyecto Electricistas 24H
-- Ejecutar en una base de datos PostgreSQL/Supabase limpia
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLA: services (Servicios/Profesiones)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  name_singular TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  keywords TEXT[],
  icon TEXT,
  icon_style TEXT,
  color_theme TEXT,
  hero_image_url TEXT,
  thumbnail_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  sitemap_priority NUMERIC DEFAULT 0.8,
  sitemap_changefreq TEXT DEFAULT 'weekly'
);

-- Indices para services
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);

-- ============================================
-- 2. TABLA: cities (Ciudades)
-- ============================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  province TEXT,
  autonomous_community TEXT,
  population INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  neighborhoods JSONB DEFAULT '[]'::jsonb,
  landmarks TEXT[],
  local_context TEXT,
  city_image_url TEXT,
  skyline_image_url TEXT,
  monument_image_url TEXT,
  city_images JSONB DEFAULT '{}'::jsonb
);

-- Indices para cities
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province);

-- ============================================
-- 3. TABLA: pages (Paginas de Servicio-Ciudad)
-- ============================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Relaciones
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  parent_city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  
  -- Identificacion
  slug TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'generating', 'error', 'pending')),
  is_neighborhood BOOLEAN DEFAULT FALSE,
  
  -- SEO
  title TEXT,
  h1 TEXT,
  h1_variant TEXT,
  meta_description TEXT,
  highlight TEXT,
  
  -- Contenido principal
  intro_text TEXT,
  intro_highlight TEXT,
  city_specific_content TEXT,
  content_tone TEXT DEFAULT 'profesional',
  
  -- Seccion extra
  extra_section_type TEXT,
  extra_section_content TEXT,
  
  -- CTAs
  cta_main TEXT,
  cta_secondary TEXT,
  cta_button_text TEXT,
  cta_secondary_text TEXT,
  cta_urgency TEXT,
  cta_badge_1 TEXT,
  cta_badge_2 TEXT,
  cta_badge_3 TEXT,
  urgency_message TEXT,
  final_cta_title TEXT,
  final_cta_subtitle TEXT,
  
  -- Datos locales (generados por IA)
  local_facts JSONB DEFAULT '{}'::jsonb,
  local_tips TEXT,
  local_tips_list JSONB DEFAULT '[]'::jsonb,
  common_problems JSONB DEFAULT '[]'::jsonb,
  
  -- Contenido estructurado
  faqs JSONB DEFAULT '[]'::jsonb,
  testimonials JSONB DEFAULT '[]'::jsonb,
  custom_reviews JSONB DEFAULT '[]'::jsonb,
  why_choose_us JSONB DEFAULT '[]'::jsonb,
  services_offered JSONB DEFAULT '[]'::jsonb,
  price_range JSONB DEFAULT '{}'::jsonb,
  coverage_zones JSONB DEFAULT '[]'::jsonb,
  
  -- Imagenes
  hero_image_url TEXT,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  images_config JSONB DEFAULT '{}'::jsonb,
  
  -- Configuracion de diseno
  design_variant JSONB DEFAULT '{}'::jsonb,
  design_variation JSONB DEFAULT '{}'::jsonb,
  layout_config JSONB DEFAULT '{}'::jsonb,
  sections_config JSONB DEFAULT '{}'::jsonb,
  style_overrides JSONB DEFAULT '{}'::jsonb,
  
  -- SEO avanzado
  seo_config JSONB DEFAULT '{}'::jsonb,
  sitemap_priority NUMERIC DEFAULT 0.7,
  sitemap_changefreq TEXT DEFAULT 'weekly',
  sitemap_exclude BOOLEAN DEFAULT FALSE,
  
  -- Ubicacion
  latitude NUMERIC,
  longitude NUMERIC,
  show_map BOOLEAN DEFAULT TRUE,
  
  -- Generacion
  generation_attempts INTEGER DEFAULT 0,
  error_message TEXT
);

-- Indices para pages
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_service_id ON pages(service_id);
CREATE INDEX IF NOT EXISTS idx_pages_city_id ON pages(city_id);
CREATE INDEX IF NOT EXISTS idx_pages_service_city ON pages(service_id, city_id);

-- ============================================
-- 4. TABLA: assets (Recursos/Imagenes)
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT,
  tags TEXT[],
  width INTEGER,
  height INTEGER,
  file_size INTEGER
);

-- Indices para assets
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

-- ============================================
-- 5. TABLA: page_assets (Relacion Pagina-Asset)
-- ============================================
CREATE TABLE IF NOT EXISTS page_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  section TEXT,
  position INTEGER DEFAULT 0
);

-- Indices para page_assets
CREATE INDEX IF NOT EXISTS idx_page_assets_page_id ON page_assets(page_id);

-- ============================================
-- 6. TABLA: service_image_templates (Plantillas de Imagenes por Servicio)
-- ============================================
CREATE TABLE IF NOT EXISTS service_image_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT,
  alt_text TEXT,
  position INTEGER DEFAULT 0
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_service_image_templates_service_id ON service_image_templates(service_id);

-- ============================================
-- 7. TABLA: design_presets (Presets de Diseno)
-- ============================================
CREATE TABLE IF NOT EXISTS design_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN DEFAULT FALSE
);

-- ============================================
-- 8. TABLA: generation_queue (Cola de Generacion)
-- ============================================
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT
);

-- Indices para generation_queue
CREATE INDEX IF NOT EXISTS idx_generation_queue_page_id ON generation_queue(page_id);
CREATE INDEX IF NOT EXISTS idx_generation_queue_scheduled ON generation_queue(scheduled_for);

-- ============================================
-- 9. TABLA: blog_posts (Articulos del Blog)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  meta_description TEXT,
  sitemap_priority NUMERIC DEFAULT 0.6,
  sitemap_changefreq TEXT DEFAULT 'monthly',
  sitemap_exclude BOOLEAN DEFAULT FALSE
);

-- Indices para blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- ============================================
-- 10. TABLA: site_config (Configuracion del Sitio)
-- ============================================
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key TEXT NOT NULL UNIQUE,
  value JSONB DEFAULT '{}'::jsonb
);

-- Indice para site_config
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

-- ============================================
-- TRIGGERS: Actualizar updated_at automaticamente
-- ============================================

-- Funcion para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para pages
DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para blog_posts
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para site_config
DROP TRIGGER IF EXISTS update_site_config_updated_at ON site_config;
CREATE TRIGGER update_site_config_updated_at
  BEFORE UPDATE ON site_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES: Servicios base
-- ============================================
INSERT INTO services (name, name_singular, slug, description, icon, color_theme, sitemap_priority)
VALUES 
  ('Cerrajero', 'Cerrajero', 'cerrajero', 'Servicio profesional de cerrajeria urgente', 'lock', 'orange', 0.9),
  ('Electricista', 'Electricista', 'electricista', 'Servicio profesional de electricidad', 'zap', 'yellow', 0.9),
  ('Fontanero', 'Fontanero', 'fontanero', 'Servicio profesional de fontaneria', 'droplet', 'blue', 0.9)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DATOS INICIALES: Configuracion del sitio
-- ============================================
INSERT INTO site_config (key, value)
VALUES 
  ('general', '{"site_name": "Electricistas 24H", "phone": "900433214", "whatsapp": "34711267223", "email": "info@electricistass.com"}'::jsonb),
  ('seo', '{"default_title_suffix": "| Electricistas 24H", "default_description": "Servicios profesionales de cerrajeria, electricidad y fontaneria 24 horas"}'::jsonb),
  ('design', '{"primary_color": "emerald", "font_family": "Inter"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- COMPLETADO
-- ============================================
-- Script ejecutado correctamente
-- Tablas creadas: 10
-- Servicios iniciales: 3 (cerrajero, electricista, fontanero)
-- Configuracion inicial: 3 entradas
