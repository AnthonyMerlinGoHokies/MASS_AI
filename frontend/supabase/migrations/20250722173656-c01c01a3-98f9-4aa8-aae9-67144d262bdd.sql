
-- Update the function to check and send scheduled emails at 9 AM
CREATE OR REPLACE FUNCTION check_and_send_scheduled_emails()
RETURNS void AS $$
DECLARE
  campaign_record RECORD;
  subscriber_record RECORD;
  target_send_date DATE;
  current_time TIME;
BEGIN
  -- Get current time to check if it's around 9 AM (we'll run this hourly, so check if it's between 9-10 AM)
  current_time := CURRENT_TIME;
  
  -- Only proceed if it's between 9 AM and 10 AM
  IF current_time < '09:00:00' OR current_time >= '10:00:00' THEN
    RETURN;
  END IF;

  -- Loop through active campaigns
  FOR campaign_record IN 
    SELECT * FROM email_campaigns 
    WHERE is_active = true 
    ORDER BY days_after_signup
  LOOP
    -- Calculate the target send date (signup date + campaign days)
    FOR subscriber_record IN
      SELECT ws.* 
      FROM waitlist_subscribers ws
      WHERE ws.status = 'subscribed'
      AND NOT EXISTS (
        SELECT 1 FROM email_sends es 
        WHERE es.subscriber_id = ws.id 
        AND es.campaign_id = campaign_record.id
      )
    LOOP
      -- Calculate when this email should be sent (signup date + campaign days)
      target_send_date := (subscriber_record.created_at::DATE + (campaign_record.days_after_signup || ' days')::interval)::DATE;
      
      -- Check if today is the target send date
      IF target_send_date = CURRENT_DATE THEN
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
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
