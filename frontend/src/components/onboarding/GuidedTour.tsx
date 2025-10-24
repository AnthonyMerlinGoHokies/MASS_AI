
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle, Monitor, Bot, Calendar, MessageCircle, UserPlus } from "lucide-react";

interface GuidedTourProps {
  onComplete: () => void;
}

const GuidedTour = ({ onComplete }: GuidedTourProps) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      id: "dashboard",
      title: "Campaign Commander Dashboard",
      description: "Control all your AI agents from one central location. The Campaign Commander is your command center for orchestrating sales campaigns.",
      icon: Monitor,
      video: "https://placeholder.com/video-dashboard",
      cta: "Explore Dashboard"
    },
    {
      id: "agents",
      title: "AI Sales Agents",
      description: "Meet your specialized AI agents: Scout, Judge, Engagement Team, Archivist, Coordinator, and Oracle. Each one handles a specific part of your sales process.",
      icon: Bot,
      video: "https://placeholder.com/video-agents",
      cta: "Meet Your Agents"
    },
    {
      id: "scheduling",
      title: "Automated Scheduling",
      description: "Your AI automatically schedules meetings with prospects and adds them to your calendar. No more back-and-forth emails.",
      icon: Calendar,
      video: "https://placeholder.com/video-scheduling",
      cta: "Setup Calendar"
    },
    {
      id: "messaging",
      title: "Multi-Channel Messaging",
      description: "Engage prospects through email, SMS, chat, and video. Create personalized outreach sequences for maximum impact.",
      icon: MessageCircle,
      video: "https://placeholder.com/video-messaging",
      cta: "Configure Channels"
    },
    {
      id: "team",
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and collaborate on campaigns. Keep everyone in the loop with shared dashboards.",
      icon: UserPlus,
      video: "https://placeholder.com/video-team",
      cta: "Invite Team"
    }
  ];
  
  const feature = features[currentFeature];

  const nextFeature = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onComplete();
    }
  };

  const prevFeature = () => {
    if (currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
          <PlayCircle className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-space-grotesk">Guided Product Tour</h2>
          <p className="text-muted-foreground">Explore key features of the platform</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Feature {currentFeature + 1} of {features.length}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={prevFeature} disabled={currentFeature === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={nextFeature}>
            {currentFeature < features.length - 1 ? "Next" : "Complete Tour"}
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <div className="text-center p-8">
            <feature.icon className="h-16 w-16 mx-auto text-ai-purple opacity-50 mb-4" />
            <p className="text-muted-foreground">Video preview placeholder for {feature.title}</p>
            <Button variant="outline" className="mt-4">
              <PlayCircle className="h-4 w-4 mr-2" />
              Play Demo
            </Button>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle className="flex items-center">
            <feature.icon className="h-5 w-5 mr-2 text-ai-cyan" />
            {feature.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p>{feature.description}</p>
        </CardContent>
        
        <CardFooter className="border-t bg-muted/50 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {currentFeature + 1}/{features.length}: {feature.title}
          </div>
          <Button size="sm" variant="default">
            {feature.cta}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={prevFeature} disabled={currentFeature === 0}>
          Previous Feature
        </Button>
        <Button onClick={nextFeature}>
          {currentFeature < features.length - 1 ? "Next Feature" : "Complete Tour"}
        </Button>
      </div>
    </div>
  );
};

export default GuidedTour;
