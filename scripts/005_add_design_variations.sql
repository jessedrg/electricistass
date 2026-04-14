-- Add design variation fields to pages table for unique visual appearance
-- Each page can have its own layout, colors, and styling

ALTER TABLE pages ADD COLUMN IF NOT EXISTS design_variant JSONB DEFAULT '{
  "layout": "default",
  "hero_style": "centered",
  "color_accent": "blue",
  "section_order": ["intro", "services", "zones", "tips", "testimonials", "map", "faqs", "cta"],
  "show_price_badge": true,
  "testimonial_style": "cards",
  "faq_style": "accordion",
  "cta_style": "banner"
}'::jsonb;

-- Add city images fields
ALTER TABLE cities ADD COLUMN IF NOT EXISTS city_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS skyline_image_url TEXT;
ALTER TABLE cities ADD COLUMN IF NOT EXISTS monument_image_url TEXT;

-- Add more service-specific styling
ALTER TABLE services ADD COLUMN IF NOT EXISTS color_theme TEXT DEFAULT 'blue';
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_style TEXT DEFAULT 'outline';

-- Create a table for reusable image templates per service type
CREATE TABLE IF NOT EXISTS service_image_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL, -- 'hero', 'gallery', 'icon', 'background'
  image_url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Design presets for quick customization
CREATE TABLE IF NOT EXISTS design_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  config JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default design presets
INSERT INTO design_presets (name, description, config, is_default) VALUES
(
  'moderno',
  'Diseno moderno con hero grande y cards',
  '{
    "layout": "wide",
    "hero_style": "full-width",
    "color_accent": "blue",
    "section_order": ["intro", "services", "testimonials", "zones", "map", "faqs", "cta"],
    "show_price_badge": true,
    "testimonial_style": "carousel",
    "faq_style": "accordion",
    "cta_style": "floating",
    "spacing": "relaxed",
    "typography": "modern"
  }',
  true
),
(
  'clasico',
  'Diseno clasico y profesional',
  '{
    "layout": "contained",
    "hero_style": "split",
    "color_accent": "navy",
    "section_order": ["intro", "zones", "services", "testimonials", "faqs", "map", "cta"],
    "show_price_badge": true,
    "testimonial_style": "list",
    "faq_style": "list",
    "cta_style": "banner",
    "spacing": "compact",
    "typography": "serif"
  }',
  false
),
(
  'minimalista',
  'Diseno limpio y minimalista',
  '{
    "layout": "narrow",
    "hero_style": "minimal",
    "color_accent": "slate",
    "section_order": ["intro", "services", "zones", "faqs", "testimonials", "map", "cta"],
    "show_price_badge": false,
    "testimonial_style": "quotes",
    "faq_style": "simple",
    "cta_style": "inline",
    "spacing": "airy",
    "typography": "clean"
  }',
  false
),
(
  'urgente',
  'Diseno para servicios de urgencia',
  '{
    "layout": "wide",
    "hero_style": "urgent",
    "color_accent": "red",
    "section_order": ["cta", "intro", "services", "zones", "testimonials", "faqs", "map"],
    "show_price_badge": true,
    "testimonial_style": "badges",
    "faq_style": "accordion",
    "cta_style": "sticky",
    "spacing": "tight",
    "typography": "bold"
  }',
  false
),
(
  'premium',
  'Diseno premium y elegante',
  '{
    "layout": "wide",
    "hero_style": "parallax",
    "color_accent": "amber",
    "section_order": ["intro", "services", "testimonials", "zones", "map", "faqs", "cta"],
    "show_price_badge": true,
    "testimonial_style": "featured",
    "faq_style": "expandable",
    "cta_style": "elegant",
    "spacing": "luxurious",
    "typography": "elegant"
  }',
  false
)
ON CONFLICT (name) DO NOTHING;

-- Update cities with real images (placeholders that can be customized)
UPDATE cities SET 
  skyline_image_url = 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&h=600&fit=crop',
  monument_image_url = 'https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=800&h=600&fit=crop'
WHERE slug = 'madrid';

UPDATE cities SET 
  skyline_image_url = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=600&fit=crop',
  monument_image_url = 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=800&h=600&fit=crop'
WHERE slug = 'barcelona';

UPDATE cities SET 
  skyline_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
  monument_image_url = 'https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=800&h=600&fit=crop'
WHERE slug = 'valencia';

UPDATE cities SET 
  skyline_image_url = 'https://images.unsplash.com/photo-1555862124-94036092ab14?w=1200&h=600&fit=crop',
  monument_image_url = 'https://images.unsplash.com/photo-1561632669-7f55f7975606?w=800&h=600&fit=crop'
WHERE slug = 'sevilla';

UPDATE cities SET 
  skyline_image_url = 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=1200&h=600&fit=crop',
  monument_image_url = 'https://images.unsplash.com/photo-1570698473651-b2de99bae12f?w=800&h=600&fit=crop'
WHERE slug = 'bilbao';

-- Update services with color themes
UPDATE services SET color_theme = 'blue', icon_style = 'solid' WHERE slug = 'fontanero';
UPDATE services SET color_theme = 'amber', icon_style = 'outline' WHERE slug = 'electricista';
UPDATE services SET color_theme = 'slate', icon_style = 'solid' WHERE slug = 'cerrajero';
UPDATE services SET color_theme = 'orange', icon_style = 'outline' WHERE slug = 'pintor';
UPDATE services SET color_theme = 'cyan', icon_style = 'solid' WHERE slug = 'climatizacion';
UPDATE services SET color_theme = 'emerald', icon_style = 'outline' WHERE slug = 'jardinero';
UPDATE services SET color_theme = 'violet', icon_style = 'solid' WHERE slug = 'limpieza';
UPDATE services SET color_theme = 'rose', icon_style = 'outline' WHERE slug = 'albanil';
UPDATE services SET color_theme = 'indigo', icon_style = 'solid' WHERE slug = 'carpintero';
UPDATE services SET color_theme = 'teal', icon_style = 'outline' WHERE slug = 'cristalero';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_design_variant ON pages USING gin(design_variant);
CREATE INDEX IF NOT EXISTS idx_design_presets_name ON design_presets(name);
