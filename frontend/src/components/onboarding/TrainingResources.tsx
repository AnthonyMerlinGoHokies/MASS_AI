
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Video, MessageSquare } from "lucide-react";

interface TrainingResourcesProps {
  onComplete: () => void;
}

const TrainingResources = ({ onComplete }: TrainingResourcesProps) => {
  const tutorials = [
    {
      id: "getting-started",
      title: "Getting Started with SIOS",
      type: "video",
      duration: "5:32",
      description: "Learn the basics of navigating the platform and setting up your first campaign.",
      icon: Video
    },
    {
      id: "ai-agents",
      title: "Understanding AI Agent Roles",
      type: "article",
      duration: "4 min read",
      description: "Dive deeper into each AI agent's capabilities and how they work together.",
      icon: FileText
    },
    {
      id: "campaign-setup",
      title: "Creating Your First Campaign",
      type: "video",
      duration: "8:15",
      description: "Step-by-step walkthrough of setting up a complete outreach campaign.",
      icon: Video
    },
    {
      id: "integration",
      title: "CRM Integration Guide",
      type: "article",
      duration: "6 min read",
      description: "How to connect and sync with your existing CRM system.",
      icon: FileText
    }
  ];
  
  const faqItems = [
    {
      question: "How do AI agents decide who to contact?",
      answer: "AI agents use your defined ideal customer profile and lead scoring criteria to prioritize prospects. You can adjust these settings in the Campaign Commander dashboard."
    },
    {
      question: "Can I customize agent personalities?",
      answer: "Yes! You can customize the tone, style, and approach of each agent through the Persona Builder in your settings. This lets you align agent communication with your brand voice."
    },
    {
      question: "How do I track campaign performance?",
      answer: "The Oracle dashboard provides real-time analytics on all campaign metrics. You can customize which KPIs to track and set up automated reports."
    },
    {
      question: "What happens when a prospect responds?",
      answer: "The Engagement Team handles all responses automatically. For complex inquiries, you'll be notified to step in, or you can configure the system to schedule a meeting directly."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">Training Resources</h2>
          <p className="text-muted-foreground">Everything you need to become a SIOS expert</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Search resources..." className="pl-10" />
      </div>

      <Tabs defaultValue="tutorials" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="tutorials">Tutorials & Guides</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutorials" className="mt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center">
                      <tutorial.icon className="h-4 w-4 mr-2 text-ai-cyan" />
                      {tutorial.title}
                    </CardTitle>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-muted-foreground">
                      {tutorial.duration}
                    </span>
                  </div>
                  <CardDescription>{tutorial.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t bg-muted/50">
                  <Button variant="link" className="p-0 h-auto text-ai-cyan">
                    {tutorial.type === "video" ? "Watch Video" : "Read Article"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline">View All Resources</Button>
          </div>
        </TabsContent>
        
        <TabsContent value="faq" className="mt-0 space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2 text-ai-cyan" />
                  {item.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{item.answer}</p>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center">
            <Button variant="outline">View Full FAQ</Button>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end mt-6">
        <Button onClick={onComplete}>Continue to Support Setup</Button>
      </div>
    </div>
  );
};

export default TrainingResources;
