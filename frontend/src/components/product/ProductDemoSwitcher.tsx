import { useState, useEffect } from "react";
import { Plus, Mic, AudioWaveform, Bot, CheckCircle, Zap, Users, TrendingUp, MessageSquare } from "lucide-react";

const ProductDemoSwitcher = () => {
  const [currentDemo, setCurrentDemo] = useState<'chat' | 'orchestration'>('chat');
  const [typedText, setTypedText] = useState("");
  const [orchestrationStep, setOrchestrationStep] = useState(0);

  const chatQuery = "Find me 50 qualified SaaS companies in San Francisco";

  const orchestrationSteps = [
    { icon: Users, label: 'Lead Finding Agent', desc: 'Discovering 50 qualified SaaS companies', status: 'complete' },
    { icon: MessageSquare, label: 'Research Agent', desc: 'Deep research on decision makers and companies', status: 'complete' },
    { icon: Zap, label: 'Outreach Agent', desc: 'Crafting personalized multi-touch campaign', status: 'active' }
  ];

  useEffect(() => {
    // Chat typing animation
    if (currentDemo === 'chat' && typedText.length < chatQuery.length) {
      const timer = setTimeout(() => {
        setTypedText(chatQuery.slice(0, typedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    }

    // Switch to orchestration after typing completes
    if (currentDemo === 'chat' && typedText.length === chatQuery.length) {
      const timer = setTimeout(() => {
        setCurrentDemo('orchestration');
        setOrchestrationStep(0);
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Orchestration demo sequence
    if (currentDemo === 'orchestration' && orchestrationStep < orchestrationSteps.length) {
      const timer = setTimeout(() => {
        setOrchestrationStep(orchestrationStep + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }

    // Reset after orchestration completes
    if (currentDemo === 'orchestration' && orchestrationStep === orchestrationSteps.length) {
      const timer = setTimeout(() => {
        setCurrentDemo('chat');
        setTypedText("");
        setOrchestrationStep(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentDemo, typedText, orchestrationStep, chatQuery]);

  return (
    <div className="relative w-full h-[600px]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/10 via-transparent to-[#00C8FF]/10 rounded-3xl"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#1E78FF]/20 rounded-full blur-3xl animate-pulse"></div>
      
      {/* Demo Container */}
      <div className="relative h-full rounded-3xl overflow-hidden" style={{
        background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
      }}>
        {currentDemo === 'chat' ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <div className="relative flex flex-col items-center justify-center w-full max-w-3xl animate-fade-in">
              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-white text-center">
                Your complete sales operating system
              </h1>

              {/* Input bar - matching ProductDemo design */}
              <div className="w-full rounded-full shadow-2xl border transition-all duration-300 bg-white/5 border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3 px-6 py-4">
                  {/* Plus button */}
                  <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                    <Plus className="h-6 w-6" />
                  </button>

                  {/* Input with typing animation */}
                  <div className="flex-1 text-lg text-white">
                    {typedText}
                    <span 
                      className="inline-block w-0.5 h-6 ml-1 animate-pulse" 
                      style={{ backgroundColor: '#00C8FF' }}
                    ></span>
                  </div>

                  {/* Microphone button */}
                  <button className="flex-shrink-0 transition-all duration-300 text-white/60 hover:text-white">
                    <Mic className="h-6 w-6" />
                  </button>

                  {/* Audio waveform button */}
                  <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                    <AudioWaveform className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-8">
            {/* Orchestration Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Bot className="w-8 h-8 text-[#1E78FF]" />
                <h3 className="text-2xl font-bold text-white font-space-grotesk">Agent Orchestration</h3>
              </div>
              <p className="text-white/60 text-sm font-inter">Coordinating specialized AI agents to automate your sales process</p>
            </div>

            {/* Agent Pipeline */}
            <div className="flex-1 space-y-4">
              {orchestrationSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index < orchestrationStep;
                const isCurrent = index === orchestrationStep - 1;
                const isPending = index >= orchestrationStep;

                return (
                  <div
                    key={index}
                    className={`relative transition-all duration-500 ${
                      isActive ? 'opacity-100 translate-x-0' : isPending ? 'opacity-30 translate-x-4' : 'opacity-100'
                    }`}
                  >
                    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      isCurrent 
                        ? 'bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 border-[#1E78FF] shadow-lg shadow-[#1E78FF]/20' 
                        : isActive
                        ? 'bg-white/5 border-white/20'
                        : 'bg-white/5 border-white/10'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#1E78FF] to-[#00C8FF]' 
                          : 'bg-white/10'
                      }`}>
                        {isActive ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <Icon className="w-6 h-6 text-white/40" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold font-space-grotesk">{step.label}</h4>
                        <p className="text-white/60 text-sm font-inter">{step.desc}</p>
                      </div>
                      {isCurrent && (
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#1E78FF] rounded-full animate-pulse"></span>
                          <span className="w-2 h-2 bg-[#00C8FF] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                          <span className="w-2 h-2 bg-[#1E78FF] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      )}
                    </div>
                    {index < orchestrationSteps.length - 1 && (
                      <div className={`ml-6 w-0.5 h-4 transition-colors duration-300 ${
                        isActive ? 'bg-[#1E78FF]' : 'bg-white/10'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Results Summary */}
            {orchestrationStep === orchestrationSteps.length && (
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 animate-fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-white font-semibold font-space-grotesk">Process Complete</p>
                    <p className="text-white/60 text-sm font-inter">127 personalized outreach emails ready to send</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDemoSwitcher;
