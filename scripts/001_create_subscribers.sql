-- Create subscribers table for newsletter signups
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('brand_seller', 'agency', 'saas_tech', 'investor', 'service_provider', 'other')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'website'
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);

-- Enable Row Level Security
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (for public newsletter signup)
CREATE POLICY "Allow public inserts" ON public.subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow service role to read all subscribers (for admin purposes)
CREATE POLICY "Allow service role to read" ON public.subscribers
  FOR SELECT
  USING (true);
