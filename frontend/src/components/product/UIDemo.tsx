
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, BarChart3, Settings, MessageSquare, Calendar } from "lucide-react";

const UIDemo = () => {
  const dashboardFeatures = [
    {
      icon: Monitor,
      title: "Agent Management Dashboard",
      description: "Control all your AI agents from one central location",
      preview: "Real-time agent status, performance metrics, and quick controls"
    },
    {
      icon: Settings,
      title: "Persona Builder Interface",
      description: "Drag-and-drop interface for creating custom AI personalities",
      preview: "Visual personality editor with voice and avatar selection"
    },
    {
      icon: MessageSquare,
      title: "Multi-Channel Outreach Builder",
      description: "Design complex outreach sequences across email, SMS, and chat",
      preview: "Visual workflow builder with conditional logic"
    },
    {
      icon: Calendar,
      title: "Prospect Interaction Widgets",
      description: "Embeddable widgets for prospect engagement",
      preview: "Avatar video landing pages and interactive chatbots"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Comprehensive insights into your AI sales performance",
      preview: "Real-time dashboards with conversion tracking"
    },
    {
      icon: Smartphone,
      title: "Mobile Management",
      description: "Manage your AI agents on the go",
      preview: "Full-featured mobile app for iOS and Android"
    }
  ];

  return null;
};

export default UIDemo;
