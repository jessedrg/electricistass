-- Add sitemap configuration fields to pages table
ALTER TABLE pages 
ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(2,1) DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'weekly',
ADD COLUMN IF NOT EXISTS sitemap_exclude BOOLEAN DEFAULT false;

-- Add sitemap configuration fields to services table
ALTER TABLE services
ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(2,1) DEFAULT 0.9,
ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'weekly';

-- Add sitemap configuration fields to blog_posts table (if exists)
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS sitemap_priority DECIMAL(2,1) DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS sitemap_changefreq TEXT DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS sitemap_exclude BOOLEAN DEFAULT false;

-- Add comments explaining the fields
COMMENT ON COLUMN pages.sitemap_priority IS 'Priority for sitemap (0.0 to 1.0). Higher = more important';
COMMENT ON COLUMN pages.sitemap_changefreq IS 'Change frequency: always, hourly, daily, weekly, monthly, yearly, never';
COMMENT ON COLUMN pages.sitemap_exclude IS 'If true, exclude this page from the sitemap';

COMMENT ON COLUMN services.sitemap_priority IS 'Priority for service index pages in sitemap';
COMMENT ON COLUMN services.sitemap_changefreq IS 'Change frequency for service index pages';

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'pages' 
  AND column_name LIKE 'sitemap_%'
ORDER BY column_name;
