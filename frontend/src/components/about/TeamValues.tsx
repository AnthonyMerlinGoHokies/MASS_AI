
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Heart, Zap, Globe, Shield, Infinity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeamValues = () => {
  const navigate = useNavigate();

  const handleJoinTeam = () => {
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

  const values = [
    {
      icon: Brain,
      title: "Intelligence First",
      description: "We believe AI should augment human intelligence, not replace it. Every feature we build makes humans smarter, not redundant.",
      color: "ai-cyan"
    },
    {
      icon: Heart,
      title: "Human-Centered",
      description: "Technology serves people, not the other way around. We design for human needs, emotions, and aspirations.",
      color: "ai-purple"
    },
    {
      icon: Zap,
      title: "Bias Toward Action",
      description: "In a world of infinite possibilities, we choose to build, test, and iterate. Progress over perfection, always.",
      color: "ai-cyan"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "We're not just building a product; we're catalyzing a transformation that will benefit businesses worldwide.",
      color: "ai-purple"
    },
    {
      icon: Shield,
      title: "Ethical AI",
      description: "With great power comes great responsibility. We build AI that's transparent, fair, and aligned with human values.",
      color: "ai-cyan"
    },
    {
      icon: Infinity,
      title: "Infinite Mindset",
      description: "We're playing the long game. Every decision is made with the next decade in mind, not the next quarter.",
      color: "ai-purple"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-ai-midnight mb-6 font-space-grotesk">
            Our Values
          </h2>
          <p className="text-xl text-ai-gray font-inter max-w-3xl mx-auto">
            The principles that guide every decision, every line of code, and every interaction we have.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={index} className={`bg-gradient-to-br ${value.color === 'ai-cyan' ? 'from-ai-cyan/10 to-ai-purple/10' : 'from-ai-purple/10 to-ai-cyan/10'} backdrop-blur-sm border border-white/20 hover:border-${value.color}/40 hover:bg-white/10 transition-all duration-300 hover:shadow-xl rounded-3xl group`}>
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-r from-${value.color} to-${value.color === 'ai-cyan' ? 'ai-purple' : 'ai-cyan'} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ai-midnight mb-3 font-space-grotesk">
                  {value.title}
                </h3>
                <p className="text-ai-gray leading-relaxed font-inter">
                  {value.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Us CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto border border-white/20 hover:border-ai-cyan/40 hover:bg-white/10 transition-all duration-300">
            <h3 className="text-3xl font-bold text-ai-midnight mb-4 font-space-grotesk">
              Ready to Shape the Future?
            </h3>
            <p className="text-lg text-ai-gray font-inter mb-8 max-w-2xl mx-auto">
              We're looking for brilliant minds who share our vision of eliminating sales friction 
              and igniting human prosperity. Join us in building the future of sales intelligence.
            </p>
            <Button 
              onClick={handleJoinTeam}
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

export default TeamValues;
