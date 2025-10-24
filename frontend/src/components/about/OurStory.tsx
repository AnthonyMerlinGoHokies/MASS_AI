
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Rocket, Users, Clock, DollarSign, AlertTriangle, Settings, Users2, GraduationCap } from "lucide-react";

const OurStory = () => {
  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-black text-ai-midnight mb-6 font-space-grotesk">
            Our Story
          </h2>
          <p className="text-xl text-ai-gray font-inter max-w-3xl mx-auto">
            Born from frustration with traditional sales processes, shaped by a vision of what's possible.
          </p>
        </div>

        <div className="space-y-12">
          {/* The Problem We Witnessed */}
          <Card className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm border border-white/20 hover:border-ai-cyan/40 hover:bg-white/10 transition-all duration-300 rounded-3xl">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-ai-midnight/10 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-ai-midnight" />
                    </div>
                    <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">The Problem We Witnessed</h3>
                  </div>
                  <p className="text-lg text-ai-gray leading-relaxed font-inter">
                    We witnessed businesses struggling with outdated sales processes, missed opportunities, 
                    and the inability to scale their revenue operations effectively. Sales teams were drowning 
                    in manual tasks while crucial growth opportunities slipped through the cracks. Even worse, 
                    existing sales automation tools created massive barriers to entry—requiring months of technical 
                    setup, expensive consultants, and extensive training that made intelligent sales systems 
                    inaccessible to most businesses. The complexity of setting up automations and agents was 
                    so overwhelming that many companies simply couldn't afford to implement the technology 
                    that could transform their revenue growth.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-ai-midnight/5 to-ai-slate/10 rounded-2xl p-8 border border-ai-midnight/10">
                  {/* Barriers Visualization */}
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-ai-midnight mb-4 font-space-grotesk">Barriers to Entry</h4>
                    
                    {/* Time Barrier */}
                    <div className="flex items-center gap-4 p-3 bg-white/80 rounded-lg border border-ai-midnight/5 shadow-sm">
                      <div className="w-10 h-10 bg-ai-midnight/10 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-ai-midnight" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-ai-midnight">Setup Time</span>
                          <span className="text-sm font-bold text-ai-midnight">3-6 Months</span>
                        </div>
                        <div className="w-full bg-ai-gray/20 rounded-full h-2">
                          <div className="bg-gradient-to-r from-ai-midnight to-ai-slate h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Barrier */}
                    <div className="flex items-center gap-4 p-3 bg-white/80 rounded-lg border border-ai-cyan/10 shadow-sm">
                      <div className="w-10 h-10 bg-ai-cyan/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-ai-cyan" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-ai-midnight">Implementation Cost</span>
                          <span className="text-sm font-bold text-ai-cyan">$50K+</span>
                        </div>
                        <div className="w-full bg-ai-gray/20 rounded-full h-2">
                          <div className="bg-gradient-to-r from-ai-cyan to-ai-purple h-2 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Complexity */}
                    <div className="flex items-center gap-4 p-3 bg-white/80 rounded-lg border border-ai-purple/10 shadow-sm">
                      <div className="w-10 h-10 bg-ai-purple/10 rounded-full flex items-center justify-center">
                        <Settings className="w-5 h-5 text-ai-purple" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-ai-midnight">Technical Complexity</span>
                          <span className="text-sm font-bold text-ai-purple">Expert Level</span>
                        </div>
                        <div className="w-full bg-ai-gray/20 rounded-full h-2">
                          <div className="bg-gradient-to-r from-ai-purple to-ai-midnight h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Training Requirements */}
                    <div className="flex items-center gap-4 p-3 bg-white/80 rounded-lg border border-ai-cyan/10 shadow-sm">
                      <div className="w-10 h-10 bg-ai-cyan/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-ai-cyan" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-ai-midnight">Training Required</span>
                          <span className="text-sm font-bold text-ai-cyan">Extensive</span>
                        </div>
                        <div className="w-full bg-ai-gray/20 rounded-full h-2">
                          <div className="bg-gradient-to-r from-ai-cyan to-ai-purple h-2 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="mt-4 p-3 bg-ai-midnight/5 rounded-lg border-l-4 border-ai-midnight">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-ai-midnight" />
                        <span className="text-sm font-medium text-ai-midnight">Result: Most businesses can't afford to implement</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Vision We Pursued */}
          <Card className="bg-gradient-to-br from-ai-purple/10 to-ai-cyan/10 backdrop-blur-sm border border-white/20 hover:border-ai-purple/40 hover:bg-white/10 transition-all duration-300 rounded-3xl">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 rounded-2xl p-8 order-2 lg:order-1">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-ai-gray font-inter">Revenue Growth Potential</span>
                      <span className="text-2xl font-bold text-ai-cyan font-space-grotesk">300%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ai-gray font-inter">Sales Intelligence Accuracy</span>
                      <span className="text-2xl font-bold text-ai-cyan font-space-grotesk">95%</span>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-ai-cyan/20 rounded-full flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-ai-cyan" />
                    </div>
                    <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">The Vision We Pursued</h3>
                  </div>
                  <p className="text-lg text-ai-gray leading-relaxed font-inter">
                    We went back to first principles and asked: what is sales really about? At its core, sales is about 
                    building relationships, understanding needs, and delivering value. We deconstructed every step of the 
                    sales process—from initial research to closing deals—and reimagined how AI could handle the repetitive 
                    tasks while amplifying human connection. Instead of automating what already existed, we rebuilt the 
                    entire sales process from the ground up, designing AI agents that think like top salespeople but work 
                    24/7 without fatigue, bias, or inconsistency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Future We're Building */}
          <Card className="bg-gradient-to-br from-ai-cyan/10 to-ai-purple/10 backdrop-blur-sm border border-white/20 hover:border-ai-cyan/40 hover:bg-white/10 transition-all duration-300 rounded-3xl">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-ai-purple/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-ai-purple" />
                  </div>
                  <h3 className="text-2xl font-bold text-ai-midnight font-space-grotesk">The Future We're Building</h3>
                </div>
                <p className="text-lg text-ai-gray leading-relaxed font-inter max-w-4xl mx-auto">
                  Today, we're building a future where sales professionals become revenue architects instead of task managers. 
                  Imagine a world where your sales team spends 80% of their time building relationships and closing deals, 
                  while AI handles research, outreach, and qualification. Where every interaction is perfectly timed, 
                  personalized, and data-driven. Where small businesses can compete with enterprise sales teams, 
                  and established companies can scale revenue without scaling headcount. We're creating technology that 
                  transforms sales professionals from order-takers into strategic growth drivers, turning every business 
                  into a revenue-generating powerhouse through intelligent automation that amplifies human potential.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
