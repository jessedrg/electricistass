-- pSEO Servicios del Hogar - Schema completo
-- Ejecutar en Supabase SQL Editor

-- Servicios (fontaneria, electricidad, etc.)
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_singular TEXT,
  description TEXT,
  icon TEXT,
  hero_image_url TEXT,
  thumbnail_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  keywords TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ciudades (Top 50 Espana)
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  province TEXT NOT NULL,
  autonomous_community TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  city_image_url TEXT,
  landmarks TEXT[],
  neighborhoods JSONB DEFAULT '[]',
  local_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Paginas generadas (servicio+ciudad)
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  
  -- SEO Metadata
  title TEXT NOT NULL,
  meta_description TEXT,
  h1 TEXT,
  
  -- Imagenes
  hero_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  
  -- Contenido estructurado
  intro_text TEXT,
  services_offered JSONB DEFAULT '[]',
  coverage_zones JSONB DEFAULT '[]',
  local_tips TEXT,
  testimonials JSONB DEFAULT '[]',
  faqs JSONB DEFAULT '[]',
  price_range JSONB,
  
  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'published', 'error')),
  error_message TEXT,
  generation_attempts INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service_id, city_id)
);

-- Cola de generacion
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  author TEXT DEFAULT 'Equipo Editorial',
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets/imagenes centralizada
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT CHECK (category IN ('service', 'city', 'page', 'blog', 'general')),
  tags TEXT[],
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relacion paginas-assets
CREATE TABLE IF NOT EXISTS page_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  section TEXT CHECK (section IN ('hero', 'gallery', 'content', 'testimonial')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, asset_id)
);

-- Configuracion global
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_service_city ON pages(service_id, city_id);
CREATE INDEX IF NOT EXISTS idx_pages_published_at ON pages(published_at);
CREATE INDEX IF NOT EXISTS idx_generation_queue_scheduled ON generation_queue(scheduled_for) WHERE completed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pages_updated_at ON pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
