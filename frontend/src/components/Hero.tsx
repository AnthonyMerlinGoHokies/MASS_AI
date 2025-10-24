import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, Play, Users, Zap, Target, MessageSquare, Calendar, TrendingUp, Bot, Mail, AlertCircle, Sparkles } from "lucide-react";
import { useWaitlistSubscriber } from '@/hooks/useWaitlistSubscriber';
import WaitlistModal from './WaitlistModal';
import ProductDemo from './ProductDemo';
const Hero = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const {
    joinWaitlist,
    isLoading,
    isSuccess,
    error,
    resetStatus
  } = useWaitlistSubscriber();

  // Mouse tracking for magnetic hover effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      return () => heroElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-bg');
      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + index * 0.2;
        const yPos = -(scrolled * speed);
        (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
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
    await joinWaitlist(email);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (error) resetStatus();
  };
  const handleClaimEdgeClick = () => {
    setIsWaitlistModalOpen(true);
  };
  return <>
      <div id="hero-waitlist" className="min-h-screen pt-32 pb-16 px-8 lg:px-16 xl:px-24 relative overflow-hidden" style={{
      backgroundColor: '#0A0E12'
    }} ref={heroRef}>
        {/* Enhanced Animated Background with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="parallax-bg absolute top-32 left-10 w-96 h-96 bg-gradient-to-br from-ai-cyan/20 via-ai-purple/10 to-ai-midnight/5 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite]"></div>
          <div className="parallax-bg absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-ai-purple/15 via-ai-cyan/10 to-ai-midnight/10 rounded-full blur-2xl animate-[float_12s_ease-in-out_infinite_6s]"></div>
          <div className="parallax-bg absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-ai-midnight/10 via-ai-cyan/5 to-ai-purple/15 rounded-full blur-xl animate-[float_12s_ease-in-out_infinite_3s]"></div>
          
          {/* Enhanced energy particles */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-ai-cyan rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-ai-purple rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-ai-cyan rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-1/6 left-2/3 w-1 h-1 bg-ai-purple rounded-full animate-ping delay-700"></div>
          <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-ai-cyan/70 rounded-full animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Product Demo - First */}
          <section className="relative z-10 mb-20">
            <div className="rounded-[48px] relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
            borderColor: '#3A4656',
            borderWidth: '1px'
          }}>
              {/* Animated Background Elements */}
              <div className="absolute inset-0">
                <div className="absolute top-10 right-20 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{
                backgroundColor: '#1E78FF20'
              }}></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{
                backgroundColor: '#00C8FF15',
                animationDelay: '1s'
              }}></div>
                <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full blur-2xl animate-pulse" style={{
                backgroundColor: '#1E78FF10',
                animationDelay: '0.5s'
              }}></div>
              </div>

              {/* Product Demo Component */}
              <div className="relative z-10 w-full h-full">
                <ProductDemo />
              </div>
            </div>
          </section>

          {/* Hero Section - Second */}
          <section className="relative z-10 mb-20">
            <div className="backdrop-blur-xl rounded-[48px] px-12 py-16 shadow-2xl relative overflow-hidden hover:shadow-3xl transition-all duration-500" style={{
            background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
            borderColor: '#3A4656',
            borderWidth: '1px'
          }}>
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E78FF]/10 to-[#00C8FF]/10 rounded-[48px]"></div>
              
              <div className="text-center relative z-10">
                {/* Innovation Badge */}
                

                {/* Main Headline */}
                <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-extrabold mb-8 leading-[1.1] font-space-grotesk" style={{
                color: '#E6EDF4'
              }} role="heading" aria-level={1}>Your Sales Team, Multiplied</h1>

                {/* Email Signup Form */}
                {isSuccess ? <div className="mb-12">
                    <div className="bg-gradient-to-r from-[#1E78FF]/10 to-[#00C8FF]/10 backdrop-blur-sm rounded-3xl px-8 py-12 shadow-xl max-w-2xl mx-auto" style={{
                  borderColor: '#3A4656',
                  borderWidth: '1px'
                }}>
                      <div className="w-16 h-16 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-4 font-space-grotesk" style={{
                    color: '#E6EDF4'
                  }}>
                        Your Success Journey Starts Now
                      </h3>
                      <p className="text-lg mb-6 font-inter" style={{
                    color: '#B9C5D1'
                  }}>
                        You're now partnered with AI that thinks like your best salesperson, works like your most dedicated team member, 
                        and delivers results like nothing you've seen before. Check your inbox for your first look at what's possible.
                      </p>
                      <Button onClick={() => {
                    setEmail('');
                    resetStatus();
                  }} className="bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg font-space-grotesk magnetic-hover" style={{
                    boxShadow: '0 10px 25px rgba(30, 120, 255, 0.25)'
                  }}>
                        <Mail className="w-4 h-4 mr-2" />
                        Add Another Email
                      </Button>
                    </div>
                  </div> : <div className="mb-12">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 px-6 py-3 rounded-full text-sm font-semibold mb-8 font-space-grotesk border" style={{
                  color: '#00C8FF',
                  borderColor: '#1E78FF40'
                }}>
                      <Zap size={16} className="animate-pulse" />
                      AI agents that prospect, qualify, and book meetings—while you focus on closing.
                      <ArrowRight size={16} className="animate-pulse delay-300" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Join waitlist">
                      <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                        <div className="flex-1">
                          <label htmlFor="hero-email" className="sr-only">Email address</label>
                          <Input id="hero-email" type="email" placeholder="Enter your email to see SIOS in action" value={email} onChange={handleEmailChange} className="min-h-[48px] h-14 rounded-full border font-inter text-base px-6 touch-manipulation focus:ring-2 focus:ring-offset-0" style={{
                        backgroundColor: '#16202A',
                        color: '#E6EDF4',
                        borderColor: '#3A4656'
                      }} onFocus={e => {
                        e.currentTarget.style.borderColor = '#1E78FF';
                        e.currentTarget.style.boxShadow = '0 0 0 2px #1E78FF';
                      }} onBlur={e => {
                        e.currentTarget.style.borderColor = '#3A4656';
                        e.currentTarget.style.boxShadow = 'none';
                      }} disabled={isLoading} required aria-describedby={emailError || error ? "hero-email-error" : undefined} aria-invalid={!!(emailError || error)} autoComplete="email" />
                        </div>
                        <Button type="submit" size="lg" disabled={isLoading} className="min-h-[48px] h-14 px-8 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk text-base shadow-lg magnetic-hover group touch-manipulation" style={{
                      boxShadow: '0 10px 40px rgba(30, 120, 255, 0.25)'
                    }} aria-label={isLoading ? "Submitting email" : "Get early access to SIOS"}>
                          {isLoading ? <>
                              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span className="sr-only">Loading</span>
                            </> : <>
                              <Sparkles size={20} className="mr-2 animate-pulse" aria-hidden="true" />
                              Get Early Access
                              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform duration-300" aria-hidden="true" />
                            </>}
                        </Button>
                      </div>

                      {(emailError || error) && <div id="hero-email-error" className="flex items-center gap-2 text-red-600 text-base bg-red-50 px-6 py-3 rounded-full max-w-2xl mx-auto font-inter border border-red-200" role="alert" aria-live="polite">
                          <AlertCircle size={16} aria-hidden="true" />
                          {emailError || error}
                        </div>}
                    </form>

                    
                  </div>}

                {/* Social Proof */}
                <div className="flex items-center justify-center space-x-12 pt-8 border-t" style={{
                borderColor: '#3A4656'
              }}>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-space-grotesk" style={{
                    color: '#00C8FF'
                  }}>Sales-Specific</div>
                    <div className="text-sm font-inter" style={{
                    color: '#A7B4C2'
                  }}>Training Data</div>
                  </div>
                  <div className="text-center">
                    
                    
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold font-space-grotesk" style={{
                    color: '#1E78FF'
                  }}>5+</div>
                    <div className="text-sm font-inter" style={{
                    color: '#A7B4C2'
                  }}>Specialized Agents</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-16px) rotate(1deg); }
            }
            
            .magnetic-hover {
              transition: transform 0.2s ease-out;
            }
            
            .magnetic-hover:hover {
              transform: translateY(-2px);
            }
          `}
        </style>
      </div>

      <WaitlistModal open={isWaitlistModalOpen} onOpenChange={setIsWaitlistModalOpen} />
    </>;
};
export default Hero;