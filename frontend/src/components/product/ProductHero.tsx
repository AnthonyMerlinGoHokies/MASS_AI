import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, ArrowRight, CheckCircle, Mail, AlertCircle, Sparkles } from "lucide-react";
import { useWaitlistSubscriber } from '@/hooks/useWaitlistSubscriber';
import { useNavigate } from "react-router-dom";
import WaitlistModal from '../WaitlistModal';
import ProductDemoSwitcher from './ProductDemoSwitcher';
const ProductHero = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    joinWaitlist,
    isLoading,
    isSuccess,
    error,
    resetStatus
  } = useWaitlistSubscriber();
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
    await joinWaitlist(email, '/product');
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) resetStatus();
  };
  const handleDemoClick = () => {
    navigate('/', {
      replace: true
    });
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  };
  const handleJoinWaitlistClick = () => {
    setIsWaitlistModalOpen(true);
  };
  return <>
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-black text-ai-midnight leading-tight font-space-grotesk">
                  AI Sales Agents
                  <span className="block text-ai-purple">
                    Trained on Sales Excellence
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-ai-purple">
                    Not Generic AI
                  </span>
                </h1>
                
                <p className="text-xl text-white leading-relaxed font-inter">
                  Deploy specialized AI agents fine-tuned on proven sales methodologies. 
                  Trained to think like elite SDRs—purpose-built for sales conversations, not general chat.
                </p>
              </div>

              {isSuccess ? <div className="mb-12">
                  <div className="bg-gradient-to-r from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm rounded-3xl px-8 py-12 shadow-xl border border-ai-cyan/20 max-w-lg">
                    <div className="w-16 h-16 bg-gradient-to-r from-ai-cyan to-ai-purple rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-ai-midnight mb-4 font-space-grotesk">
                      Welcome to the Future! 🚀
                    </h3>
                    <p className="text-lg text-ai-gray mb-6 font-inter">
                      You're now on our waitlist. Check your inbox for confirmation!
                    </p>
                    <Button onClick={() => {
                  setEmail('');
                  resetStatus();
                }} className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk">
                      <Mail className="w-4 h-4 mr-2" />
                      Add Another Email
                    </Button>
                  </div>
                </div> : <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-gradient-to-r from-ai-light/50 to-white/50 backdrop-blur-sm rounded-full p-3 max-w-lg border border-ai-cyan/10">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <Input type="email" placeholder="Enter your email for early access" value={email} onChange={handleEmailChange} className="h-12 rounded-full border-0 bg-white/90 text-ai-midnight placeholder:text-ai-gray/70 focus:ring-2 focus:ring-ai-cyan focus:ring-offset-0 font-inter" disabled={isLoading} />
                        </div>
                        <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-6 bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk shadow-lg hover:shadow-xl">
                          {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>
                              <Sparkles size={16} className="mr-2 animate-pulse" />
                              Join the Waitlist
                              <ArrowRight size={16} className="ml-2" />
                            </>}
                        </Button>
                      </div>
                    </div>

                    {(emailError || error) && <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-2 rounded-full max-w-lg font-inter border border-red-200">
                        <AlertCircle size={16} />
                        {emailError || error}
                      </div>}
                  </form>
                </div>}

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ai-cyan font-space-grotesk">Elite SDRs</div>
                  <div className="text-sm text-ai-purple font-inter">Training Data</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ai-cyan font-space-grotesk">Sales-Specific</div>
                  <div className="text-sm text-ai-purple font-inter">Fine-Tuning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-ai-cyan font-space-grotesk">5+</div>
                  <div className="text-sm text-ai-purple font-inter">Specialized Agents</div>
                </div>
              </div>

              {/* Additional CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button onClick={handleJoinWaitlistClick} className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk">
                  <Sparkles size={16} className="mr-2" />
                  Get Early Access
                </Button>
                
                
              </div>
            </div>

            {/* Right Column - Interactive Demo */}
            <div className="relative">
              <ProductDemoSwitcher />
            </div>
          </div>
        </div>
      </section>

      <WaitlistModal open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen} />
    </>;
};
export default ProductHero;