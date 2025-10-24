
-- Create a trigger function that will call the edge function via webhook
CREATE OR REPLACE FUNCTION notify_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Use pg_net to make HTTP request to the edge function
  PERFORM
    net.http_post(
      url := 'https://axsnkfessfornzszswxm.supabase.co/functions/v1/send-waitlist-confirmation-trigger',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'waitlist_subscribers',
        'record', row_to_json(NEW),
        'schema', 'public',
        'old_record', null
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger that fires after INSERT on waitlist_subscribers
DROP TRIGGER IF EXISTS trigger_waitlist_signup ON public.waitlist_subscribers;
CREATE TRIGGER trigger_waitlist_signup
  AFTER INSERT ON public.waitlist_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION notify_waitlist_signup();

-- Enable the pg_net extension if not already enabled (for HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net;
