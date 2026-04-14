-- Add more customization fields for pages
-- All fields are JSON to allow maximum flexibility

-- Page layout and spacing configuration
ALTER TABLE pages ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{
  "hero_height": "large",
  "section_spacing": "normal",
  "container_width": "default",
  "show_breadcrumbs": true,
  "show_share_buttons": true
}'::jsonb;

-- SEO and meta tags configuration
ALTER TABLE pages ADD COLUMN IF NOT EXISTS seo_config JSONB DEFAULT '{
  "robots": "index, follow",
  "canonical_url": null,
  "og_type": "website",
  "twitter_card": "summary_large_image",
  "structured_data_type": "LocalBusiness"
}'::jsonb;

-- Custom reviews/testimonials that override AI generated
ALTER TABLE pages ADD COLUMN IF NOT EXISTS custom_reviews JSONB DEFAULT NULL;

-- Custom images gallery
ALTER TABLE pages ADD COLUMN IF NOT EXISTS images_config JSONB DEFAULT '{
  "hero_image_height": "400px",
  "gallery_columns": 3,
  "gallery_style": "grid",
  "show_gallery": true
}'::jsonb;

-- Sections visibility and order
ALTER TABLE pages ADD COLUMN IF NOT EXISTS sections_config JSONB DEFAULT '{
  "sections_order": ["hero", "services", "why_choose", "testimonials", "coverage", "faq", "cta"],
  "hidden_sections": [],
  "custom_sections": []
}'::jsonb;

-- Component styling overrides
ALTER TABLE pages ADD COLUMN IF NOT EXISTS style_overrides JSONB DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN pages.layout_config IS 'Layout settings: hero_height (small/medium/large/full), section_spacing (compact/normal/relaxed), container_width (narrow/default/wide/full)';
COMMENT ON COLUMN pages.seo_config IS 'SEO settings: robots, canonical_url, og_type, twitter_card, structured_data_type';
COMMENT ON COLUMN pages.custom_reviews IS 'Custom reviews array: [{name, location, text, rating, service_type, date_ago, avatar_url}]';
COMMENT ON COLUMN pages.images_config IS 'Image settings: hero_image_height, gallery_columns, gallery_style (grid/masonry/carousel), show_gallery';
COMMENT ON COLUMN pages.sections_config IS 'Sections order and visibility: sections_order, hidden_sections, custom_sections';
COMMENT ON COLUMN pages.style_overrides IS 'CSS/Tailwind overrides for specific components';

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pages' 
AND column_name IN ('layout_config', 'seo_config', 'custom_reviews', 'images_config', 'sections_config', 'style_overrides');
