-- Add extended content fields to pages table for rich content
-- This makes every page unique and avoids thin content

-- Additional content fields
ALTER TABLE pages ADD COLUMN IF NOT EXISTS h1_variant TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS intro_highlight TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS local_tips_list JSONB DEFAULT '[]';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS why_choose_us JSONB DEFAULT '[]';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS common_problems JSONB DEFAULT '[]';
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_main TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_secondary TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS cta_urgency TEXT;
ALTER TABLE pages ADD COLUMN IF NOT EXISTS city_specific_content TEXT;

-- Design variation stored as JSONB for flexibility
ALTER TABLE pages ADD COLUMN IF NOT EXISTS design_variation JSONB DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN pages.h1_variant IS 'Alternative H1 for A/B testing';
COMMENT ON COLUMN pages.intro_highlight IS 'Key phrase to highlight in intro';
COMMENT ON COLUMN pages.local_tips_list IS 'Array of {tip, explanation} objects';
COMMENT ON COLUMN pages.why_choose_us IS 'Array of {title, description, icon} objects';
COMMENT ON COLUMN pages.common_problems IS 'Array of {problem, description, solution} objects';
COMMENT ON COLUMN pages.design_variation IS 'JSON with layout_variant, color_scheme, hero_style, etc.';
COMMENT ON COLUMN pages.city_specific_content IS 'Unique content about this specific city+service combo';
