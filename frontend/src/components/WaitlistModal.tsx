
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, Mail, ArrowRight, AlertCircle, Sparkles, X } from 'lucide-react';
import { useWaitlistSubscriber } from '@/hooks/useWaitlistSubscriber';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WaitlistModal = ({ open, onOpenChange }: WaitlistModalProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { joinWaitlist, isLoading, isSuccess, error, resetStatus } = useWaitlistSubscriber();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setEmailError('');
    resetStatus();

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    await joinWaitlist(email, 'modal');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) resetStatus();
  };

  const handleClose = () => {
    setEmail('');
    setEmailError('');
    resetStatus();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border border-ai-cyan/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-ai-midnight font-space-grotesk text-center">
            {isSuccess ? 'Welcome to the Future! 🚀' : 'Join the Waitlist'}
          </DialogTitle>
          <DialogDescription className="text-ai-gray font-inter text-center">
            {isSuccess 
              ? "You're now on our waitlist. Check your inbox for confirmation!"
              : "Be the first to experience SIOS when we launch. Get exclusive early access!"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-r from-ai-cyan to-ai-purple rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-white" />
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => {
                    setEmail('');
                    resetStatus();
                  }}
                  className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk w-full"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Add Another Email
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleClose}
                  className="border-ai-gray text-ai-gray hover:bg-ai-gray/10 font-space-grotesk w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  className="h-12 rounded-lg border border-ai-cyan/20 bg-white/80 text-ai-midnight placeholder:text-ai-gray/70 focus:ring-2 focus:ring-ai-cyan focus:ring-offset-0 font-inter"
                  disabled={isLoading}
                />
                
                {(emailError || error) && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg font-inter border border-red-200">
                    <AlertCircle size={16} />
                    {emailError || error}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-12 w-full bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 font-space-grotesk"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2 animate-pulse" />
                    Join the Waitlist
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
