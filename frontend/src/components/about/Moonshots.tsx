
import { useState, useEffect, useRef } from "react";
import { Target, DollarSign, Clock, TrendingUp } from "lucide-react";

const Moonshots = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counters, setCounters] = useState({ hours: 0, revenue: 0 });

  // Counter animation function
  const animateCounter = (target: number, key: string, duration: number = 2000) => {
    let current = 0;
    const increment = target / (duration / 16); // 60fps
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setCounters(prev => ({
        ...prev,
        [key]: Math.floor(current)
      }));
    }, 16);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            // Start counter animations
            setTimeout(() => {
              animateCounter(100, 'hours', 3000); // 100 million
              animateCounter(1, 'revenue', 3000); // 1 billion
            }, 500);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  const moonshots = [
    {
      icon: Clock,
      title: "Save Time",
      number: counters.hours,
      suffix: "M",
      description: "Million hours of Sales Professionals time saved from manual sales tasks",
      gradient: "from-ai-cyan to-ai-purple",
      bgGradient: "from-ai-cyan/10 to-ai-purple/10",
      textColor: "text-ai-cyan"
    },
    {
      icon: DollarSign,
      title: "Generate Revenue",
      number: counters.revenue,
      suffix: "B",
      description: "Billion Dollars in Revenue generated for Businesses worldwide using our product",
      gradient: "from-ai-purple to-ai-cyan",
      bgGradient: "from-ai-purple/10 to-ai-cyan/10",
      textColor: "text-ai-purple"
    }
  ];

  return (
    <section ref={sectionRef} className="py-20 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-ai-cyan/5 to-ai-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-gradient-to-br from-ai-purple/5 to-ai-midnight/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-ai-cyan/20">
            <Target className="h-5 w-5 mr-2 text-ai-cyan" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider font-space-grotesk">Our Moonshots</span>
            <TrendingUp className="h-5 w-5 ml-2 text-ai-purple" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-ai-midnight mb-4 font-space-grotesk">
            Audacious Goals That Drive Us Forward
          </h2>
          
          <p className="text-xl text-ai-gray max-w-3xl mx-auto font-inter leading-relaxed">
            These ambitious targets represent our commitment to transforming the global sales landscape 
            through AI-powered automation and intelligence.
          </p>
        </div>

        {/* Moonshots Grid */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {moonshots.map((moonshot, index) => (
            <div 
              key={index}
              className={`
                relative bg-gradient-to-br ${moonshot.bgGradient} backdrop-blur-sm 
                rounded-3xl p-8 lg:p-12 border border-white/20 group cursor-pointer
                transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-ai-cyan/20
                hover:border-ai-cyan/40 hover:bg-white/10
                ${isVisible ? 'animate-fade-in opacity-100' : 'opacity-0 translate-y-8'}
                overflow-hidden
              `}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Hover Background Effect */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${moonshot.gradient} opacity-0 
                group-hover:opacity-5 transition-opacity duration-500
              `}></div>
              
              {/* Animated Border on Hover */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${moonshot.gradient} opacity-20 blur-sm animate-pulse`}></div>
              </div>

              {/* Icon with Enhanced Hover Effects */}
              <div className={`
                relative z-10 w-20 h-20 bg-gradient-to-br ${moonshot.gradient} rounded-2xl 
                flex items-center justify-center mb-6 transition-all duration-500
                group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-ai-cyan/30
              `}>
                <moonshot.icon className="h-10 w-10 text-white transition-all duration-300 group-hover:scale-110" />
                
                {/* Icon Glow Effect */}
                <div className={`
                  absolute inset-0 rounded-2xl bg-gradient-to-br ${moonshot.gradient} 
                  opacity-0 group-hover:opacity-20 blur-md transition-opacity duration-500
                `}></div>
              </div>

              {/* Number Display with Solid Visibility */}
              <div className="mb-8 relative z-10">
                <div className="relative">
                  {/* Background glow for numbers */}
                  <div className={`
                    absolute inset-0 text-8xl lg:text-9xl xl:text-[10rem] font-black 
                    ${moonshot.textColor} opacity-20 blur-sm group-hover:opacity-40 
                    transition-opacity duration-500 leading-none
                  `}>
                    {moonshot.number}
                    <span className="text-5xl lg:text-6xl xl:text-7xl">{moonshot.suffix}</span>
                  </div>
                  
                  {/* Main numbers - solid and visible */}
                  <div className={`
                    relative z-10 text-8xl lg:text-9xl xl:text-[10rem] font-black 
                    ${moonshot.textColor} font-space-grotesk transition-all duration-500
                    group-hover:scale-110 group-hover:drop-shadow-2xl leading-none
                    drop-shadow-lg
                  `}>
                    {moonshot.number}
                    <span className="text-5xl lg:text-6xl xl:text-7xl">{moonshot.suffix}</span>
                  </div>
                </div>
                
                <h3 className={`
                  text-2xl lg:text-3xl font-bold text-ai-midnight mt-4 font-space-grotesk
                  transition-all duration-300 group-hover:text-ai-cyan
                `}>
                  {moonshot.title}
                </h3>
              </div>

              {/* Description with Hover Effect */}
              <p className="text-lg text-ai-gray font-inter leading-relaxed relative z-10 transition-all duration-300 group-hover:text-ai-midnight">
                {moonshot.description}
              </p>

              {/* Enhanced Decorative Elements */}
              <div className={`
                absolute top-4 right-4 w-2 h-2 bg-gradient-to-r ${moonshot.gradient} 
                rounded-full animate-pulse transition-all duration-300
                group-hover:w-3 group-hover:h-3 group-hover:animate-ping
              `}></div>
              <div className={`
                absolute bottom-4 left-4 w-1.5 h-1.5 bg-gradient-to-r ${moonshot.gradient} 
                rounded-full animate-pulse delay-1000 transition-all duration-300
                group-hover:w-2 group-hover:h-2 group-hover:animate-ping
              `}></div>
              
              {/* Additional Floating Particles on Hover */}
              <div className={`
                absolute top-1/2 right-8 w-1 h-1 bg-gradient-to-r ${moonshot.gradient} 
                rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700
                group-hover:animate-bounce
              `}></div>
              <div className={`
                absolute bottom-1/3 left-8 w-1 h-1 bg-gradient-to-r ${moonshot.gradient} 
                rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200
                group-hover:animate-bounce
              `}></div>
              
              {/* Hover Shine Effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-ai-gray font-inter max-w-2xl mx-auto">
            Join us in achieving these revolutionary milestones that will reshape 
            the future of sales and business growth worldwide.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Moonshots;
