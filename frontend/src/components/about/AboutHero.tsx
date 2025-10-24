
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { MTP_TAGLINE } from "@/lib/constants";
import { useNavigate } from "react-router-dom";

const AboutHero = () => {
  const navigate = useNavigate();

  const handleJoinMission = () => {
    navigate('/', { replace: true });
    setTimeout(() => {
      const element = document.getElementById('hero-waitlist');
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-4xl text-center">
        <div className="space-y-8">
          {/* MTP Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ai-cyan/20 to-ai-purple/20 rounded-full border border-ai-cyan/30">
            <Sparkles className="w-5 h-5 text-ai-cyan" />
            <span className="text-foreground font-semibold font-space-grotesk">Our Massive Transformative Purpose</span>
          </div>

          {/* Main MTP Statement */}
          <h1 className="text-5xl lg:text-6xl font-black leading-tight font-space-grotesk">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-ai-purple">
              Worldwide Business Abundance Through Artificial Intelligence
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-xl text-white leading-relaxed font-inter max-w-3xl mx-auto">
            We believe that intelligent sales systems are the catalyst for unprecedented business growth. 
            Through AI sales intelligence, we're not just optimizing processes—we're empowering businesses worldwide 
            to unlock their full revenue potential and achieve sustainable, scalable growth.
          </p>

          {/* CTA */}
          <div className="pt-6">
            <Button 
              onClick={handleJoinMission}
              size="lg"
              className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 font-space-grotesk text-lg"
            >
              Join Our Mission
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
