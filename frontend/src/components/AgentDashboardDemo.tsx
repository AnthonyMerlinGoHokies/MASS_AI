import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Search, Database, Filter, MessageSquare, CheckCircle, TrendingUp, Loader2, Zap, Activity } from "lucide-react";
const AgentDashboardDemo = () => {
  const [currentStage, setCurrentStage] = useState(0);
  const [leadsFound, setLeadsFound] = useState(0);
  const [leadsEnriched, setLeadsEnriched] = useState(0);
  const [leadsQualified, setLeadsQualified] = useState(0);
  const [outreachPrepared, setOutreachPrepared] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const stages = [{
    id: 0,
    title: "Finding Leads",
    icon: Search,
    color: "#1E78FF",
    description: "Scanning 10,000+ sources for ICP matches"
  }, {
    id: 1,
    title: "Enriching Data",
    icon: Database,
    color: "#00C8FF",
    description: "Adding 50+ data points per prospect"
  }, {
    id: 2,
    title: "Qualifying Intent",
    icon: Filter,
    color: "#7C3AED",
    description: "Analyzing buying signals & budget indicators"
  }, {
    id: 3,
    title: "Preparing Outreach",
    icon: MessageSquare,
    color: "#10B981",
    description: "Crafting personalized messages"
  }];
  useEffect(() => {
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < 3) {
          setPulseKey(k => k + 1);
          return prev + 1;
        }
        // Reset after completing all stages
        setTimeout(() => {
          setCurrentStage(0);
          setLeadsFound(0);
          setLeadsEnriched(0);
          setLeadsQualified(0);
          setOutreachPrepared(0);
          setPulseKey(0);
        }, 2000);
        return prev;
      });
    }, 3000);
    return () => clearInterval(stageInterval);
  }, []);
  useEffect(() => {
    if (currentStage === 0 && leadsFound < 247) {
      const interval = setInterval(() => {
        setLeadsFound(prev => Math.min(prev + 7, 247));
      }, 50);
      return () => clearInterval(interval);
    }
    if (currentStage === 1 && leadsEnriched < 247) {
      const interval = setInterval(() => {
        setLeadsEnriched(prev => Math.min(prev + 7, 247));
      }, 50);
      return () => clearInterval(interval);
    }
    if (currentStage === 2 && leadsQualified < 62) {
      const interval = setInterval(() => {
        setLeadsQualified(prev => Math.min(prev + 2, 62));
      }, 50);
      return () => clearInterval(interval);
    }
    if (currentStage === 3 && outreachPrepared < 62) {
      const interval = setInterval(() => {
        setOutreachPrepared(prev => Math.min(prev + 2, 62));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [currentStage, leadsFound, leadsEnriched, leadsQualified, outreachPrepared]);
  return <div className="mb-16 rounded-3xl p-8 lg:p-12 relative overflow-hidden border-2" style={{
    background: 'radial-gradient(ellipse at top, #0A1628 0%, #040911 50%, #000000 100%)',
    borderColor: '#1E78FF40',
    boxShadow: '0 0 60px rgba(30, 120, 255, 0.15), inset 0 0 60px rgba(0, 200, 255, 0.05)'
  }}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 rounded-full animate-pulse" style={{
        backgroundColor: '#00C8FF',
        boxShadow: '0 0 20px #00C8FF'
      }} />
        <div className="absolute top-40 right-20 w-1 h-1 rounded-full animate-pulse delay-300" style={{
        backgroundColor: '#1E78FF',
        boxShadow: '0 0 15px #1E78FF'
      }} />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 rounded-full animate-pulse delay-700" style={{
        backgroundColor: '#00C8FF',
        boxShadow: '0 0 18px #00C8FF'
      }} />
        <div className="absolute bottom-20 right-1/3 w-1 h-1 rounded-full animate-pulse delay-500" style={{
        backgroundColor: '#7C3AED',
        boxShadow: '0 0 15px #7C3AED'
      }} />
      </div>

      {/* Scanning line effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
      background: `linear-gradient(to bottom, transparent 0%, #00C8FF 50%, transparent 100%)`,
      height: '2px',
      animation: 'scan 4s linear infinite'
    }} />
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(500px); }
        }
      `}</style>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 animate-pulse" style={{
            color: '#00C8FF'
          }} />
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-space-grotesk bg-gradient-to-r from-[#00C8FF] via-[#1E78FF] to-[#00C8FF] bg-clip-text text-transparent">
              Live Agent Dashboard
            </h3>
            <Zap className="h-6 w-6 animate-pulse delay-300" style={{
            color: '#1E78FF'
          }} />
          </div>
          <p className="text-base lg:text-xl font-inter" style={{
          color: '#B9C5D1'
        }}>
            Multi-agent system executing your entire sales pipeline in real-time
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stages.map(stage => {
          const StageIcon = stage.icon;
          const isActive = currentStage === stage.id;
          const isCompleted = currentStage > stage.id;
          return <div key={stage.id} className="relative group" style={{
            transform: isActive ? 'scale(1.05)' : 'scale(1)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
                {/* Glow effect */}
                {isActive && <div className="absolute -inset-1 rounded-2xl blur-xl opacity-75 animate-pulse" style={{
              background: `radial-gradient(circle, ${stage.color}60 0%, transparent 70%)`
            }} />}
                
                <Card className="relative p-6 backdrop-blur-xl overflow-hidden border-2" style={{
              background: isActive ? `linear-gradient(135deg, ${stage.color}25 0%, ${stage.color}10 50%, transparent 100%)` : 'linear-gradient(135deg, #0A1628 0%, #050A14 100%)',
              borderColor: isActive ? stage.color : '#1E3A5F',
              boxShadow: isActive ? `0 0 40px ${stage.color}40, inset 0 0 20px ${stage.color}20` : 'none'
            }}>
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-30" style={{
                background: `radial-gradient(circle at top right, ${stage.color} 0%, transparent 70%)`
              }} />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="p-3 rounded-xl relative overflow-hidden" style={{
                  background: isActive ? `linear-gradient(135deg, ${stage.color}40 0%, ${stage.color}20 100%)` : `${stage.color}15`,
                  boxShadow: isActive ? `0 0 20px ${stage.color}30` : 'none'
                }}>
                      {isActive ? <>
                          <div className="absolute inset-0 animate-pulse" style={{
                      backgroundColor: `${stage.color}20`
                    }} />
                          <Loader2 className="h-7 w-7 animate-spin relative z-10" style={{
                      color: stage.color,
                      filter: 'drop-shadow(0 0 8px currentColor)'
                    }} />
                        </> : <StageIcon className="h-7 w-7" style={{
                    color: stage.color
                  }} />}
                    </div>
                    {isCompleted && <div className="animate-scale-in">
                        <CheckCircle className="h-6 w-6" style={{
                    color: '#10B981',
                    filter: 'drop-shadow(0 0 6px #10B981)'
                  }} />
                      </div>}
                  </div>
                  
                  <h4 className="text-lg font-bold mb-2 font-space-grotesk" style={{
                color: '#E6EDF4'
              }}>
                    {stage.title}
                  </h4>
                  <p className="text-xs font-inter mb-4 leading-relaxed" style={{
                color: '#8B9DB3'
              }}>
                    {stage.description}
                  </p>
                  
                  {/* Progress Numbers with glow */}
                  <div className="text-4xl font-bold font-space-grotesk relative" style={{
                color: stage.color,
                textShadow: isActive ? `0 0 20px ${stage.color}80` : 'none'
              }}>
                    {stage.id === 0 && leadsFound}
                    {stage.id === 1 && leadsEnriched}
                    {stage.id === 2 && leadsQualified}
                    {stage.id === 3 && outreachPrepared}
                    <span className="text-sm ml-1" style={{
                  color: '#8B9DB3'
                }}>
                      {stage.id === 2 || stage.id === 3 ? ' qualified' : ' found'}
                    </span>
                  </div>
                </Card>
              </div>;
        })}
        </div>

        {/* Progress Bar - Futuristic */}
        <div className="relative h-3 rounded-full overflow-hidden mb-8" style={{
        background: 'linear-gradient(90deg, #0A1628 0%, #050A14 100%)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
      }}>
          {/* Background track glow */}
          <div className="absolute inset-0 opacity-30" style={{
          background: 'linear-gradient(90deg, #1E78FF10 0%, #00C8FF10 100%)'
        }} />
          
          {/* Progress fill with animation */}
          <div className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out overflow-hidden" style={{
          width: `${(currentStage + 1) / 4 * 100}%`,
          background: 'linear-gradient(90deg, #1E78FF 0%, #00C8FF 50%, #1E78FF 100%)',
          boxShadow: '0 0 20px #00C8FF80',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s linear infinite'
        }}>
            {/* Moving highlight */}
            <div className="absolute inset-0" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            animation: 'slide 1.5s ease-in-out infinite'
          }} />
          </div>
          
          {/* Stage markers */}
          {[0, 1, 2, 3].map(i => <div key={i} className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-300" style={{
          left: `${i / 3 * 100}%`,
          transform: `translateX(-50%) translateY(-50%) scale(${currentStage >= i ? 1.2 : 1})`,
          backgroundColor: currentStage >= i ? '#00C8FF' : '#0A1628',
          borderColor: currentStage >= i ? '#00C8FF' : '#1E3A5F',
          boxShadow: currentStage >= i ? '0 0 12px #00C8FF' : 'none'
        }} />)}
        </div>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes slide {
            0%, 100% { transform: translateX(-100%); }
            50% { transform: translateX(100%); }
          }
        `}</style>

        {/* Stats Summary - Enhanced */}
        
      </div>
    </div>;
};
export default AgentDashboardDemo;