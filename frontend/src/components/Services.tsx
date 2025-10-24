import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Brain, Zap, Target, MessageSquare, TrendingUp, Users, Sparkles, Rocket, Shield, Clock } from "lucide-react";
import WaitlistModal from "./WaitlistModal";

const Services = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [counters, setCounters] = useState({ speed: 0, scale: 0, uptime: 0, reliability: 0 });
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const services = [
    {
      icon: Bot,
      title: "Your AI Sales Team",
      description: "Deploy intelligent agents that work like your top performers—each with unique strengths, personalities, and expertise that complement your human team perfectly.",
      features: ["Scales with your growth", "Learns your best practices", "Speaks your customers' language", "Never takes a day off"],
      color: "from-ai-cyan to-ai-cyan/80",
      badge: "Core Intelligence"
    },
    {
      icon: Brain,
      title: "Perfect Prospect Discovery",
      description: "Your AI partner continuously learns what makes your ideal customer tick, then finds more of them while you focus on closing deals.",
      features: ["Finds prospects you'd never discover", "Predicts buying intent", "Understands market trends", "Prioritizes your best opportunities"],
      color: "from-ai-purple to-ai-purple/80",
      badge: "Smart Discovery"
    },
    {
      icon: MessageSquare,
      title: "Conversations That Convert",
      description: "Every message feels personal because it is. Our AI crafts conversations that resonate with each prospect, delivered at the perfect moment through their preferred channel.",
      features: ["Sounds like you wrote it", "Reaches them where they are", "Knows the perfect timing", "Responds instantly"],
      color: "from-ai-midnight to-ai-slate",
      badge: "Smart Engagement"
    },
    {
      icon: TrendingUp,
      title: "Revenue That Grows Itself",
      description: "Watch your sales process get smarter with every deal. Our AI continuously optimizes your approach, pricing, and timing to maximize every opportunity.",
      features: ["Learns from every win", "Predicts revenue trends", "Scales your success"],
      color: "from-ai-cyan/80 to-ai-purple/80",
      badge: "Growth Engine"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Speed That Scales",
      description: "What used to take your team months now happens in hours. Every process accelerates as your AI gets smarter.",
      stat: "10x",
      counter: "speed"
    },
    {
      icon: Users,
      title: "Growth Without Limits",
      description: "Your AI team grows with you. Handle any volume, enter any market, scale any opportunity—without the usual constraints.",
      stat: "∞",
      counter: "scale"
    },
    {
      icon: Clock,
      title: "Always Working for You",
      description: "While you sleep, your AI is qualifying leads, nurturing prospects, and moving deals forward. Wake up to a fuller pipeline.",
      stat: "24/7",
      counter: "uptime"
    },
    {
      icon: Shield,
      title: "Reliability You Can Count On",
      description: "Your AI team is as dependable as your best employee—actually, even more so. Built for the mission-critical work of driving revenue.",
      stat: "99.9%",
      counter: "reliability"
    }
  ];

  // Counter animation function
  const animateCounter = (target: number, key: string, suffix: string = "") => {
    let current = 0;
    const increment = target / 60; // 60 frames for smooth animation
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCounters(prev => ({
        ...prev,
        [key]: key === 'reliability' ? `${current.toFixed(1)}%` : 
               key === 'speed' ? `${Math.floor(current)}x` :
               key === 'uptime' ? '24/7' : '∞'
      }));
    }, 16);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            
            // Trigger staggered card animations
            cardsRef.current.forEach((card, index) => {
              if (card) {
                setTimeout(() => {
                  card.classList.add('animate-fade-in-up');
                  card.classList.remove('opacity-0', 'translate-y-8');
                }, index * 150);
              }
            });

            // Start counter animations
            setTimeout(() => {
              animateCounter(10, 'speed');
              animateCounter(99.9, 'reliability');
            }, 800);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isHeaderVisible) {
            setIsHeaderVisible(true);
            if (headerRef.current) {
              headerRef.current.classList.add('animate-fade-in-up');
              headerRef.current.classList.remove('opacity-0', 'translate-y-8', 'scale-95');
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: '0px 0px -50px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current);
      }
    };
  }, [isVisible, isHeaderVisible]);

  const setCardRef = (index: number) => (el: HTMLDivElement | null) => {
    cardsRef.current[index] = el;
  };

  return (
    <section id="services" className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }} ref={sectionRef}>
      {/* Enhanced Background Elements with Parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl transform-gpu animate-pulse" style={{ backgroundColor: '#1E78FF20' }}></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl transform-gpu animate-pulse delay-1000" style={{ backgroundColor: '#00C8FF15' }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-2xl transform-gpu animate-pulse delay-500" style={{ backgroundColor: '#1E78FF10' }}></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border hover:scale-105 transition-all duration-300" style={{ borderColor: '#1E78FF40' }}>
            <Sparkles className="h-5 w-5 mr-2 animate-pulse" style={{ color: '#00C8FF' }} />
            <span className="text-sm font-semibold uppercase tracking-wider font-space-grotesk" style={{ color: '#E6EDF4' }}>Your Competitive Edge</span>
            <Rocket className="h-5 w-5 ml-2 animate-pulse delay-300" style={{ color: '#1E78FF' }} />
          </div>
          
          <h2 
            id="services-heading"
            ref={headerRef}
            className="opacity-0 translate-y-8 scale-95 text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-6 font-space-grotesk leading-tight transition-all duration-1000 ease-out"
            style={{ color: '#E6EDF4' }}
          >
            AI Trained on Sales Excellence
          </h2>
          
          <p className="text-lg sm:text-xl max-w-3xl mx-auto font-inter leading-relaxed" style={{ color: '#B9C5D1' }}>
            Every agent learns from proven sales methodologies and elite performance patterns. 
            Not generic AI—purpose-built and trained specifically for sales conversations and conversions.
          </p>
        </div>

        {/* Services Grid with Staggered Animation */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {services.map((service, index) => (
            <Card 
              key={index} 
              ref={setCardRef(index)}
              className="opacity-0 translate-y-8 backdrop-blur-sm rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105"
              style={{ backgroundColor: '#16202A', borderColor: '#3A4656', borderWidth: '1px' }}
            >
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold font-space-grotesk" style={{ color: '#E6EDF4' }}>
                        {service.title}
                      </h3>
                      <span className="ml-3 px-3 py-1 bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 text-xs font-semibold rounded-full border" style={{ color: '#00C8FF', borderColor: '#1E78FF40' }}>
                        {service.badge}
                      </span>
                    </div>
                    <p className="font-inter leading-relaxed" style={{ color: '#B9C5D1' }}>
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] rounded-full animate-pulse"></div>
                      <span className="font-inter" style={{ color: '#A7B4C2' }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={() => setIsWaitlistOpen(true)}
                  className="mt-6 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-semibold rounded-full font-space-grotesk transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Section with Counter Animation */}
        <div className="rounded-3xl p-12 relative overflow-hidden" style={{ 
          background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
          borderColor: '#3A4656',
          borderWidth: '1px'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E78FF]/10 to-[#00C8FF]/10"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                Your Sales Success, Amplified
              </h3>
              <p className="max-w-2xl mx-auto text-lg font-inter" style={{ color: '#B9C5D1' }}>
                Join forward-thinking companies that are already experiencing what happens when human expertise meets AI intelligence
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300" style={{ backgroundColor: '#1E78FF30' }}>
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2 font-space-grotesk" style={{ color: '#00C8FF' }}>
                    {benefit.counter === 'speed' ? counters.speed :
                     benefit.counter === 'reliability' ? counters.reliability :
                     benefit.stat}
                  </div>
                  <h4 className="text-lg font-semibold mb-2 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                    {benefit.title}
                  </h4>
                  <p className="text-sm font-inter" style={{ color: '#B9C5D1' }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                onClick={() => setIsWaitlistOpen(true)}
                size="lg" 
                className="bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl font-space-grotesk magnetic-hover"
                style={{ boxShadow: '0 20px 60px rgba(30, 120, 255, 0.25)' }}
              >
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                See What's Possible
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal
        open={isWaitlistOpen}
        onOpenChange={setIsWaitlistOpen}
      />
    </section>
  );
};

export default Services;
