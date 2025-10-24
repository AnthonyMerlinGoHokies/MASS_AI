
-- Create a table to track email campaigns and their status
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT NOT NULL,
  days_after_signup INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table to track which emails have been sent to which subscribers
CREATE TABLE public.email_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID NOT NULL REFERENCES public.waitlist_subscribers(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_status TEXT NOT NULL DEFAULT 'sent',
  resend_message_id TEXT,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can manage campaigns
CREATE POLICY "Only authenticated users can manage campaigns" 
  ON public.email_campaigns 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Only authenticated users can view email sends
CREATE POLICY "Only authenticated users can view email sends" 
  ON public.email_sends 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_email_sends_subscriber_id ON public.email_sends(subscriber_id);
CREATE INDEX idx_email_sends_campaign_id ON public.email_sends(campaign_id);
CREATE INDEX idx_email_sends_sent_at ON public.email_sends(sent_at);
CREATE INDEX idx_email_campaigns_days_after_signup ON public.email_campaigns(days_after_signup);
CREATE INDEX idx_email_campaigns_is_active ON public.email_campaigns(is_active);

-- Insert default engagement campaigns
INSERT INTO public.email_campaigns (name, subject, template_type, days_after_signup) VALUES
('Welcome Follow-up', '🚀 Your SIOS Journey Begins - Exclusive Beta Updates Inside!', 'welcome_followup', 3),
('Feature Spotlight', '🎯 See How SIOS Will Transform Your Sales Process', 'feature_spotlight', 7),
('Early Access Reminder', '⚡ You''re Almost In - SIOS Early Access Coming Soon!', 'early_access', 14),
('Community Invite', '🤝 Join the SIOS Beta Community - Connect with Fellow Sales Leaders', 'community_invite', 21),
('Launch Countdown', '🎉 Final Days: SIOS Launches This Week!', 'launch_countdown', 30);

-- Create a function to check and send scheduled emails
CREATE OR REPLACE FUNCTION check_and_send_scheduled_emails()
RETURNS void AS $$
DECLARE
  campaign_record RECORD;
  subscriber_record RECORD;
BEGIN
  -- Loop through active campaigns
  FOR campaign_record IN 
    SELECT * FROM email_campaigns 
    WHERE is_active = true 
    ORDER BY days_after_signup
  LOOP
    -- Find subscribers who should receive this campaign
    FOR subscriber_record IN
      SELECT ws.* 
      FROM waitlist_subscribers ws
      WHERE ws.created_at <= now() - (campaign_record.days_after_signup || ' days')::interval
      AND ws.status = 'subscribed'
      AND NOT EXISTS (
        SELECT 1 FROM email_sends es 
        WHERE es.subscriber_id = ws.id 
        AND es.campaign_id = campaign_record.id
      )
    LOOP
      -- Call the edge function to send the email
      PERFORM
        net.http_post(
          url := 'https://axsnkfessfornzszswxm.supabase.co/functions/v1/send-engagement-email',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c25rZmVzc2Zvcm56c3pzd3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkwNzQzNCwiZXhwIjoyMDYwNDgzNDM0fQ.wWqgdFAhCWxJJUC7jDp6Uo5uJdDGKbMTx5Ij2wGvqwE'
          ),
          body := jsonb_build_object(
            'subscriber_id', subscriber_record.id,
            'campaign_id', campaign_record.id,
            'email', subscriber_record.email,
            'template_type', campaign_record.template_type,
            'subject', campaign_record.subject
          )
        );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a cron job to run the email check every hour
SELECT cron.schedule(
  'send-engagement-emails',
  '0 * * * *', -- every hour at minute 0
  $$SELECT check_and_send_scheduled_emails();$$
);
