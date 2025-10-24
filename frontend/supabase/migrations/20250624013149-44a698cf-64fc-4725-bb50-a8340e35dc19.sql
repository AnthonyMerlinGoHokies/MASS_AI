
-- Create a table for waitlist emails
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  source TEXT DEFAULT 'website',
  metadata JSONB,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - Allow public inserts for waitlist signups
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist (for public signup)
CREATE POLICY "Anyone can join waitlist" 
  ON public.waitlist 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can view waitlist (for admin purposes)
CREATE POLICY "Only authenticated users can view waitlist" 
  ON public.waitlist 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);
CREATE INDEX idx_waitlist_source ON public.waitlist(source);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_waitlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_waitlist_updated_at();
