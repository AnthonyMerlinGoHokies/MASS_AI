
-- Create a table for Eleven Labs call interactions
CREATE TABLE public.eleven_labs_call_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_id TEXT,
  call_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  call_ended_at TIMESTAMP WITH TIME ZONE,
  call_duration_seconds INTEGER,
  
  -- Transcript data
  input_transcript TEXT,
  output_transcript TEXT,
  
  -- Eleven Labs specific data
  voice_id TEXT,
  voice_name TEXT,
  model_id TEXT,
  voice_settings JSONB,
  
  -- Cost tracking
  characters_used INTEGER,
  cost_per_character DECIMAL(10, 6),
  total_cost DECIMAL(10, 4),
  currency TEXT DEFAULT 'USD',
  
  -- Token usage (if applicable for future integrations)
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  
  -- Audio data
  audio_duration_seconds DECIMAL(8, 2),
  audio_file_size_bytes BIGINT,
  audio_format TEXT,
  audio_quality TEXT,
  
  -- Request/Response metadata
  request_id TEXT,
  response_latency_ms INTEGER,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  
  -- Additional tracking
  api_endpoint TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.eleven_labs_call_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own call interactions" 
  ON public.eleven_labs_call_interactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own call interactions" 
  ON public.eleven_labs_call_interactions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own call interactions" 
  ON public.eleven_labs_call_interactions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all call interactions"
  ON public.eleven_labs_call_interactions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for better query performance
CREATE INDEX idx_eleven_labs_call_interactions_user_id ON public.eleven_labs_call_interactions(user_id);
CREATE INDEX idx_eleven_labs_call_interactions_session_id ON public.eleven_labs_call_interactions(session_id);
CREATE INDEX idx_eleven_labs_call_interactions_created_at ON public.eleven_labs_call_interactions(created_at);
CREATE INDEX idx_eleven_labs_call_interactions_status ON public.eleven_labs_call_interactions(status);
CREATE INDEX idx_eleven_labs_call_interactions_cost ON public.eleven_labs_call_interactions(total_cost);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_eleven_labs_call_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_eleven_labs_call_interactions_updated_at
  BEFORE UPDATE ON public.eleven_labs_call_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_eleven_labs_call_interactions_updated_at();
