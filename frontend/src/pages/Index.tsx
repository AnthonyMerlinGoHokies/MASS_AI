
import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CRMLeadsDemo from "@/components/CRMLeadsDemo";
import SalesWorkflow from "@/components/SalesWorkflow";
import Services from "@/components/Services";
import WaitlistSection from "@/components/WaitlistSection";
import Footer from "@/components/Footer";

const Index = () => {
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
        }
      });
    }, observerOptions);

    sectionsRef.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  const setSectionRef = (index: number) => (el: HTMLDivElement | null) => {
    sectionsRef.current[index] = el;
  };

  return (
    <div className="min-h-screen snap-y snap-mandatory overflow-y-scroll" style={{ backgroundColor: '#0A0E12' }}>
      <Header />
      
      {/* Skip to main content for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      
      {/* Main content landmark */}
      <main id="main-content" role="main">
        {/* Hero section - snap start */}
        <section className="snap-start snap-always" aria-labelledby="hero-heading">
          <Hero />
        </section>
        
        {/* CRM Leads Demo */}
        <section 
          ref={setSectionRef(0)}
          className="opacity-0 translate-y-8 transition-all duration-700 ease-out snap-start snap-always"
        >
          <CRMLeadsDemo />
        </section>
        
        {/* Animated sections with scroll snap */}
        <section 
          ref={setSectionRef(1)}
          className="opacity-0 translate-y-8 transition-all duration-700 ease-out snap-start snap-always"
          aria-labelledby="workflow-heading"
        >
          <SalesWorkflow />
        </section>
        
        <section 
          ref={setSectionRef(2)}
          className="opacity-0 translate-y-8 transition-all duration-700 ease-out snap-start snap-always"
          aria-labelledby="services-heading"
        >
          <Services />
        </section>
        
        <section 
          ref={setSectionRef(3)}
          className="opacity-0 translate-y-8 transition-all duration-700 ease-out snap-start snap-always"
          aria-labelledby="waitlist-heading"
        >
          <WaitlistSection />
        </section>
      </main>
      
      <footer 
        ref={setSectionRef(4)}
        className="opacity-0 translate-y-8 transition-all duration-700 ease-out snap-start snap-always"
        role="contentinfo"
      >
        <Footer />
      </footer>
    </div>
  );
};

export default Index;
