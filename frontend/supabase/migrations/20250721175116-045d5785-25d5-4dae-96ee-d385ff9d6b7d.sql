-- Update the trigger function to use the actual service role key
CREATE OR REPLACE FUNCTION notify_waitlist_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Use pg_net to make HTTP request to the edge function
  PERFORM
    net.http_post(
      url := 'https://axsnkfessfornzszswxm.supabase.co/functions/v1/send-waitlist-confirmation-trigger',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c25rZmVzc2Zvcm56c3pzd3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDkwNzQzNCwiZXhwIjoyMDYwNDgzNDM0fQ.wWqgdFAhCWxJJUC7jDp6Uo5uJdDGKbMTx5Ij2wGvqwE'
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