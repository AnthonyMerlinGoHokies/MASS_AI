import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  X,
  TrendingUp,
  Target,
  Zap,
  Phone,
  Mail,
  Brain,
  MessageSquare,
  Building2,
  Users,
  Code,
  BarChart3,
  Calendar,
  ExternalLink,
  FileText,
  Sun,
  Moon
} from "lucide-react";
import Logo3D from "@/components/Logo3D";
import { CubeMenu } from "@/components/CubeMenu";
import VoiceChatInterface from "@/components/VoiceChatInterface";
import { useCompanies } from "@/hooks/useCompanies";
import { useLeads } from "@/hooks/useLeads";

const SquadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDashboardMode, setIsDashboardMode] = useState(false);
  const [showContextCard, setShowContextCard] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [voiceText, setVoiceText] = useState("Say \"Hey mass...\"");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [showContactResearchModal, setShowContactResearchModal] = useState(false);
  const [selectedContactForResearch, setSelectedContactForResearch] = useState(null);
  const [showEmailDraftModal, setShowEmailDraftModal] = useState(false);
  const [selectedContactForEmail, setSelectedContactForEmail] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [quickWins, setQuickWins] = useState([
    { id: 1, label: "Add 5 new prospects", completed: false },
    { id: 2, label: "Send 10 outreach emails", completed: false },
    { id: 3, label: "Complete 3 discovery calls", completed: false },
    { id: 4, label: "Update 2 deal stages", completed: true }
  ]);
  const [activeStreak, setActiveStreak] = useState(7);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [expandedCompanies, setExpandedCompanies] = useState<Set<number>>(new Set());
  const [currentIcpConfig, setCurrentIcpConfig] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isProcessingConversation, setIsProcessingConversation] = useState(false);
  const [isSearchingCompanies, setIsSearchingCompanies] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('');

  // Use the new API hooks
  const { companies: apiCompanies, ...companiesApi } = useCompanies();
  const leadsApi = useLeads();

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleConversationComplete = async (icpConfig: any, sessionId: string) => {
    // Prevent duplicate requests and rapid-fire calls
    if (currentSessionId === sessionId || isProcessingConversation) {
      console.log('Conversation already processed for this session or currently processing');
      return;
    }
    
    setIsProcessingConversation(true);
    setIsSearchingCompanies(true);
    setSearchProgress(0);
    setSearchStatus('Starting company search...');
    setCurrentIcpConfig(icpConfig);
    setCurrentSessionId(sessionId);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 90) return prev; // Don't go to 100% until actually complete
        return prev + Math.random() * 10;
      });
    }, 1000);
    
    // Search for companies based on the ICP configuration
    try {
      console.log('Starting company search for session:', sessionId);
      setSearchStatus('🎯 Hunting down your ideal prospects...');
      setSearchProgress(20);
      
      const response = await companiesApi.searchCompanies({
        icp_config: icpConfig,
        limit: 50,
        session_id: sessionId
      });
      
      console.log('🔍 API Response:', response);
      console.log('🔍 Companies from API:', response.companies);
      
      setSearchStatus('🔍 Uncovering hidden gems and insights...');
      setSearchProgress(60);
      
      // Wait a bit more to show enrichment progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSearchStatus('✨ Crafting your personalized opportunity list...');
      setSearchProgress(90);
      
      // Show the pipeline with companies
      setShowPipeline(true);
      setShowContextCard(false);
      setSearchStatus('🎉 Your golden opportunities are ready!');
      setSearchProgress(100);
      
      // Show success toast
      setTimeout(() => {
        toast({
          title: "🎉 Search Complete!",
          description: "Found companies matching your ICP criteria",
          duration: 4000,
        });
      }, 500);
      
      console.log('Company search completed successfully');
    } catch (error) {
      console.error('Error searching companies:', error);
      
      // If backend is not available, show pipeline with mock data
      if (error instanceof Error && error.message.includes('Network error')) {
        console.log('Backend not available, showing pipeline with mock data');
        setShowPipeline(true);
        setShowContextCard(false);
        setSearchStatus('Using offline data');
        setSearchProgress(100);
      } else {
        // Don't show pipeline if search fails for other reasons
        setShowPipeline(false);
        setSearchStatus('Search failed');
        setSearchProgress(0);
      }
    } finally {
      clearInterval(progressInterval);
      setIsProcessingConversation(false);
      setIsSearchingCompanies(false);
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSearchStatus('');
        setSearchProgress(0);
      }, 3000);
    }
  };

  const toggleCompanyExpansion = (index: number) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const activateVoice = () => {
    if (!isVoiceActive) {
      setIsVoiceActive(true);
      setVoiceText("Listening...");
      
      setTimeout(() => {
        setIsVoiceActive(false);
        setIsProcessing(true);
        setVoiceText("Processing...");
        
        setTimeout(() => {
          setIsProcessing(false);
          setVoiceText("Say \"Hey mass...\"");
          
          if (!isDashboardMode) {
            setShowContextCard(true);
          }
        }, 1500);
      }, 2000);
    }
  };

  const toggleMode = () => {
    setIsDashboardMode(!isDashboardMode);
    setShowContextCard(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Listen for custom events from CubeMenu
  useEffect(() => {
    const handleShowPipeline = () => {
      setShowPipeline(true);
      setIsDashboardMode(false);
    };

    const handleShowDashboard = () => {
      setIsDashboardMode(true);
      setShowPipeline(false);
    };

    const handleShowVoicePage = () => {
      setIsDashboardMode(false);
      setShowPipeline(false);
    };

    window.addEventListener('showPipeline', handleShowPipeline);
    window.addEventListener('showDashboard', handleShowDashboard);
    window.addEventListener('showVoicePage', handleShowVoicePage);

    return () => {
      window.removeEventListener('showPipeline', handleShowPipeline);
      window.removeEventListener('showDashboard', handleShowDashboard);
      window.removeEventListener('showVoicePage', handleShowVoicePage);
    };
  }, []);

  const mockCompanies = [
    {
      name: "TechCorp",
      industry: "Enterprise Software",
      description: "Enterprise Software company specializing in cloud-based analytics",
      employee_count: 150,
      employees: 150,
      value: "$150K",
      stage: 4,
      contacts: [
        { 
          name: "John Smith", 
          role: "VP Engineering", 
          disc: "D",
          email: "john.smith@techcorp.com",
          phone: "+1 (555) 123-4567",
          linkedIn: "linkedin.com/in/johnsmith",
          research: "High-energy decision maker who values efficiency and results. Recently posted about scaling engineering teams and new tech stack adoption. Responds well to direct, data-driven communication.",
          personalityTraits: ["Results-oriented", "Quick decision maker", "Values innovation", "Time-conscious"],
          recentActivity: "Posted about microservices architecture, attended TechCrunch Disrupt"
        },
        { 
          name: "Lisa Chen", 
          role: "CFO", 
          disc: "C",
          email: "lisa.chen@techcorp.com",
          phone: "+1 (555) 123-4568",
          linkedIn: "linkedin.com/in/lisachen",
          research: "Detail-oriented financial leader focused on ROI and cost optimization. Recently shared articles about SaaS metrics and efficient spending. Prefers thorough documentation and clear ROI analysis.",
          personalityTraits: ["Analytical", "Risk-averse", "Detail-focused", "ROI-driven"],
          recentActivity: "Shared SaaS metrics whitepaper, attended CFO Summit 2024"
        }
      ],
      summary: "Recent $50M Series C funding • Expanding engineering team from 50 to 150 • Current vendor contract ends Q2",
      tags: ["🔥 Budget Approved", "📈 High Growth", "⚡ Fast Decision Maker"],
      research: {
        description: "TechCorp is a leading enterprise software company specializing in cloud-based analytics and monitoring solutions. They provide real-time infrastructure monitoring, application performance management, and security analytics to enterprise clients. Their platform helps companies optimize their cloud infrastructure and maintain high availability for mission-critical applications.",
        icpFit: "Perfect ICP match: Enterprise software company with 150+ employees, $45M ARR, actively scaling engineering team (50 to 150), fresh Series C funding ($50M), current vendor contract ending Q2, and budget approved for development tools ($2-5M annually). Strong technical leadership with VP Engineering and CFO both engaged in decision process. Pain points align directly with our solutions: scaling infrastructure, development tooling, and security compliance.",
        financials: {
          revenue: "$45M ARR",
          funding: "$50M Series C (Dec 2023)",
          employees: "150+ (50% growth in 6 months)",
          valuation: "$500M"
        },
        techStack: ["React", "Node.js", "PostgreSQL", "AWS", "Kubernetes", "Microservices"],
        recentNews: [
          "Raised $50M Series C to expand engineering team",
          "Launched new AI-powered analytics platform",
          "Announced partnership with Microsoft Azure",
          "Hiring 100+ engineers across US and Europe"
        ],
        painPoints: [
          "Scaling infrastructure challenges",
          "Need for better development tooling",
          "Security compliance requirements",
          "Integration complexity with legacy systems"
        ],
        competitors: ["DataDog", "Splunk", "New Relic"],
        decisionProcess: "Technical evaluation → Budget approval → Legal review → Implementation",
        budget: "$2-5M annually for development tools",
        timeline: "Q2 2024 implementation target"
      }
    },
    {
      name: "StartupXYZ", 
      industry: "FinTech",
      value: "$75K",
      stage: 3,
      contacts: [
        { 
          name: "Sarah Chen", 
          role: "CEO", 
          disc: "S",
          email: "sarah@startupxyz.com",
          phone: "+1 (555) 234-5678",
          linkedIn: "linkedin.com/in/sarahchen",
          research: "Collaborative leader building a inclusive company culture. Values relationships and team input in decisions. Recently spoke about work-life balance and sustainable growth.",
          personalityTraits: ["People-focused", "Collaborative", "Steady growth", "Team-oriented"],
          recentActivity: "Keynote on startup culture, featured in Forbes 30 Under 30"
        },
        { 
          name: "Mike Ross", 
          role: "CTO", 
          disc: "I",
          email: "mike@startupxyz.com",
          phone: "+1 (555) 234-5679",
          linkedIn: "linkedin.com/in/mikeross",
          research: "Charismatic tech leader who loves sharing knowledge and building networks. Active on social media discussing latest tech trends. Responds well to engaging conversations and social proof.",
          personalityTraits: ["Enthusiastic", "Social", "Trend-focused", "Network builder"],
          recentActivity: "Tech podcast guest, organized developer meetup"
        }
      ],
      summary: "Seed funded startup • Building MVP • Looking for scalable solutions • Decision timeline Q1 2024",
      tags: ["🚀 Early Stage", "💡 Innovation Focused"],
      research: {
        description: "StartupXYZ is an innovative FinTech startup building an AI-powered financial advisory platform. They're creating technology that democratizes access to sophisticated financial advice by leveraging machine learning to provide personalized investment recommendations and portfolio management. The platform targets tech-savvy millennials and Gen-Z users looking for data-driven financial guidance.",
        icpFit: "Strong ICP fit: Early-stage FinTech startup ($3M seed funding from top-tier VC Andreessen Horowitz), 25 employees in rapid growth phase, building MVP with Q1 2024 launch target. Budget of $100K-500K allocated for core infrastructure. CEO and CTO both engaged and decision-making timeline aligns perfectly. Pain points around scalable backend architecture and compliance match our expertise. Featured as 'Startup to Watch' with strong growth trajectory.",
        financials: {
          revenue: "$500K ARR",
          funding: "$3M Seed (Sep 2023)",
          employees: "25 (rapid growth phase)",
          valuation: "$25M"
        },
        techStack: ["Python", "Django", "React", "PostgreSQL", "Docker", "GCP"],
        recentNews: [
          "Secured $3M seed funding led by Andreessen Horowitz",
          "Featured in TechCrunch as 'Startup to Watch'",
          "CEO speaking at FinTech Summit 2024",
          "Building AI-powered financial advisory platform"
        ],
        painPoints: [
          "Need for scalable backend architecture",
          "Compliance with financial regulations",
          "User acquisition and retention",
          "Building trust in AI recommendations"
        ],
        competitors: ["Betterment", "Wealthfront", "Personal Capital"],
        decisionProcess: "CEO decision → CTO technical review → Team consensus",
        budget: "$100K-500K for core infrastructure",
        timeline: "Q1 2024 MVP launch"
      }
    },
    {
      name: "CloudFirst",
      industry: "Cloud Infrastructure", 
      value: "$90K",
      stage: 5,
      contacts: [
        { 
          name: "Amanda Torres", 
          role: "Head of Sales", 
          disc: "I",
          email: "amanda@cloudfirst.com",
          phone: "+1 (555) 345-6789",
          linkedIn: "linkedin.com/in/amandatorres",
          research: "Dynamic sales leader focused on building relationships and driving revenue growth. Active in sales communities and frequently shares insights about B2B sales strategies.",
          personalityTraits: ["Relationship builder", "Goal-oriented", "Persuasive", "Team motivator"],
          recentActivity: "Sales leadership webinar, posted about Q4 targets"
        }
      ],
      summary: "In final negotiation stage • Comparing with 2 competitors • Decision expected this week",
      tags: ["🎯 Hot Lead", "⏰ Urgent", "💰 Ready to Buy"],
      research: {
        description: "CloudFirst is a profitable cloud infrastructure provider focused on helping mid-market companies migrate to and optimize their cloud environments. They offer managed cloud services, infrastructure consulting, and cloud cost optimization. With 85 employees and $12M ARR, they're expanding into European markets and have recently won industry recognition for their cloud infrastructure solutions.",
        icpFit: "Hot ICP match: Bootstrapped and profitable ($12M ARR) with 85 employees, in final negotiation stage comparing with 2 competitors. Decision expected THIS WEEK - extremely urgent timeline. Head of Sales actively engaged, budget of $50K-200K annually approved. Key pain points include manual sales processes and lead qualification - perfect fit for our sales automation solutions. Strong buying signals with recent 20% revenue beat and European expansion plans.",
        financials: {
          revenue: "$12M ARR",
          funding: "Bootstrapped (Profitable)",
          employees: "85 (steady growth)",
          valuation: "Private"
        },
        techStack: ["Java", "Spring Boot", "Angular", "MySQL", "Jenkins", "Terraform"],
        recentNews: [
          "Q4 revenue beat expectations by 20%",
          "Expanding to European market",
          "Head of Sales promoted from within",
          "Recently won 'Best Cloud Infrastructure' award"
        ],
        painPoints: [
          "Manual sales processes slowing growth",
          "Need for better lead qualification",
          "Integration with existing CRM system",
          "Sales team efficiency optimization"
        ],
        competitors: ["Salesforce", "HubSpot", "Pipedrive"],
        decisionProcess: "Sales team evaluation → Finance approval → C-suite sign-off",
        budget: "$50K-200K annually for sales tools",
        timeline: "Decision by end of week"
      }
    }
  ];

  const activities = [
    {
      icon: "🔥",
      title: "HOT LEAD ALERT",
      desc: "John Smith (TechCorp) just clicked pricing page",
      detail: "Engagement: 89% | D-Type | Say \"Call John now\"",
      time: "2m ago"
    },
    {
      icon: "📧", 
      title: "EMAIL OPENED",
      desc: "Sarah Chen (StartupXYZ) opened email #3",
      detail: "Subject: \"Quick question about your Q4 goals\"",
      time: "5m ago"
    },
    {
      icon: "🤖",
      title: "AI INSIGHT", 
      desc: "3 leads showing similar behavior patterns",
      detail: "Recommend: Accelerate outreach sequence",
      time: "10m ago"
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'bg-[#0A0E12]' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Futuristic Background Effects */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/5 via-transparent to-[#00C8FF]/5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E78FF]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C8FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1E78FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </>
      )}
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 relative z-10">
        <div className="flex items-center justify-between mb-8 sm:mb-16">
          <div 
            onClick={() => navigate("/")}
            className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer transition-all duration-500 hover:scale-110 flex items-center justify-center group relative"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F6FEA] to-[#a79bf0] rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500"></div>
            <img 
              src="/lovable-uploads/1f618873-7dab-4916-a847-e65595a4c9b7.png"
              alt="mass Logo"
              className="h-12 w-auto sm:h-16 relative z-10 drop-shadow-[0_0_15px_rgba(127,111,234,0.5)]"
            />
          </div>
          
          {/* Mobile-optimized header buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {/* Streak Counter */}
            <button
              onClick={() => navigate("/day-streak")}
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 border border-orange-500/40 hover:border-orange-500/60 transition-all duration-300 hover:scale-105 cursor-pointer group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-base sm:text-lg relative z-10">🔥</span>
              <span className="text-xs sm:text-sm font-bold text-orange-400 relative z-10">{activeStreak}</span>
              <span className={`hidden sm:inline text-xs relative z-10 ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>day streak</span>
            </button>
            
            <Button 
              variant="outline" 
              onClick={toggleTheme}
              size="sm"
              className={`font-inter min-h-[44px] px-3 sm:px-4 inline-flex items-center justify-center relative group overflow-hidden ${
                isDarkMode 
                  ? 'text-white border-[#7F6FEA]/30 hover:border-[#7F6FEA] bg-[#7F6FEA]/5 hover:bg-[#7F6FEA]/10 backdrop-blur-sm' 
                  : 'text-ai-midnight border-ai-cyan/30 hover:bg-ai-cyan/10 bg-transparent hover:text-ai-midnight'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#7F6FEA]/0 via-[#7F6FEA]/10 to-[#7F6FEA]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isDarkMode ? (
                <>
                  <Sun className="h-4 w-4 sm:mr-2 relative z-10" />
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium relative z-10">Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 sm:mr-2 relative z-10" />
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium relative z-10">Dark</span>
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleMode}
              size="sm"
              className={`font-inter min-h-[44px] px-3 sm:px-4 inline-flex items-center justify-center relative group overflow-hidden ${
                isDarkMode 
                  ? 'text-white border-[#a79bf0]/30 hover:border-[#a79bf0] bg-[#a79bf0]/5 hover:bg-[#a79bf0]/10 backdrop-blur-sm' 
                  : 'text-ai-midnight border-ai-cyan/30 hover:bg-ai-cyan/10 bg-transparent hover:text-ai-midnight'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#a79bf0]/0 via-[#a79bf0]/10 to-[#a79bf0]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-xs sm:text-sm font-medium relative z-10">{isDashboardMode ? "Voice" : "Dashboard"}</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowPipeline(true)}
              size="sm"
              className={`font-inter min-h-[44px] px-3 sm:px-4 inline-flex items-center justify-center relative group overflow-hidden ${
                isDarkMode 
                  ? 'text-white border-[#5742e3]/30 hover:border-[#5742e3] bg-[#5742e3]/5 hover:bg-[#5742e3]/10 backdrop-blur-sm' 
                  : 'text-ai-midnight border-ai-cyan/30 hover:bg-ai-cyan/10 bg-transparent hover:text-ai-midnight'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#5742e3]/0 via-[#5742e3]/10 to-[#5742e3]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="text-xs sm:text-sm font-medium relative z-10">Pipeline</span>
            </Button>
            <CubeMenu isDarkMode={isDarkMode} isDashboardMode={isDashboardMode} isVoicePage={!isDashboardMode && !showPipeline} />
          </div>
        </div>

        {/* Company Search Loading Modal - Fixed Overlay */}
        {isSearchingCompanies && (
          <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Card className={`backdrop-blur-xl w-full max-w-md mx-4 animate-fade-in shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' 
                : 'bg-white/90 border-ai-cyan/20'
            }`}>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] flex items-center justify-center animate-pulse">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-space-grotesk font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>
                      🚀 Finding Your Perfect Matches
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-white/70' : 'text-ai-midnight/70'} mt-1`}>
                      {searchStatus || 'Unleashing our AI-powered search...'}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/20' : 'bg-ai-cyan/20'}`}>
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${searchProgress}%`,
                          background: 'linear-gradient(90deg, #1E78FF 0%, #00C8FF 100%)'
                        }}
                      ></div>
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>
                      {Math.round(searchProgress)}% complete
                    </div>
                  </div>
                  
                  {/* Exciting Loading Steps */}
                  <div className="space-y-2 text-xs">
                    <div className={`flex items-center gap-2 ${searchProgress >= 20 ? 'text-green-400' : isDarkMode ? 'text-white/40' : 'text-ai-midnight/40'}`}>
                      <div className={`w-2 h-2 rounded-full ${searchProgress >= 20 ? 'bg-green-400' : isDarkMode ? 'bg-white/20' : 'bg-ai-midnight/20'}`}></div>
                      🎯 Scanning the perfect prospects
                    </div>
                    <div className={`flex items-center gap-2 ${searchProgress >= 60 ? 'text-green-400' : isDarkMode ? 'text-white/40' : 'text-ai-midnight/40'}`}>
                      <div className={`w-2 h-2 rounded-full ${searchProgress >= 60 ? 'bg-green-400' : isDarkMode ? 'bg-white/20' : 'bg-ai-midnight/20'}`}></div>
                      🔍 Deep-diving into company insights
                    </div>
                    <div className={`flex items-center gap-2 ${searchProgress >= 90 ? 'text-green-400' : isDarkMode ? 'text-white/40' : 'text-ai-midnight/40'}`}>
                      <div className={`w-2 h-2 rounded-full ${searchProgress >= 90 ? 'bg-green-400' : isDarkMode ? 'bg-white/20' : 'bg-ai-midnight/20'}`}></div>
                      ✨ Preparing your golden opportunities
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Voice Mode - Minimalistic */}
        {!isDashboardMode && (
          <div className="flex flex-col items-center justify-start pt-8 min-h-[50vh] sm:min-h-[60vh] text-center space-y-8 sm:space-y-16 px-4 relative z-10">
            {/* Context Card - Mobile Optimized */}
            {showContextCard && (
              <Card className={`backdrop-blur-xl w-full max-w-sm sm:max-w-md animate-fade-in shadow-2xl mx-4 relative group ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' 
                  : 'bg-white/80 border-ai-cyan/20'
              }`}>
                {/* Glow effect */}
                {isDarkMode && (
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
                )}
                <CardContent className="p-4 sm:p-6 relative z-10">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className={`text-lg sm:text-xl font-space-grotesk font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>John Smith - TechCorp</h3>
                    <Badge className={`border-destructive/40 text-xs ${isDarkMode ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 text-white' : 'bg-red-100/80 text-red-700'}`}>HOT 🔥</Badge>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-sm font-inter">
                    <div className="flex justify-between items-start">
                      <span className={`${isDarkMode ? 'text-white/70' : 'text-ai-midnight/70'} text-xs sm:text-sm`}>Last Action:</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-ai-midnight'} text-xs sm:text-sm text-right flex-1 ml-2`}>Clicked pricing link 2 mins ago</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className={`${isDarkMode ? 'text-white/70' : 'text-ai-midnight/70'} text-xs sm:text-sm`}>Next Touch:</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-ai-midnight'} text-xs sm:text-sm text-right flex-1 ml-2`}>Voice call in 1 hour</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`${isDarkMode ? 'text-white/70' : 'text-ai-midnight/70'} text-xs sm:text-sm`}>Engagement:</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-ai-midnight'} text-xs sm:text-sm`}>89%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-white/20' : 'bg-ai-cyan/20'}`}>
                      <div 
                        className="h-full rounded-full w-[89%]"
                        style={{ background: 'linear-gradient(90deg, #B389FF 10%, #7AF0FF 90%)' }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Dashboard Mode - New Design */}
        {isDashboardMode && (
          <div className="space-y-4 sm:space-y-5 animate-fade-in max-w-4xl mx-auto px-4 py-4">
            
            {/* MASS-1 Title */}
            <div className="text-center mb-6">
              <h1 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>MASS-1</h1>
            </div>

            {/* Three Circular Progress Rings */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
              {/* Meetings to Goal */}
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4 sm:p-6 flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="8" fill="none" className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
                      <circle cx="50%" cy="50%" r="38%" stroke="#34D399" strokeWidth="8" fill="none" strokeDasharray="240" strokeDashoffset="72" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>70</span>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium uppercase tracking-wider text-center ${isDarkMode ? 'text-white/80' : 'text-ai-midnight/80'}`}>MEETINGS<br/>TO GOAL</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-ai-midnight/50'} mt-1`}>% this week</div>
                </CardContent>
              </Card>

              {/* Pipeline Coverage */}
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4 sm:p-6 flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="8" fill="none" className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
                      <circle cx="50%" cy="50%" r="38%" stroke="#60A5FA" strokeWidth="8" fill="none" strokeDasharray="240" strokeDashoffset="36" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>85</span>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium uppercase tracking-wider text-center ${isDarkMode ? 'text-white/80' : 'text-ai-midnight/80'}`}>PIPELINE<br/>COVERAGE</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-ai-midnight/50'} mt-1`}>% next 60d</div>
                </CardContent>
              </Card>

              {/* Positive Reply Rate */}
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4 sm:p-6 flex flex-col items-center">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="38%" stroke="currentColor" strokeWidth="8" fill="none" className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
                      <circle cx="50%" cy="50%" r="38%" stroke="#A78BFA" strokeWidth="8" fill="none" strokeDasharray="240" strokeDashoffset="48" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>80</span>
                    </div>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium uppercase tracking-wider text-center ${isDarkMode ? 'text-white/80' : 'text-ai-midnight/80'}`}>POSITIVE<br/>REPLY RATE</div>
                  <div className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-ai-midnight/50'} mt-1`}>% engaged</div>
                </CardContent>
              </Card>
            </div>

            {/* GTM Plan - Gamified */}
            <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
              <CardContent className="p-4 sm:p-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>GTM Plan</h3>
                </div>

                {/* Milestone Journey */}
                <div className="mb-4">
                  <div className="flex items-center justify-between relative">
                    <div className={`absolute top-4 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-ai-midnight/10'}`}></div>
                    {['Prospecting', 'Qualifying', 'Meeting', 'Closing', 'Won'].map((stage, idx) => (
                      <div key={stage} className="relative z-10 flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          idx === 1 
                            ? 'bg-green-400 scale-110 shadow-lg shadow-green-400/50' 
                            : idx < 1 
                            ? 'bg-green-400/50' 
                            : isDarkMode ? 'bg-white/10' : 'bg-ai-midnight/10'
                        }`}>
                          {idx === 0 && <Target className="w-4 h-4 text-white" />}
                          {idx === 1 && <Zap className="w-4 h-4 text-white animate-pulse" />}
                          {idx === 2 && <Phone className="w-4 h-4 text-white/50" />}
                          {idx === 3 && <TrendingUp className="w-4 h-4 text-white/50" />}
                          {idx === 4 && <span className="text-xs">🏆</span>}
                        </div>
                        <span className={`text-[10px] font-medium ${
                          idx === 1 
                            ? 'text-green-400' 
                            : isDarkMode ? 'text-white/40' : 'text-ai-midnight/40'
                        }`}>{stage}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Achievement Teaser */}
                <div className={`mb-4 p-2.5 rounded-lg ${isDarkMode ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                  <p className="text-xs text-amber-400 font-medium">
                    ⚡ 2 more contacts added to unlock: <span className="font-bold">Networker Badge 🏆</span>
                  </p>
                </div>

                {/* Today's Quick Wins */}
                <div className="space-y-2 mb-4">
                  <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/70' : 'text-ai-midnight/70'} mb-2`}>Today's Quick Wins</h4>
                  {quickWins.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setQuickWins(quickWins.map(t => 
                          t.id === task.id ? { ...t, completed: !t.completed } : t
                        ));
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${
                        task.completed 
                          ? isDarkMode ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-500/10 border border-green-500/30'
                          : isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'bg-ai-midnight/5 hover:bg-ai-midnight/10 border border-ai-midnight/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        task.completed 
                          ? 'bg-green-400 border-green-400 scale-110' 
                          : isDarkMode ? 'border-white/30' : 'border-ai-midnight/30'
                      }`}>
                        {task.completed && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${
                        task.completed 
                          ? 'text-green-400 line-through' 
                          : isDarkMode ? 'text-white/80' : 'text-ai-midnight/80'
                      }`}>{task.label}</span>
                    </button>
                  ))}
                </div>

                {/* Animated Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Overall Progress</span>
                    <span className="text-xs font-bold text-green-400">32%</span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-ai-midnight/10'} overflow-hidden relative`}>
                    <div 
                      className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-green-400 to-green-500 relative"
                      style={{ width: '32%' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Outlook */}
            <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>📅 Daily Outlook</h3>
                  <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-[#253241] border border-[#3A4656]' : 'bg-ai-cyan/10'} ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/70'}`}>Today</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#16202A]' : 'bg-ai-cyan/5'}`}>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/60'}`}>Leads to<br/>enrich</div>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>120</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#16202A]' : 'bg-ai-cyan/5'}`}>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/60'}`}>Outreach<br/>queued</div>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>380</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-[#16202A]' : 'bg-ai-cyan/5'}`}>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/60'}`}>Meetings</div>
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>3</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Send Window */}
            <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>Best Send Window</h3>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-[#1E78FF]/20 text-[#00C8FF] border border-[#1E78FF]/30' : 'bg-blue-100 text-blue-700'}`}>Auto</span>
                    <button className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-[#253241] hover:bg-[#3A4656]' : 'bg-ai-cyan/10 hover:bg-ai-cyan/20'} ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/70'}`}>Edit</button>
                  </div>
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-[#A7B4C2]' : 'text-ai-midnight/60'} mb-2`}>Recommended</div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>08:22–10:10 AM</div>
              </CardContent>
            </Card>

            {/* Signal & Health */}
            <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>📊 Signal & Health</h3>
                  <span className={`text-xs ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Last 7 days</span>
                </div>
                <div className="h-48 relative">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="50" y2="180" stroke="currentColor" strokeWidth="1" className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
                    <line x1="50" y1="180" x2="480" y2="180" stroke="currentColor" strokeWidth="1" className={isDarkMode ? 'text-gray-700' : 'text-gray-300'} />
                    
                    {/* Intent Heat line (blue) */}
                    <polyline points="70,140 130,110 190,60 250,70 310,130 370,170 430,150" fill="none" stroke="#60A5FA" strokeWidth="3" />
                    
                    {/* System Health line (green) */}
                    <polyline points="70,120 130,100 190,110 250,105 310,80 370,30 430,160" fill="none" stroke="#34D399" strokeWidth="3" />
                    
                    {/* Data points */}
                    <circle cx="70" cy="140" r="4" fill="#60A5FA" />
                    <circle cx="130" cy="110" r="4" fill="#60A5FA" />
                    <circle cx="190" cy="60" r="4" fill="#60A5FA" />
                    <circle cx="250" cy="70" r="4" fill="#60A5FA" />
                    <circle cx="310" cy="130" r="4" fill="#60A5FA" />
                    <circle cx="370" cy="170" r="4" fill="#60A5FA" />
                    <circle cx="430" cy="150" r="4" fill="#60A5FA" />
                    
                    <circle cx="70" cy="120" r="4" fill="#34D399" />
                    <circle cx="130" cy="100" r="4" fill="#34D399" />
                    <circle cx="190" cy="110" r="4" fill="#34D399" />
                    <circle cx="250" cy="105" r="4" fill="#34D399" />
                    <circle cx="310" cy="80" r="4" fill="#34D399" />
                    <circle cx="370" cy="30" r="4" fill="#34D399" />
                    <circle cx="430" cy="160" r="4" fill="#34D399" />
                    
                    {/* X-axis labels */}
                    <text x="70" y="195" className={`text-xs fill-current ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`} textAnchor="middle">Sat</text>
                    <text x="190" y="195" className={`text-xs fill-current ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`} textAnchor="middle">Mon</text>
                    <text x="250" y="195" className={`text-xs fill-current ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`} textAnchor="middle">Tue</text>
                    <text x="370" y="195" className={`text-xs fill-current ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`} textAnchor="middle">Thu</text>
                    <text x="430" y="195" className={`text-xs fill-current ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`} textAnchor="middle">Fri</text>
                  </svg>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-400"></div>
                    <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>Intent Heat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-400"></div>
                    <span className={isDarkMode ? 'text-green-400' : 'text-green-600'}>System Health %</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className={`text-xs mb-2 ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Leads Enriched</div>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>739</div>
                </CardContent>
              </Card>
              
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className={`text-xs mb-2 ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Emails Sent</div>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>4,644</div>
                </CardContent>
              </Card>
              
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className={`text-xs mb-2 ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Avg Reply Rate</div>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>6.2%</div>
                </CardContent>
              </Card>
              
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className={`text-xs mb-2 ${isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}`}>Meetings Booked</div>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>12</div>
                </CardContent>
              </Card>
            </div>

            {/* System Monitor */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>System Monitor</h3>
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700'}`}>OK</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}>APIs</span>
                      <span className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDarkMode ? 'text-white/60' : 'text-ai-midnight/60'}>Latency</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>210ms</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-[#16202A] to-[#253241] border-[#3A4656]' : 'bg-white/80 border-ai-cyan/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>Deliverability Risk</h3>
                    <span className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-700'}`}>Medium</span>
                  </div>
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>1.6</div>
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>

      {/* Voice Orb - Bottom Right Corner */}
      <div className="fixed bottom-6 sm:bottom-10 right-6 sm:right-10 z-50 pointer-events-none">
        <div className="flex flex-col items-center pointer-events-auto">
          <button
            onClick={toggleChat}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 touch-manipulation ${
              isVoiceActive ? 'animate-pulse' : ''
            } ${isProcessing ? 'animate-spin' : ''}`}
            style={{ 
              boxShadow: '0 10px 30px rgba(179, 137, 255, 0.3)',
              minHeight: '44px',
              minWidth: '44px'
            }}
          >
            <img 
              src="/lovable-uploads/05f90dd5-1831-4467-8de4-7a18c9273cbb.png"
              alt="mass Logo"
              className="object-contain w-16 h-16 sm:w-20 sm:h-20"
            />
          </button>
          <div className={`mt-2 sm:mt-3 text-xs sm:text-sm font-inter ${isDarkMode ? 'text-white' : 'text-black'}`}>{voiceText}</div>
        </div>
      </div>

      {/* Pipeline Modal */}
      {showPipeline && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-10 animate-fade-in">
          {/* Ambient gradient background */}
          <div className={`absolute inset-0 pointer-events-none ${
            isDarkMode ? 'bg-[#0A0E12]' : 'bg-gradient-to-br from-slate-50 to-blue-50'
          }`}>
            {isDarkMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/5 via-transparent to-[#00C8FF]/5"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E78FF]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C8FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1E78FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              </>
            )}
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-space-grotesk font-extrabold tracking-tight" style={{
                  background: 'linear-gradient(90deg, #1E78FF 0%, #00C8FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>Pipeline Overview</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPipeline(false)}
                  className="group hover:bg-white/10 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                  title="Close Pipeline"
                >
                  <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                </Button>
              </div>
              <CubeMenu
                isDarkMode={isDarkMode}
                isDashboardMode={false}
                isPipelineMode={true}
                onClosePipeline={() => setShowPipeline(false)}
              />
            </div>

            {/* Search Status Banner */}
            {!companiesApi.isLoading && apiCompanies.length === 0 && !companiesApi.error && (
              <Card className="backdrop-blur-xl p-6 text-center mb-6">
                <h3 className="text-lg font-space-grotesk font-semibold mb-2">No companies found matching your criteria</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your ICP configuration or search again</p>
                <Button onClick={() => setShowPipeline(false)}>
                  Back to Search
                </Button>
              </Card>
            )}

            {/* Result Count Banner */}
            {apiCompanies.length > 0 && (
              <div className="mb-4 text-center">
                <Badge variant="outline" className="text-sm">
                  Found {apiCompanies.length} companies matching your ICP
                  {companiesApi.usedMock && " (Demo Data)"}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {(() => {
                // Show API companies if available and not empty
                if (apiCompanies.length > 0) {
                  return apiCompanies.map((company, index) => {
                const isExpanded = expandedCompanies.has(index);
                
                return (
                  <Card 
                    key={index} 
                    className="backdrop-blur-xl hover:shadow-xl transition-all shadow-lg border"
                    style={{ 
                      backgroundColor: '#16202A',
                      borderColor: '#3A4656'
                    }}
                  >
                    {/* Company Header - Always Visible */}
                    <CardContent 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleCompanyExpansion(index)}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-space-grotesk font-semibold" style={{ color: '#E6EDF4' }}>{company.name}</h3>
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5" style={{ color: '#A7B4C2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-sm font-inter mt-1" style={{ color: '#A7B4C2' }}>
                            {company.industry || company.description || 'Technology Company'}
                          </p>
                        </div>
                        <div className="text-2xl font-jetbrains font-light" style={{ color: '#00C8FF' }}>
                          {company.value || `$${company.employees || 'N/A'}K`}
                        </div>
                      </div>

                      {/* Pipeline Stages */}
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6].map((stage) => (
                          <div 
                            key={stage}
                            className={`h-1 flex-1 rounded-full`}
                            style={{
                              backgroundColor: stage < (company.stage || 2) ? '#00C8FF' : 
                                stage === (company.stage || 2) ? '#1E78FF' : '#253241'
                            }}
                          />
                        ))}
                      </div>

                    </CardContent>

                    {/* Expanded Content - Decision Makers & Research */}
                    {isExpanded && (
                      <CardContent className="px-6 pb-6 pt-0 space-y-4 animate-fade-in">
                        {/* Summary */}
                        <p className="text-sm font-inter" style={{ color: '#A7B4C2' }}>
                          {company.summary || company.description || 'Company details being processed...'}
                        </p>

                        {/* Decision Makers Section */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 font-inter" style={{ color: '#E6EDF4' }}>Decision Makers</h4>
                          <div className="space-y-2">
                            {(company.contacts || []).map((contact, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-md" style={{ 
                                backgroundColor: '#253241',
                                borderColor: '#3A4656'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#16202A';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#253241';
                              }}
                              >
                                <div className="flex-1">
                                  <div className="text-white text-sm font-inter">{contact.name || contact.email || 'Contact'}</div>
                                  <div className="text-white/60 text-xs font-inter">{contact.role || 'Decision Maker'}</div>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-8 h-8 p-0 hover:bg-white/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedContactForResearch(contact);
                                      setShowContactResearchModal(true);
                                    }}
                                  >
                                    <Brain className="w-3 h-3 text-white" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="w-8 h-8 p-0 hover:bg-white/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedContactForEmail(contact);
                                      setShowEmailDraftModal(true);
                                    }}
                                  >
                                    <MessageSquare className="w-3 h-3 text-white" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Research Button */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(company);
                              setShowResearchModal(true);
                            }}
                            className="bg-secondary hover:bg-secondary/80 text-black font-inter text-xs px-3 py-2"
                          >
                            🧠 Full Research Report
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
                  });
                } else if (companiesApi.error) {
                  // Show mock companies if there's an error
                  return mockCompanies.map((company, index) => {
                const isExpanded = expandedCompanies.has(index);
                
                return (
                  <Card 
                    key={index} 
                    className="backdrop-blur-xl hover:shadow-xl transition-all shadow-lg border"
                    style={{ 
                      backgroundColor: '#16202A',
                      borderColor: '#3A4656'
                    }}
                  >
                    {/* Company Header - Always Visible */}
                    <CardContent 
                      className="p-6 cursor-pointer"
                      onClick={() => toggleCompanyExpansion(index)}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-space-grotesk font-semibold" style={{ color: '#E6EDF4' }}>{company.name}</h3>
                            <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-5 h-5" style={{ color: '#A7B4C2' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          <p className="text-sm font-inter mt-1" style={{ color: '#A7B4C2' }}>
                            {company.industry || company.description || 'Technology Company'}
                          </p>
                        </div>
                        <div className="text-2xl font-jetbrains font-light" style={{ color: '#00C8FF' }}>
                          {company.value || `$${company.employee_count || company.employees || 'N/A'}K`}
                        </div>
                      </div>

                      {/* Pipeline Stages */}
                      <div className="flex gap-1">
                        {[1,2,3,4,5,6].map((stage) => (
                          <div 
                            key={stage}
                            className={`h-1 flex-1 rounded-full`}
                            style={{
                              backgroundColor: stage < (company.stage || 2) ? '#00C8FF' : 
                                stage === (company.stage || 2) ? '#1E78FF' : '#253241'
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <CardContent className="pt-0 p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs font-inter uppercase tracking-wider mb-1" style={{ color: '#A7B4C2' }}>Summary</p>
                            <p className="text-sm font-inter" style={{ color: '#A7B4C2' }}>
                              {company.summary || company.description || 'Company details being processed...'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-inter uppercase tracking-wider mb-1" style={{ color: '#A7B4C2' }}>Tags</p>
                            <div className="flex gap-2 flex-wrap">
                              {(company.tags || []).map((tag, idx) => (
                                <span key={idx} className="text-xs font-inter px-2 py-1 rounded-full" style={{ backgroundColor: '#253241', color: '#00C8FF' }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Contacts */}
                        <div className="mb-4">
                          <p className="text-xs font-inter uppercase tracking-wider mb-2" style={{ color: '#A7B4C2' }}>Key Contacts</p>
                          <div className="grid grid-cols-1 gap-2">
                            {(company.contacts || []).map((contact, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
                                style={{ backgroundColor: '#253241' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedContact(contact);
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                    contact.disc === 'D' ? 'bg-red-500' :
                                    contact.disc === 'I' ? 'bg-orange-500' :
                                    contact.disc === 'S' ? 'bg-green-500' : 'bg-blue-500'
                                  }`}>
                                    {contact.disc || 'C'}
                                  </div>
                                  <div>
                                    <div className="text-white text-sm font-inter">{contact.name || contact.email || 'Contact'}</div>
                                    <div className="text-white/60 text-xs font-inter">{contact.role || 'Decision Maker'}</div>
                                  </div>
                                </div>
                                <button className="text-secondary hover:text-secondary/80 transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompany(company);
                              setShowResearchModal(true);
                            }}
                            className="bg-secondary hover:bg-secondary/80 text-black font-inter text-xs px-3 py-2"
                          >
                            🧠 Full Research Report
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
                  });
                }
                // Show nothing if loading or no companies
                return null;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto p-10 animate-fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-space-grotesk font-bold text-white">Contact Profile</h2>
              <Button 
                variant="outline" 
                onClick={() => setSelectedContact(null)}
                className="border-border hover:bg-muted font-inter"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>

            <Card className="bg-secondary/10 border-secondary/25 backdrop-blur-xl">
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                    selectedContact.disc === 'D' ? 'bg-red-500' :
                    selectedContact.disc === 'I' ? 'bg-orange-500' :
                    selectedContact.disc === 'S' ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {selectedContact.disc}
                  </div>
                  <div>
                    <h3 className="text-2xl font-space-grotesk font-bold text-white">{selectedContact.name}</h3>
                    <p className="text-lg text-white/70 font-inter">{selectedContact.role}</p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-3">
                    <h4 className="font-space-grotesk font-semibold text-white mb-3">Contact Information</h4>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-secondary" />
                      <span className="text-white/80 font-inter">{selectedContact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-secondary" />
                      <span className="text-white/80 font-inter">{selectedContact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="text-white/80 font-inter">{selectedContact.linkedIn}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-space-grotesk font-semibold text-white mb-3">DISC Profile</h4>
                    <div className="space-y-2">
                      {selectedContact.personalityTraits.map((trait, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span className="text-white/80 font-inter text-sm">{trait}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Research Summary */}
                <div className="mb-6">
                  <h4 className="font-space-grotesk font-semibold text-white mb-3">Research Summary</h4>
                  <p className="text-white/80 font-inter leading-relaxed">{selectedContact.research}</p>
                </div>

                {/* Recent Activity */}
                <div className="mb-6">
                  <h4 className="font-space-grotesk font-semibold text-white mb-3">Recent Activity</h4>
                  <p className="text-white/70 font-inter">{selectedContact.recentActivity}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="bg-secondary hover:bg-secondary/80 text-black font-inter">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="border-secondary/30 text-white hover:bg-secondary/20 font-inter">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                  <Button variant="outline" className="border-secondary/30 text-white hover:bg-secondary/20 font-inter">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    LinkedIn Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

        {/* Research Modal */}
        <Dialog open={showResearchModal} onOpenChange={(open) => {
          setShowResearchModal(open);
          if (!open) {
            setShowPipeline(true);
          }
        }}>
        <DialogContent className="w-[90vw] max-h-[85vh] sm:w-[90vw] sm:h-auto md:w-[85vw] lg:max-w-5xl xl:max-w-6xl sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[48px] p-3 sm:p-4 md:p-6 [&>button]:hidden">
          <DialogDescription className="sr-only">
            Company research and contact information modal
          </DialogDescription>
          {/* Close Button */}
          <button
            onClick={() => {
              setShowResearchModal(false);
              setShowPipeline(true);
            }}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2 transition-colors !block"
          >
            <X className="h-4 w-4 text-white" />
          </button>

            {/* Match SquadPage ambient gradient background */}
            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-[48px] overflow-hidden pointer-events-none ${
              isDarkMode ? 'bg-[#0A0E12]' : 'bg-gradient-to-br from-slate-50 to-blue-50'
            }`}>
              {isDarkMode && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/5 via-transparent to-[#00C8FF]/5"></div>
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E78FF]/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C8FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1E78FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </>
              )}
            </div>
            
            {/* Content container with scroll */}
            <div className="relative z-10 h-full overflow-y-auto">
              <DialogHeader className="mb-3 sm:mb-4 md:mb-6 sticky top-0 pb-3 sm:pb-4 z-20">
                <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                  {selectedCompany?.name} Research Report
                </DialogTitle>
              </DialogHeader>
            
            {selectedCompany && (
              <div className="relative z-10">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full mb-1 sm:mb-4 md:mb-6 bg-transparent border border-primary/20 rounded-full p-1 gap-1 h-auto">
                    <TabsTrigger value="overview" className="flex items-center justify-center gap-0 sm:gap-2 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-primary/10 font-space-grotesk font-semibold rounded-full px-2 md:px-4 py-2 transition-colors whitespace-nowrap h-9">
                      <Building2 size={16} className="flex-shrink-0" />
                      <span className="hidden sm:inline">Overview</span>
                      <span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="intelligence" className="flex items-center justify-center gap-0 sm:gap-2 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-primary/10 font-space-grotesk font-semibold rounded-full px-2 md:px-4 py-2 transition-colors whitespace-nowrap h-9">
                      <Brain size={16} className="flex-shrink-0" />
                      <span className="hidden sm:inline">Intelligence</span>
                      <span className="sm:hidden">Intel</span>
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="flex items-center justify-center gap-0 sm:gap-2 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-primary/10 font-space-grotesk font-semibold rounded-full px-2 md:px-4 py-2 transition-colors whitespace-nowrap h-9">
                      <Code size={16} className="flex-shrink-0" />
                      <span className="hidden sm:inline">Technical</span>
                      <span className="sm:hidden">Tech</span>
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="flex items-center justify-center gap-0 sm:gap-2 text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-primary/10 font-space-grotesk font-semibold rounded-full px-2 md:px-4 py-2 transition-colors whitespace-nowrap h-9">
                      <Users size={16} className="flex-shrink-0" />
                      <span className="sm:hidden">Contact</span>
                      <span className="hidden sm:inline">Contacts</span>
                    </TabsTrigger>
                  </TabsList>

                  <div className="overflow-y-auto px-1 sm:px-2 pb-6 scrollbar-thin scrollbar-thumb-gradient scrollbar-track-glass scrollbar-thumb-rounded-full scrollbar-track-rounded-full hover:scrollbar-thumb-glow" style={{ maxHeight: 'calc(85vh - 120px)' }}>
                    <TabsContent value="overview" className="space-y-3 sm:space-y-4 md:space-y-6">
                      {/* Company Header */}
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl sm:rounded-2xl lg:rounded-[32px] p-3 sm:p-4 md:p-6 lg:p-8 border border-primary/20">
                        <div className="mb-3 sm:mb-4 md:mb-6">
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            {selectedCompany.name}
                          </h3>
                          <div className="inline-flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 mt-2 mb-3 sm:mb-4 border border-primary/20">
                            <span className="text-xs sm:text-sm font-semibold text-foreground font-space-grotesk">{selectedCompany.industry}</span>
                          </div>
                          
                          {/* Company Description */}
                          <div className="mt-2 sm:mt-3 md:mt-4">
                            <p className="text-[10px] sm:text-xs md:text-sm text-white font-inter leading-relaxed">
                              {selectedCompany.research?.description || selectedCompany.description || 'Company information is being processed...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                  <TabsContent value="intelligence" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Target size={16} className="sm:w-5 sm:h-5 text-primary" />
                          <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Pain Points
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {(selectedCompany.research?.painPoints || ['Technology scaling challenges', 'Digital transformation needs', 'Operational efficiency improvements']).map((point, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm font-inter">
                              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <TrendingUp size={16} className="sm:w-5 sm:h-5 text-secondary" />
                          <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Recent News
                          </h3>
                        </div>
                        <ul className="space-y-3">
                          {(selectedCompany.research?.recentNews || ['Company expanding operations', 'New product launches', 'Strategic partnerships']).map((news, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm font-inter">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span className="text-muted-foreground leading-relaxed">{news}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Calendar size={16} className="sm:w-5 sm:h-5 text-secondary" />
                          <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Timeline & Budget
                          </h3>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-2 text-foreground font-space-grotesk">Decision Timeline</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground font-inter">{selectedCompany.research.timeline}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-xs sm:text-sm mb-2 text-foreground font-space-grotesk">Budget Range</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground font-inter">{selectedCompany.research.budget}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                      <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-3 sm:mb-4">
                        Competitive Landscape
                      </h3>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {selectedCompany.research.competitors.map((competitor, index) => (
                          <div key={index} className="inline-flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20">
                            <span className="text-sm font-semibold text-foreground font-inter">{competitor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <FileText size={16} className="sm:w-5 sm:h-5 text-primary" />
                        <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                          Decision Process
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground font-inter leading-relaxed">{selectedCompany.research.decisionProcess}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="technical" className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl lg:rounded-[32px] p-4 sm:p-6 border border-primary/20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <Code size={16} className="sm:w-5 sm:h-5 text-primary" />
                          <h3 className="text-base sm:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                            Tech Stack
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                          {(selectedCompany.research?.techStack || ['AWS', 'React', 'Node.js', 'Python', 'PostgreSQL']).map((tech, index) => (
                            <div key={index} className="inline-flex items-center bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-sm rounded-full px-4 py-2 border border-primary/20">
                              <span className="text-sm font-semibold text-foreground font-inter">{tech}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contacts" className="space-y-3 sm:space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                      {(selectedCompany.contacts || []).map((contact, index) => (
                        <div key={index} className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl sm:rounded-2xl lg:rounded-[32px] p-3 sm:p-4 md:p-6 border border-primary/20">
                          <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base md:text-xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent truncate">
                                {contact.name || contact.email || 'Contact'}
                              </h3>
                              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-inter">{contact.role || 'Decision Maker'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 text-[10px] sm:text-xs md:text-sm mb-2 sm:mb-3 md:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Mail size={12} className="text-primary flex-shrink-0" />
                              <span className="text-muted-foreground font-inter truncate">{contact.email || 'Email not available'}</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Phone size={12} className="text-secondary flex-shrink-0" />
                              <span className="text-muted-foreground font-inter">{contact.phone || 'Phone not available'}</span>
                            </div>
                            {contact.linkedIn && (
                              <div className="flex items-center gap-2 sm:gap-3">
                                <ExternalLink size={12} className="text-primary flex-shrink-0" />
                                <span className="text-muted-foreground font-inter truncate">{contact.linkedIn}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-2 sm:mb-3 md:mb-4">
                            <h5 className="font-semibold text-[10px] sm:text-xs md:text-sm mb-1.5 sm:mb-2 md:mb-3 text-foreground font-space-grotesk">Personality Traits</h5>
                            <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
                              {(contact.personalityTraits || ['Professional', 'Results-oriented', 'Strategic thinker']).map((trait, i) => (
                                <div key={i} className="inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1">
                                  <span className="text-[9px] sm:text-xs font-semibold text-foreground font-inter">{trait}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-[10px] sm:text-xs px-2 sm:px-3"
                              onClick={() => {
                                setSelectedContactForResearch(contact);
                                setShowContactResearchModal(true);
                              }}
                            >
                              <Brain size={12} className="mr-1 sm:mr-2" />
                              Research
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-[10px] sm:text-xs px-2 sm:px-3">
                              <Phone size={12} className="mr-1 sm:mr-2" />
                              Call
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-[10px] sm:text-xs px-2 sm:px-3">
                              <Mail size={12} className="mr-1 sm:mr-2" />
                              Email
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-[10px] sm:text-xs px-2 sm:px-3"
                              onClick={() => {
                                if (contact.linkedIn) {
                                  window.open(contact.linkedIn, '_blank');
                                }
                              }}
                              disabled={!contact.linkedIn}
                            >
                              <ExternalLink size={12} className="mr-1 sm:mr-2" />
                              LinkedIn
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Deep Research Modal */}
      <Dialog open={showContactResearchModal} onOpenChange={(open) => {
        setShowContactResearchModal(open);
        if (!open) {
          setShowPipeline(true);
        }
      }}>
        <DialogContent className="w-[90vw] max-h-[85vh] sm:w-[90vw] sm:h-auto md:w-[85vw] lg:max-w-5xl xl:max-w-6xl sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[48px] p-3 sm:p-4 md:p-6 [&>button]:hidden">
          <DialogDescription className="sr-only">
            Contact deep research and personality analysis modal
          </DialogDescription>
          {/* Close Button */}
          <button
            onClick={() => {
              setShowContactResearchModal(false);
              setShowPipeline(true);
            }}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2 transition-colors !block"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Match company research modal ambient gradient background */}
          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-[48px] overflow-hidden pointer-events-none ${
            isDarkMode ? 'bg-[#0A0E12]' : 'bg-gradient-to-br from-slate-50 to-blue-50'
          }`}>
            {isDarkMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/5 via-transparent to-[#00C8FF]/5"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E78FF]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C8FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1E78FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              </>
            )}
          </div>
          
          {/* Content container with scroll */}
          <div className="relative z-10 h-full overflow-y-auto max-h-[calc(85vh-2rem)] sm:max-h-[calc(90vh-3rem)] pb-6">
            <DialogHeader className="mb-3 sm:mb-4 md:mb-6 pb-3 sm:pb-4 z-20">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-space-grotesk font-extrabold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Deep Research Profile
              </DialogTitle>
            </DialogHeader>
          
          {selectedContactForResearch && (
            <div className="relative z-10 space-y-3 sm:space-y-4 md:space-y-6">
              {/* Contact Header */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 backdrop-blur-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto sm:mx-0">
                  <span className="text-xl sm:text-2xl font-space-grotesk font-bold text-white">
                    {selectedContactForResearch.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-space-grotesk font-bold text-white mb-1 sm:mb-2">
                    {selectedContactForResearch.name}
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg text-white/70 font-inter mb-2 sm:mb-3">{selectedContactForResearch.role}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-inter text-xs">
                      DISC-{selectedContactForResearch.disc}
                    </Badge>
                    <Badge variant="outline" className="border-primary/20 text-white font-inter text-xs">
                      Decision Maker
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center">
                  <Button size="sm" className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-xs px-3">
                    <Phone className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Call</span>
                  </Button>
                  <Button size="sm" className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-xs px-3">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Email</span>
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-space-grotesk rounded-full text-xs px-3"
                    onClick={() => {
                      if (selectedContactForResearch.linkedIn) {
                        window.open(selectedContactForResearch.linkedIn, '_blank');
                      }
                    }}
                    disabled={!selectedContactForResearch.linkedIn}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="flex w-full bg-white/5 border border-white/20 rounded-full p-1 gap-1 mb-4">
                  <TabsTrigger 
                    value="profile" 
                    className="flex-1 flex items-center justify-center gap-2 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-white/10 font-space-grotesk font-semibold rounded-full px-3 py-2 transition-colors whitespace-nowrap"
                  >
                    Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activity" 
                    className="flex-1 flex items-center justify-center gap-2 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-white/10 font-space-grotesk font-semibold rounded-full px-3 py-2 transition-colors whitespace-nowrap"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="insights" 
                    className="flex-1 flex items-center justify-center gap-2 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-white/10 font-space-grotesk font-semibold rounded-full px-3 py-2 transition-colors whitespace-nowrap"
                  >
                    Insights
                  </TabsTrigger>
                  <TabsTrigger 
                    value="strategy" 
                    className="flex-1 flex items-center justify-center gap-2 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-none text-white hover:bg-white/10 font-space-grotesk font-semibold rounded-full px-3 py-2 transition-colors whitespace-nowrap"
                  >
                    Strategy
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <TabsContent value="profile" className="space-y-6">
                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl">
                      <CardHeader className="p-6">
                        <CardTitle className="text-lg font-space-grotesk text-white flex items-center gap-2">
                          <Brain className="w-5 h-5 text-primary" />
                          DISC Analysis & Personality Traits
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="font-space-grotesk font-semibold text-white text-sm">Core Traits</h4>
                            <div className="space-y-2">
                              {selectedContactForResearch.personalityTraits?.map((trait, index) => (
                                <div key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                  <span className="text-white/70 font-inter text-xs">{trait}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-space-grotesk font-semibold text-white text-sm">Research Notes</h4>
                            <p className="text-white/70 font-inter leading-relaxed text-xs">
                              {selectedContactForResearch.research}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl">
                      <CardHeader className="p-6">
                        <CardTitle className="text-lg font-space-grotesk text-white flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-secondary" />
                          Communication Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-4 rounded-lg">
                            <div className="text-2xl mb-2">📧</div>
                            <div className="font-space-grotesk font-semibold text-white text-sm">Email</div>
                            <div className="text-white/70 font-inter text-xs">Preferred for detailed proposals</div>
                          </div>
                          <div className="text-center p-4 rounded-lg">
                            <div className="text-2xl mb-2">📞</div>
                            <div className="font-space-grotesk font-semibold text-white text-sm">Phone</div>
                            <div className="text-white/70 font-inter text-xs">Best for urgent matters</div>
                          </div>
                          <div className="text-center p-4 rounded-lg">
                            <div className="text-2xl mb-2">🤝</div>
                            <div className="font-space-grotesk font-semibold text-white text-sm">In-Person</div>
                            <div className="text-white/70 font-inter text-xs">Final decision meetings</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-6">
                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl">
                      <CardHeader className="p-6">
                        <CardTitle className="text-lg font-space-grotesk text-white flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Recent Activity Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex gap-4 p-4 rounded-lg border-l-4 border-primary">
                            <div className="text-white/70 font-inter text-xs min-w-[80px] flex-shrink-0">2 hours ago</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-space-grotesk font-semibold text-white text-sm">Viewed pricing page</div>
                              <div className="text-white/70 font-inter text-xs">Spent 3.5 minutes on enterprise pricing section</div>
                            </div>
                          </div>
                          <div className="flex gap-4 p-4 rounded-lg border-l-4 border-secondary">
                            <div className="text-white/70 font-inter text-xs min-w-[80px] flex-shrink-0">1 day ago</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-space-grotesk font-semibold text-white text-sm">LinkedIn activity</div>
                              <div className="text-white/70 font-inter text-xs">{selectedContactForResearch.recentActivity}</div>
                            </div>
                          </div>
                          <div className="flex gap-4 p-4 rounded-lg border-l-4 border-accent">
                            <div className="text-white/70 font-inter text-xs min-w-[80px] flex-shrink-0">3 days ago</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-space-grotesk font-semibold text-white text-sm">Email engagement</div>
                              <div className="text-white/70 font-inter text-xs">Opened and clicked link in follow-up email</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6">
                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-space-grotesk text-white flex items-center gap-2">
                          <Zap className="w-5 h-5 text-primary" />
                          AI-Generated Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="font-space-grotesk font-semibold text-white">High Purchase Intent</span>
                          </div>
                          <p className="text-white/70 font-inter text-sm">Based on recent engagement patterns, this contact shows 87% likelihood to purchase within the next 30 days.</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            <span className="font-space-grotesk font-semibold text-white">Decision Timeline</span>
                          </div>
                          <p className="text-white/70 font-inter text-sm">Analysis suggests they're in evaluation phase. Optimal time for proposal is within 2-3 weeks.</p>
                        </div>
                        <div className="p-4 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-lg border border-secondary/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-secondary rounded-full"></div>
                            <span className="font-space-grotesk font-semibold text-white">Influence Network</span>
                          </div>
                          <p className="text-white/70 font-inter text-sm">Connected to 3 other decision makers in our pipeline. Cross-referencing opportunities detected.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="strategy" className="space-y-6">
                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-space-grotesk text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-primary" />
                          Recommended Engagement Strategy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h4 className="font-space-grotesk font-semibold text-white">Next Best Actions</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 p-3 rounded-lg">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                                <span className="text-white/70 font-inter">Send personalized ROI calculator</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg">
                                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                                <span className="text-white/70 font-inter">Schedule technical demo</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 rounded-lg">
                                <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                                <span className="text-white/70 font-inter">Follow up with case study</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="font-space-grotesk font-semibold text-white">Timing Recommendations</h4>
                            <div className="space-y-2">
                              <div className="p-3 rounded-lg">
                                <div className="text-white font-inter text-sm">Best Contact Time</div>
                                <div className="text-white/70 font-inter text-xs">Tuesday-Thursday, 10AM-2PM PST</div>
                              </div>
                              <div className="p-3 rounded-lg">
                                <div className="text-white font-inter text-sm">Email Response Rate</div>
                                <div className="text-white/70 font-inter text-xs">Highest on Wednesday mornings</div>
                              </div>
                              <div className="p-3 rounded-lg">
                                <div className="text-white font-inter text-sm">Decision Window</div>
                                <div className="text-white/70 font-inter text-xs">Q1 budget planning season</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-transparent border-transparent backdrop-blur-sm rounded-2xl sm:rounded-3xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-space-grotesk text-foreground flex items-center gap-2">
                          <FileText className="w-5 h-5 text-secondary" />
                          Personalized Message Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg border border-primary/20">
                            <div className="font-space-grotesk font-semibold text-foreground mb-2">Cold Email - AI Generated</div>
                            <div className="text-muted-foreground font-inter text-sm bg-background/50 p-3 rounded border border-primary/10 whitespace-pre-wrap">
                              Hi {selectedContactForResearch.name},<br/><br/>
                              I noticed your recent activity: {selectedContactForResearch.recentActivity}. This really caught my attention as it aligns with what we're doing at our company.<br/><br/>
                              Based on your role as {selectedContactForResearch.role}, I thought you might be interested in learning how we've helped similar leaders achieve their goals. Our solutions have helped companies scale more efficiently while reducing costs significantly.<br/><br/>
                              Would you be open to a quick 15-minute conversation this week to explore if there's a fit?<br/><br/>
                              Best regards
                            </div>
                          </div>
                          <div className="p-4 rounded-lg border border-primary/20">
                            <div className="font-space-grotesk font-semibold text-foreground mb-2">LinkedIn Message Template</div>
                            <div className="text-muted-foreground font-inter text-sm bg-background/50 p-3 rounded border border-primary/10">
                              Saw your activity: {selectedContactForResearch.recentActivity}. Really insightful! We've helped similar leaders with these exact challenges. Worth a quick chat?
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Draft Modal */}
      <Dialog open={showEmailDraftModal} onOpenChange={setShowEmailDraftModal}>
        <DialogContent className="w-[90vw] max-h-[85vh] sm:w-[85vw] md:w-[75vw] lg:max-w-4xl sm:max-h-[90vh] overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[32px] p-4 sm:p-6 [&>button]:hidden">
          <DialogDescription className="sr-only">
            Email draft composition and personalization modal
          </DialogDescription>
          {/* Close Button */}
          <button
            onClick={() => setShowEmailDraftModal(false)}
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-50 rounded-full bg-white/10 hover:bg-white/20 p-2 transition-colors !block"
          >
            <X className="h-4 w-4 text-white" />
          </button>

          {/* Ambient gradient background */}
          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-[48px] overflow-hidden pointer-events-none ${
            isDarkMode ? 'bg-[#0A0E12]' : 'bg-gradient-to-br from-slate-50 to-blue-50'
          }`}>
            {isDarkMode && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E78FF]/5 via-transparent to-[#00C8FF]/5"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1E78FF]/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00C8FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#1E78FF]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              </>
            )}
          </div>

          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-space-grotesk font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                Draft Cold Email
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-inter">
                Compose a personalized cold email using AI-generated insights from the contact's research and recent activity.
              </DialogDescription>
            </DialogHeader>
          
            {selectedContactForEmail && (
              <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[60vh] pr-2">
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 border border-primary/20 backdrop-blur-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-space-grotesk font-bold text-white">
                        {selectedContactForEmail.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-space-grotesk font-bold text-foreground">{selectedContactForEmail.name}</h3>
                      <p className="text-sm text-muted-foreground font-inter">{selectedContactForEmail.role}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold text-white font-space-grotesk mb-2 block">To:</label>
                    <input 
                      type="email" 
                      value={selectedContactForEmail.email}
                      readOnly
                      className="w-full px-4 py-2 bg-[#0A0E12]/80 border border-primary/20 rounded-lg text-white font-inter text-sm backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white font-space-grotesk mb-2 block">Subject:</label>
                    <input 
                      type="text" 
                      defaultValue={`Quick question about ${selectedContactForEmail.recentActivity?.split(',')[0] || 'your recent work'}`}
                      className="w-full px-4 py-2 bg-[#0A0E12]/80 border border-primary/20 rounded-lg text-white font-inter text-sm backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white font-space-grotesk mb-2 block">Message:</label>
                    <textarea 
                      rows={12}
                      defaultValue={`Hi ${selectedContactForEmail.name},

I noticed your recent activity: ${selectedContactForEmail.recentActivity}. This really caught my attention as it aligns with what we're doing at our company.

Based on your role as ${selectedContactForEmail.role}, I thought you might be interested in learning how we've helped similar leaders achieve their goals. Our solutions have helped companies scale more efficiently while reducing costs significantly.

${selectedContactForEmail.research.includes('efficiency') || selectedContactForEmail.research.includes('scaling') || selectedContactForEmail.research.includes('growth') ? 'Given your focus on growth and efficiency, I believe there could be a strong fit here.' : 'I\'d love to share some insights that could be valuable for your work.'}

Would you be open to a quick 15-minute conversation this week to explore if there's a mutual fit?

Best regards`}
                      className="w-full px-4 py-3 bg-[#0A0E12]/80 border border-primary/20 rounded-lg text-white font-inter text-sm leading-relaxed resize-none backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-primary/20">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-space-grotesk"
                    onClick={() => {
                      setShowEmailDraftModal(false);
                      // In real implementation, this would send the email
                    }}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowEmailDraftModal(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Voice Chat Interface */}
      <VoiceChatInterface 
        isOpen={!isDashboardMode && !showPipeline && !isSearchingCompanies}
        onClose={() => {
          // Can't close in voice mode, must switch to dashboard or pipeline
        }}
        isDarkMode={isDarkMode}
        onConversationComplete={handleConversationComplete}
      />

      {/* Debug Panel - Development Only */}
      {process.env.NODE_ENV === 'development' && showPipeline && (
        <div className="fixed bottom-4 right-4 bg-black/90 p-4 rounded-lg text-xs text-white space-y-1 z-50 font-mono border border-white/20">
          <div className="font-bold mb-2 text-secondary">API Debug Panel</div>
          <div>API Companies: <span className="text-green-400">{apiCompanies.length}</span></div>
          <div>Loading: <span className={companiesApi.isLoading ? 'text-yellow-400' : 'text-green-400'}>{companiesApi.isLoading ? 'Yes' : 'No'}</span></div>
          <div>Error: <span className={companiesApi.error ? 'text-red-400' : 'text-green-400'}>{companiesApi.error || 'None'}</span></div>
          <div>Used Mock: <span className={companiesApi.usedMock ? 'text-yellow-400' : 'text-green-400'}>{companiesApi.usedMock ? 'Yes' : 'No'}</span></div>
          <div>Response Count: <span className="text-blue-400">{companiesApi.responseCount}</span></div>
        </div>
      )}
    </div>
  );
};

export default SquadPage;