import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Users, MessageSquare, Calendar, TrendingUp, Brain, Zap, Target, CheckCircle, Sparkles, Bot, Rocket, UserCheck, Database, Filter } from "lucide-react";
import { useState } from "react";
import WaitlistModal from "./WaitlistModal";
import EmailOutreachDemo from "./EmailOutreachDemo";
import AgentDashboardDemo from "./AgentDashboardDemo";
const SalesWorkflow = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const workflowSteps = [{
    title: "Define Your Ideal Customer",
    description: "Start by telling us about your perfect customer. Our AI learns your ICP criteria, industry preferences, company size, and buyer characteristics to create a precise targeting profile.",
    icon: Target,
    color: "bg-gradient-to-br from-ai-cyan to-ai-cyan/80",
    benefits: ["Custom ICP definition", "Buyer persona mapping", "Targeting criteria setup"],
    metrics: "5 min setup",
    rightIcon: Brain,
    rightText: "AI Learning"
  }, {
    title: "Find Perfect-Fit Leads",
    description: "Our AI scouts discover prospects that precisely match your ICP across multiple data sources, ensuring every lead has the highest probability of conversion.",
    icon: Search,
    color: "bg-gradient-to-br from-ai-purple to-ai-purple/80",
    benefits: ["Multi-source lead discovery", "ICP-matched prospects", "Real-time data enrichment"],
    metrics: "1000s of leads/hour",
    rightIcon: Database,
    rightText: "Data Mining"
  }, {
    title: "Qualify for Buying Intent",
    description: "Each prospect is intelligently scored and qualified based on buying signals, budget indicators, and decision-making authority to ensure we only engage qualified buyers.",
    icon: Filter,
    color: "bg-gradient-to-br from-ai-midnight to-ai-slate",
    benefits: ["Buying intent analysis", "Budget qualification", "Decision-maker identification"],
    metrics: "90% qualification accuracy",
    rightIcon: CheckCircle,
    rightText: "Smart Scoring"
  }, {
    title: "Deep Prospect Research",
    description: "Our AI conducts comprehensive research on each qualified prospect—company insights, recent activities, pain points, and personal details for maximum personalization.",
    icon: Database,
    color: "bg-gradient-to-br from-ai-cyan/80 to-ai-purple/80",
    benefits: ["Company intelligence", "Recent activity tracking", "Pain point identification"],
    metrics: "50+ data points/prospect",
    rightIcon: Search,
    rightText: "Deep Research"
  }, {
    title: "Hyper-Personalized Outreach",
    description: "Every message is crafted specifically for each prospect using their research data. Multi-channel outreach across email, LinkedIn, SMS, and video that feels genuinely personal.",
    icon: MessageSquare,
    color: "bg-gradient-to-br from-ai-purple/80 to-ai-midnight/80",
    benefits: ["1:1 personalized messaging", "Multi-channel coordination", "Perfect timing optimization"],
    metrics: "5x higher response rates",
    rightIcon: Bot,
    rightText: "AI Writing"
  }, {
    title: "Intelligent Meeting Scheduling",
    description: "When prospects show interest, our AI handles the entire scheduling process, qualifying the meeting, coordinating calendars, and ensuring every booked meeting is qualified and ready to close.",
    icon: Calendar,
    color: "bg-gradient-to-br from-ai-cyan to-ai-purple",
    benefits: ["Automated scheduling", "Meeting qualification", "Calendar optimization"],
    metrics: "Zero manual coordination",
    rightIcon: UserCheck,
    rightText: "Auto Booking"
  }];
  return <section id="workflow" className="py-20 px-6 relative overflow-hidden" style={{ backgroundColor: '#0A0E12' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#1E78FF20' }}></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#00C8FF15' }}></div>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-[#1E78FF]/20 to-[#00C8FF]/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border" style={{ borderColor: '#1E78FF40' }}>
            <Brain className="h-5 w-5 mr-2 animate-pulse" style={{ color: '#00C8FF' }} />
            <span className="text-sm font-semibold uppercase tracking-wider font-space-grotesk" style={{ color: '#E6EDF4' }}>Your Complete Sales Process</span>
            <Sparkles className="h-5 w-5 ml-2 animate-pulse delay-300" style={{ color: '#1E78FF' }} />
          </div>
          
          <h2 id="workflow-heading" className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-6 font-space-grotesk leading-tight" style={{ color: '#E6EDF4' }}>
            <span className="bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] bg-clip-text text-transparent">
              From ICP to outreach in minutes
            </span>
          </h2>
          
          <p className="text-base sm:text-lg lg:text-xl max-w-3xl mx-auto font-inter leading-relaxed" style={{ color: '#B9C5D1' }}>
            Define your ideal customer profile and watch our AI instantly discover, research, and begin personalized outreach—all in minutes, not days.
          </p>
        </div>

        {/* Email Outreach Demo */}
        <EmailOutreachDemo />

        {/* Workflow Steps */}
        <div className="space-y-8">
          {workflowSteps.map((step, index) => <Card key={index} className="backdrop-blur-sm hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-3xl group" style={{ backgroundColor: '#16202A', borderColor: '#3A4656', borderWidth: '1px' }}>
              <CardContent className="p-0">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0">
                  {/* Step Indicator */}
                  <div className={`lg:col-span-2 ${step.color} flex flex-row lg:flex-col items-center justify-center p-6 lg:p-8 text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      <step.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                    </div>
                    
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-7 p-6 lg:p-8 text-center lg:text-left">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                      {step.title}
                    </h3>
                    <p className="text-base lg:text-lg mb-6 leading-relaxed font-inter" style={{ color: '#B9C5D1' }}>
                      {step.description}
                    </p>
                    
                    <div className="space-y-3 flex flex-col items-center lg:items-start">
                      {step.benefits.map((benefit, benefitIndex) => <div key={benefitIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] rounded-full flex-shrink-0 animate-pulse"></div>
                          <span className="font-inter text-sm lg:text-base" style={{ color: '#A7B4C2' }}>{benefit}</span>
                        </div>)}
                    </div>
                  </div>

                  {/* Unique Feature Indicator */}
                  <div className="lg:col-span-3 flex items-center justify-center p-6 lg:p-8" style={{ backgroundColor: '#0A0E12' }}>
                    <div className="text-center">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#1E78FF30' }}>
                        <step.rightIcon className="h-8 w-8 lg:h-10 lg:w-10 animate-pulse" style={{ color: '#00C8FF' }} />
                      </div>
                      <div className="text-sm font-semibold font-space-grotesk" style={{ color: '#A7B4C2' }}>
                        {step.rightText}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Real-time Updates Banner */}
        <div className="mt-12 rounded-2xl p-6 lg:p-8 border" style={{ 
          background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
          borderColor: '#3A4656'
        }}>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 mr-3 animate-pulse" style={{ color: '#00C8FF' }} />
              <h3 className="text-xl sm:text-2xl font-bold font-space-grotesk" style={{ color: '#E6EDF4' }}>
                Real-Time CRM & Analytics
              </h3>
              <Database className="h-6 w-6 lg:h-8 lg:w-8 ml-3 animate-pulse delay-300" style={{ color: '#1E78FF' }} />
            </div>
            <p className="text-base lg:text-lg max-w-3xl mx-auto font-inter" style={{ color: '#B9C5D1' }}>
              Throughout the entire process, your CRM is automatically updated with every interaction, 
              meeting scheduled, and deal progression. Get real-time analytics and insights on campaign performance, 
              conversion rates, and ROI—all without lifting a finger.
            </p>
            <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#00C8FF' }}></div>
                <span className="text-sm font-inter" style={{ color: '#B9C5D1' }}>Live CRM Sync</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse delay-200" style={{ backgroundColor: '#1E78FF' }}></div>
                <span className="text-sm font-inter" style={{ color: '#B9C5D1' }}>Real-time Analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full animate-pulse delay-400" style={{ backgroundColor: '#00C8FF' }}></div>
                <span className="text-sm font-inter" style={{ color: '#B9C5D1' }}>Performance Insights</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="flex justify-center items-center mt-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4, 5].map((_, index) => <div key={index} className="flex items-center">
                <div className="w-3 h-3 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] rounded-full animate-pulse" style={{
              animationDelay: `${index * 200}ms`
            }}></div>
                {index < 4 && <ArrowRight className="h-6 w-6 mx-2" style={{ color: '#00C8FF60' }} />}
              </div>)}
          </div>
        </div>

        {/* Agent Dashboard Demo */}
        <AgentDashboardDemo />

        <div className="mt-20 text-center">
          <div className="rounded-3xl p-8 lg:p-12 relative overflow-hidden" style={{ 
            background: 'linear-gradient(135deg, #16202A 0%, #0A0E12 50%, #16202A 100%)',
            borderColor: '#3A4656',
            borderWidth: '1px'
          }}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E78FF]/10 to-[#00C8FF]/10"></div>
            <div className="relative z-10">
              <Rocket className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-6 animate-pulse" style={{ color: '#00C8FF' }} />
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 font-space-grotesk" style={{ color: '#E6EDF4' }}>
                Your Complete Sales System Awaits
              </h3>
              <p className="mb-8 max-w-2xl mx-auto text-base lg:text-lg font-inter" style={{ color: '#B9C5D1' }}>
                From ICP definition to closed deals, watch as our multi agent system executes your entire sales process 
                with precision, personalization, and perfect timing. Your pipeline will never be the same.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setIsWaitlistOpen(true)} size="lg" className="bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 text-white font-semibold px-6 lg:px-8 py-3 lg:py-4 rounded-full text-base lg:text-lg transition-all duration-300 hover:scale-105 font-space-grotesk shadow-lg touch-manipulation" aria-label="Start your sales transformation with SIOS">
                  <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Your Transformation
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </section>;
};
export default SalesWorkflow;