import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useResendConfirmation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resendConfirmation = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      console.log('Resending confirmation email for:', email);
      
      const { data, error: functionError } = await supabase.functions.invoke(
        'resend-waitlist-confirmation',
        {
          body: { email: email.toLowerCase().trim() }
        }
      );

      if (functionError) {
        console.error('Function error:', functionError);
        setError('Failed to resend confirmation email. Please try again.');
        return false;
      }

      if (data?.error) {
        console.error('Response error:', data.error);
        if (data.error === 'Email not found in waitlist') {
          setError('Email not found. Please join the waitlist first.');
        } else {
          setError('Failed to resend confirmation email. Please try again.');
        }
        return false;
      }

      console.log('Confirmation email resent successfully');
      setIsSuccess(true);
      return true;
    } catch (err) {
      console.error('General error in resendConfirmation:', err);
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
    resendConfirmation,
    isLoading,
    isSuccess,
    error,
    resetStatus
  };
};