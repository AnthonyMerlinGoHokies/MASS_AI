
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useWaitlistSubscriber } from '@/hooks/useWaitlistSubscriber';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { joinWaitlist, isLoading, isSuccess, error, resetStatus } = useWaitlistSubscriber();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous states
    setEmailError('');
    resetStatus();

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Submit to waitlist
    await joinWaitlist(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) resetStatus();
  };

  if (isSuccess) {
    return (
      <section id="waitlist" className="py-16 md:py-20 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }}>
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#1E78FF20' }}></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#00C8FF15' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="backdrop-blur-sm rounded-3xl px-8 py-12 shadow-xl border" style={{ backgroundColor: '#16202A', borderColor: '#3A4656' }}>
              <div className="mb-6">
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: '#00C8FF' }} />
                <h3 className="text-2xl md:text-3xl font-bold mb-4 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                  Thanks for joining! 🎉
                </h3>
                <p className="text-lg mb-6 font-inter" style={{ color: '#B9C5D1' }}>
                  Check your inbox for a confirmation email. You'll be the first to receive updates and offers!
                </p>
                <Button 
                  onClick={() => {
                    setEmail('');
                    resetStatus();
                  }}
                  variant="outline"
                  className="font-space-grotesk"
                  style={{ borderColor: '#00C8FF', color: '#00C8FF' }}
                >
                  Add Another Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="waitlist" className="py-16 md:py-20 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#1E78FF20' }}></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#00C8FF15' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="backdrop-blur-sm rounded-3xl px-8 py-12 shadow-xl border" style={{ backgroundColor: '#16202A', borderColor: '#3A4656' }}>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 px-4 py-2 rounded-full text-sm font-semibold mb-6 font-space-grotesk" style={{ color: '#00C8FF' }}>
              <Mail size={16} />
              Join Our Waitlist
            </div>

            {/* Heading */}
            <h2 
              id="waitlist-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-space-grotesk"
              style={{ color: '#E6EDF4' }}
            >
              Be the First to Know!
            </h2>

            {/* Subheading */}
            <p className="text-base sm:text-lg mb-8 font-inter" style={{ color: '#B9C5D1' }}>
              Join our waitlist and be the first to experience SIOS when we launch. Plus, get exclusive early access and special offers!
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" role="form" aria-label="Join waitlist">
              <div className="backdrop-blur-sm rounded-full p-3" style={{ backgroundColor: '#0A0E12' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="waitlist-email" className="sr-only">Email address</label>
                    <Input
                      id="waitlist-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      className="min-h-[48px] h-12 rounded-full border-0 text-base touch-manipulation focus:ring-2 focus:ring-offset-0"
                      style={{ 
                        backgroundColor: '#16202A',
                        color: '#E6EDF4',
                        borderColor: '#3A4656'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1E78FF';
                        e.currentTarget.style.boxShadow = '0 0 0 2px #1E78FF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#3A4656';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      disabled={isLoading}
                      required
                      aria-describedby={emailError || error ? "waitlist-email-error" : undefined}
                      aria-invalid={!!(emailError || error)}
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="min-h-[48px] h-12 px-8 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk touch-manipulation"
                    aria-label={isLoading ? "Submitting email" : "Join waitlist"}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="sr-only">Loading</span>
                      </>
                    ) : (
                      <>
                        Join Now
                        <ArrowRight size={18} className="ml-2" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Messages */}
              {(emailError || error) && (
                <div 
                  id="waitlist-email-error"
                  className="flex items-center gap-2 text-red-600 text-base bg-red-50 px-4 py-3 rounded-full"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={16} aria-hidden="true" />
                  {emailError || error}
                </div>
              )}
            </form>

            {/* Sub-label */}
            <p className="text-sm mt-4 font-inter" style={{ color: '#A7B4C2' }}>
              Join our Community of beta testers!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
