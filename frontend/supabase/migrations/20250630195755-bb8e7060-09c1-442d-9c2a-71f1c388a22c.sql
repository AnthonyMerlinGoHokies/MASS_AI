
-- Drop the existing waitlist table and create a new one with the specified structure
DROP TABLE IF EXISTS public.waitlist;

-- Create the waitlist_subscribers table with the specified requirements
CREATE TABLE public.waitlist_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed'
);

-- Add Row Level Security (RLS) - Allow public inserts for waitlist signups
ALTER TABLE public.waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist_subscribers (for public signup)
CREATE POLICY "Anyone can join waitlist" 
  ON public.waitlist_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Only authenticated users can view waitlist (for admin purposes)
CREATE POLICY "Only authenticated users can view waitlist" 
  ON public.waitlist_subscribers 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_waitlist_subscribers_email ON public.waitlist_subscribers(email);
CREATE INDEX idx_waitlist_subscribers_created_at ON public.waitlist_subscribers(created_at);
CREATE INDEX idx_waitlist_subscribers_source_page ON public.waitlist_subscribers(source_page);

-- Create a function to automatically update the updated_at timestamp if needed later
CREATE OR REPLACE FUNCTION update_waitlist_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
