-- Create settings table for app configuration
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default cron setting (enabled by default)
INSERT INTO settings (key, value) VALUES 
  ('cron_auto_generate', '{"enabled": true}')
ON CONFLICT (key) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
