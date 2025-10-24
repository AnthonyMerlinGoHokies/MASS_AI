-- Create trigger to call the notification function when someone joins waitlist
CREATE TRIGGER trigger_waitlist_signup
  AFTER INSERT ON public.waitlist_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_waitlist_signup();