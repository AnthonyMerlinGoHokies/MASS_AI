
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWaitlistSubscriber = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinWaitlist = async (email: string, sourcePage?: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('Starting waitlist signup for:', email);
      
      // Insert into the waitlist_subscribers table
      const { error: insertError } = await supabase
        .from('waitlist_subscribers')
        .insert({
          email: email.toLowerCase().trim(),
          source_page: sourcePage || window.location.pathname,
          status: 'subscribed'
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
        if (insertError.code === '23505') {
          setError("You're already on the list!");
        } else {
          setError('Something went wrong. Please try again.');
        }
        return false;
      }

      console.log('Database insert successful - email will be sent in background');
      
      // Return success immediately - email will be handled by database trigger
      setIsSuccess(true);
      return true;
    } catch (err) {
      console.error('General error in joinWaitlist:', err);
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetStatus = () => {
    setIsSuccess(false);
    setError(null);
  };

  return {
    joinWaitlist,
    isLoading,
    isSuccess,
    error,
    resetStatus
  };
};
