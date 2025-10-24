import { useState, useEffect, useRef } from "react";
import { Mail, Plus, Mic, AudioWaveform, Sparkles } from "lucide-react";

interface EmailDraft {
  id: number;
  to: string;
  company: string;
  subject: string;
  preview: string;
  personalization: string;
}

const generateEmailDrafts = (): EmailDraft[] => {
  return [
    {
      id: 1,
      to: "sarah.chen@cloudsync.com",
      company: "CloudSync Technologies",
      subject: "Your team's data sync challenges - quick solution",
      preview: "Hi Sarah, I noticed CloudSync recently expanded to 3 new regions. Managing data consistency across...",
      personalization: "Recent expansion + hiring spike"
    },
    {
      id: 2,
      to: "michael.rodriguez@dataflow.com",
      company: "DataFlow Solutions",
      subject: "Re: Your pipeline bottleneck at scale",
      preview: "Michael, saw your team hit 10M API calls/day. That's the exact threshold where most companies...",
      personalization: "High API usage milestone"
    },
    {
      id: 3,
      to: "emily.park@nexgenanalytics.com",
      company: "NexGen Analytics",
      subject: "The analytics gap I noticed in your latest release",
      preview: "Emily, congrats on the 2.0 launch! One thing caught my attention - the real-time reporting...",
      personalization: "Product launch timing"
    },
    {
      id: 4,
      to: "david.thompson@streamline.com",
      company: "StreamLine Apps",
      subject: "How we helped 3 companies like StreamLine save 40% on infrastructure",
      preview: "David, I've been tracking StreamLine's growth (impressive trajectory). Companies at your stage...",
      personalization: "Growth trajectory analysis"
    },
    {
      id: 5,
      to: "jessica.martinez@velocity.com",
      company: "Velocity Platform",
      subject: "Your recent technical hire + what it signals",
      preview: "Jessica, saw you brought on a VP of Engineering from AWS. That usually means scaling prep...",
      personalization: "Key hire signal"
    }
  ];
};

const EmailOutreachDemo = () => {
  const [typedText, setTypedText] = useState("");
  const [emails, setEmails] = useState<EmailDraft[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showingEmails, setShowingEmails] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const fullQuery = "Start outreach campaign for the top 25% showing buying intent";
  const mockEmails = generateEmailDrafts();

  // Intersection Observer to trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            setIsTyping(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
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
      
      // Hide chat interface before showing emails
      const hideChatTimeout = setTimeout(() => {
        setShowChat(false);
        setShowingEmails(true);
      }, 500);

      // Start adding emails after chat is hidden
      const emailsTimeout = setTimeout(() => {
        mockEmails.forEach((email, index) => {
          setTimeout(() => {
            setEmails(prev => [...prev, email]);
          }, index * 300);
        });
      }, 1000);

      // Reset after all emails are shown
      const resetTimeout = setTimeout(() => {
        setShowChat(true);
        setTypedText("");
        setEmails([]);
        setIsTyping(true);
        setShowingEmails(false);
        setIsVisible(false);
      }, mockEmails.length * 300 + 5000);
      
      return () => {
        clearTimeout(hideChatTimeout);
        clearTimeout(emailsTimeout);
        clearTimeout(resetTimeout);
      };
    }
  }, [isVisible, typedText]);

  return (
    <div ref={containerRef} className="mb-16 max-w-5xl mx-auto">
      {/* Single bubble container */}
      <div className="bg-gray-900/30 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Chat Interface */}
        {showChat && (
          <div className="p-8 border-b border-white/10 animate-fade-in">
            <div className="max-w-3xl mx-auto rounded-full bg-white/5 border-white/10 backdrop-blur-xl border">
              <div className="flex items-center gap-3 px-6 py-4">
                <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                  <Plus className="h-6 w-6" />
                </button>

                <div className="flex-1 text-lg text-white">
                  {typedText}
                  {isTyping && (
                    <span 
                      className="inline-block w-0.5 h-6 ml-1 animate-pulse" 
                      style={{ backgroundColor: '#00C8FF' }}
                    />
                  )}
                </div>

                <button className="flex-shrink-0 transition-all duration-300 text-white/60 hover:text-white">
                  <Mic className="h-6 w-6" />
                </button>

                <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
                  <AudioWaveform className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {showingEmails && !showChat && (
              <div className="mt-6 text-center animate-fade-in">
                <p className="text-sm text-primary flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Drafting hyper-personalized emails for {mockEmails.length} high-intent prospects...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Email Drafts Display */}
        {showingEmails && (
          <div className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                AI-Drafted Emails
              </h3>
              <span className="text-sm text-gray-400">
                {emails.length} / {mockEmails.length} ready to send
              </span>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {emails.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-500">Drafting emails...</p>
                </div>
              ) : (
                emails.map((email) => (
                  <div 
                    key={email.id} 
                    className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-primary/30 transition-all animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                          <p className="text-sm text-gray-400 truncate">{email.to}</p>
                        </div>
                        <p className="text-xs text-gray-500">{email.company}</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/20 border border-primary/30 ml-2 flex-shrink-0">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span className="text-xs text-primary font-medium">AI</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">Subject:</p>
                        <p className="text-sm text-gray-300">{email.subject}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-400 italic leading-relaxed">
                          "{email.preview}"
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Personalization:</span>
                          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {email.personalization}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailOutreachDemo;
