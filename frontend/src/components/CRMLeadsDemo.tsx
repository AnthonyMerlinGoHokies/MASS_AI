import { useState, useEffect, useRef } from "react";
import { Building2, Mail, Phone, MapPin, TrendingUp, Users, Sparkles, Plus, Mic, AudioWaveform } from "lucide-react";
import { useCompanies } from "@/hooks/useCompanies";
import { useLeads } from "@/hooks/useLeads";
import { Company, Lead as APILead } from "@/lib/api";

interface Lead {
  id: number;
  company: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
  score: number;
  industry: string;
}
const generateLeads = (count: number): Lead[] => {
  const companies = ["CloudSync Technologies", "DataFlow Solutions", "NexGen Analytics", "StreamLine Apps", "Velocity Platform", "Quantum Insights", "Apex Systems", "Fusion Tech", "Catalyst Labs", "Horizon Digital", "Vertex Solutions", "Pulse Analytics", "Nova Systems", "Zenith Cloud", "Prism Technologies", "Echo Platform", "Stellar Apps", "Beacon Software", "Orbit Systems", "Summit Solutions", "Nexus Digital", "Vortex Labs", "Atlas Platform", "Cosmos Tech", "Phoenix Systems", "Titan Solutions", "Aurora Apps", "Eclipse Software", "Gravity Labs", "Matrix Platform", "Quantum Labs", "Infinity Systems", "Nebula Tech", "Pinnacle Solutions", "Spectrum Apps", "Unity Platform", "Vector Labs", "Wavelength Systems", "Axiom Tech", "Cipher Solutions", "Delta Apps", "Ember Software", "Flux Labs", "Genesis Platform", "Helix Systems", "Ion Tech", "Keystone Solutions", "Lunar Apps", "Momentum Software", "Nucleus Labs", "Onyx Platform"];
  const firstNames = ["Sarah", "Michael", "Emily", "David", "Jessica", "James", "Lisa", "Robert", "Jennifer", "William", "Amanda", "Christopher", "Michelle", "Daniel", "Ashley", "Matthew"];
  const lastNames = ["Chen", "Rodriguez", "Thompson", "Park", "Martinez", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson"];
  return Array.from({
    length: count
  }, (_, i) => ({
    id: i + 1,
    company: companies[i % companies.length],
    contact: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[i % lastNames.length].toLowerCase()}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1 (415) 555-${String(Math.floor(1000 + Math.random() * 9000))}`,
    location: "San Francisco, CA",
    score: Math.floor(80 + Math.random() * 20),
    industry: "SaaS"
  }));
};
const CRMLeadsDemo = () => {
  const [typedText, setTypedText] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [showingLeads, setShowingLeads] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const fullQuery = "Find me 50 SaaS companies in San Francisco with 10-50 employees, annual revenue over $1M, and active hiring";
  const mockLeads = generateLeads(50);

  // Use the new API hooks
  const companies = useCompanies();
  const leadsApi = useLeads();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);
  useEffect(() => {
    if (!isVisible) return;

    // Typing animation
    if (typedText.length < fullQuery.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullQuery.slice(0, typedText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      
      // Hide chat interface before showing leads
      const hideChatTimeout = setTimeout(() => {
        setShowChat(false);
        setShowingLeads(true);
      }, 500);

      // Start adding leads after chat is hidden
      const leadsTimeout = setTimeout(() => {
        mockLeads.forEach((lead, index) => {
          setTimeout(() => {
            setLeads(prev => [...prev, lead]);
          }, index * 80);
        });
      }, 1000);

      // Reset after all leads are shown
      const resetTimeout = setTimeout(() => {
        setShowChat(true);
        setTypedText("");
        setLeads([]);
        setIsTyping(true);
        setShowingLeads(false);
        setIsVisible(false);
      }, mockLeads.length * 80 + 5000);
      return () => {
        clearTimeout(hideChatTimeout);
        clearTimeout(leadsTimeout);
        clearTimeout(resetTimeout);
      };
    }
  }, [typedText, isVisible]);
  return <section ref={sectionRef} className="py-20 px-4 relative overflow-hidden" style={{
    backgroundColor: '#0A0E12'
  }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-12">
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Watch Your Pipeline Fill In Real-Time</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Type your ideal customer profile and watch as qualified leads populate your pipeline instantly
          </p>
        </div>

        {/* Single bubble container */}
        <div className="bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Chat Interface styled like ProductDemo */}
          {showChat && <div className="p-8 border-b border-white/10 animate-fade-in">
            <div className="max-w-3xl mx-auto rounded-full bg-white/5 border-white/10 backdrop-blur-xl border">
              <div className="flex items-center gap-3 px-6 py-4">
                <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                  <Plus className="h-6 w-6" />
                </button>

                <div className="flex-1 text-lg text-white">
                  {typedText}
                  {isTyping && <span className="inline-block w-0.5 h-6 ml-1 animate-pulse" style={{
                  backgroundColor: '#00C8FF'
                }} />}
                </div>

                <button className="flex-shrink-0 transition-all duration-300 text-white/60 hover:text-white">
                  <Mic className="h-6 w-6" />
                </button>

                <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                  <AudioWaveform className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {showingLeads && !showChat && <div className="mt-6 text-center animate-fade-in">
                <p className="text-sm text-primary">
                  ✓ Found {mockLeads.length} qualified leads • Adding to your pipeline...
                </p>
              </div>}
          </div>}

          {/* CRM Results */}
          {showingLeads && <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Your Pipeline
              </h3>
              <span className="text-sm text-gray-400">{leads.length} / {mockLeads.length} leads</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2">
              {leads.length === 0 ? <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">Waiting for leads...</p>
                </div> : leads.map((lead, index) => <div key={lead.id} className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/50 animate-fade-in">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm truncate">
                          {lead.company}
                        </h4>
                        <p className="text-xs text-gray-400 truncate">{lead.contact}</p>
                      </div>
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-500/20 border border-green-500/30 ml-2">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-semibold">{lead.score}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{lead.phone}</span>
                      </div>
                    </div>
                  </div>)}
            </div>
          </div>}
        </div>
      </div>
    </section>;
};
export default CRMLeadsDemo;