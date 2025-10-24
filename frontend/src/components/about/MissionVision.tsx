import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Zap } from "lucide-react";
const MissionVision = () => {
  return <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black mb-6 font-space-grotesk">
            Our Mission & Vision
          </h2>
          <p className="text-xl text-white font-inter max-w-3xl mx-auto">
            Driven by purpose, guided by innovation, focused on transforming how the world approaches sales.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          {/* Mission */}
          <Card className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm border border-white/20 hover:border-ai-cyan/40 hover:bg-white/10 transition-all duration-300 hover:shadow-xl rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-ai-cyan to-ai-purple rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white font-space-grotesk">Our Mission</h3>
              </div>
              <p className="text-lg text-white/80 leading-relaxed font-inter">To liberate 1 billion hours from the world's sales professionals, freeing them from soul crushing manual tasks and repetitive busywork to focus on what truly matters: building genuine relationships, closing transformative deals, and unleashing human creativity. We're not just saving time, we're giving back lives.</p>
            </CardContent>
          </Card>

          {/* Vision */}
          <Card className="bg-gradient-to-br from-ai-purple/10 to-ai-cyan/10 backdrop-blur-sm border border-white/20 hover:border-ai-purple/40 hover:bg-white/10 transition-all duration-300 hover:shadow-xl rounded-3xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-ai-purple to-ai-cyan rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white font-space-grotesk">Our Vision</h3>
              </div>
              <p className="text-lg text-white/80 leading-relaxed font-inter">We envision the ultimate symbiosis between sales professionals and AI agents, a future where human intuition, creativity, and relationship building prowess are amplified by intelligent automation that handles the repetitive heavy lifting. Sales teams will lead strategy while AI agents execute flawlessly, creating a partnership where human wisdom guides autonomous intelligence to achieve results neither could reach alone.</p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Statement */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm rounded-3xl p-12 max-w-4xl mx-auto border border-white/20 hover:border-ai-cyan/40 hover:bg-white/10 transition-all duration-300 shadow-xl">
            <Zap className="w-12 h-12 text-ai-cyan mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4 font-space-grotesk">
              The Autonomous Sales Revolution
            </h3>
            <p className="text-lg text-white/80 font-inter leading-relaxed">
              Imagine hundreds of AI agents working as a unified intelligence, each one specialized yet interconnected, 
              learning from every interaction and sharing insights instantaneously across the network. This isn't just 
              automation—it's the birth of truly autonomous sales intelligence that thinks, adapts, and evolves without 
              human intervention, while keeping humans in strategic command of the entire operation.
            </p>
          </div>
        </div>
      </div>
    </section>;
};
export default MissionVision;