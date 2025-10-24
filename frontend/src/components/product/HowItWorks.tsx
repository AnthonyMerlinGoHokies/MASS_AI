import { Card, CardContent } from "@/components/ui/card";
import { Search, Scale, Users, Archive, Calendar, BarChart3, Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
const HowItWorks = () => {
  const centralAgent = {
    icon: Brain,
    name: "Campaign Commander",
    title: "Central AI Orchestrator",
    description: "Powered by Claude Sonnet 4, this master agent coordinates your entire sales campaign, making strategic decisions and optimizing performance across all channels",
    color: "bg-gradient-to-br from-ai-purple via-ai-midnight to-ai-purple",
    benefits: ["Strategic campaign planning", "Real-time optimization", "Cross-agent coordination", "Performance analysis"]
  };
  const steps = [{
    icon: Search,
    name: "Lead Generation Swarm",
    title: "Intelligent Lead Discovery & Enrichment",
    description: "A coordinated swarm of specialized agents led by the Lead Generation Controller to systematically find, qualify, and enrich prospects that match your ideal customer profile",
    color: "bg-ai-midnight",
    benefits: ["Lead Generation Controller orchestrates the swarm", "Company Discovery Agent finds target organizations", "Decision Maker Agent identifies key stakeholders", "Data Enrichment Agent validates and enhances contact data"]
  }, {
    icon: Scale,
    name: "Judge",
    title: "Qualify Prospects",
    description: "Intelligently scores and qualifies leads based on your ideal customer profile",
    color: "bg-ai-purple",
    benefits: ["Lead scoring", "Qualification criteria", "Priority ranking"]
  }, {
    icon: Users,
    name: "Deep Research Swarm",
    title: "Comprehensive Intelligence Gathering",
    description: "A specialized research swarm led by the Deep Research Controller to conduct thorough investigations on target companies and their key decision makers",
    color: "bg-ai-cyan",
    benefits: ["Deep Research Controller orchestrates intelligence gathering", "Company Intelligence Agent analyzes business operations", "Market Position Agent studies competitive landscape", "Decision Maker Profiler Agent researches key stakeholders", "Trigger Events Agent monitors business changes"]
  }, {
    icon: Archive,
    name: "Personalized Engagement Swarm",
    title: "DISC-Based Communication Mastery",
    description: "A sophisticated engagement swarm led by the Campaign Controller, who orchestrates scheduling and follow-up through multi-channel outreach, with specialized sub-agents tailored to each DISC personality profile for optimal prospect communication",
    color: "bg-ai-cyan",
    benefits: ["Outreach Campaign Controller orchestrates personalized campaigns", "Dominant Agent engages direct, results-focused prospects", "Influential Agent connects with social, enthusiastic prospects", "Steady Agent communicates with supportive, patient prospects", "Conscientious Agent reaches analytical, detail-oriented prospects"]
  }, {
    icon: Calendar,
    name: "Coordinator",
    title: "Schedule Management",
    description: "Handles appointment scheduling and follow-up coordination seamlessly",
    color: "bg-ai-midnight",
    benefits: ["Smart scheduling", "Calendar integration", "Automated follow-ups"]
  }, {
    icon: BarChart3,
    name: "Oracle",
    title: "Analytics & Reporting",
    description: "Provides comprehensive analytics and insights on all sales activities",
    color: "bg-ai-purple",
    benefits: ["Performance analytics", "ROI tracking", "Predictive insights"]
  }];
  return <TooltipProvider>
    <section className="py-20 px-6">
      
    </section>
    </TooltipProvider>;
};
export default HowItWorks;