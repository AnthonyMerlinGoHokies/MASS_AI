
import { Card, CardContent } from "@/components/ui/card";
import { Zap, GraduationCap, Heart } from "lucide-react";

const AIPersonas = () => {
  const personas = [
    {
      name: "Sparky",
      personality: "Energetic & Warm",
      icon: Zap,
      color: "bg-orange-500",
      description: "Perfect for initial outreach and building excitement about your product",
      traits: ["High energy", "Enthusiastic", "Motivational", "Friendly"],
      voiceStyle: "Upbeat and engaging",
      avatar: "Dynamic and animated"
    },
    {
      name: "Professor",
      personality: "Knowledgeable & Calm",
      icon: GraduationCap,
      color: "bg-blue-500",
      description: "Ideal for technical discussions and detailed product explanations",
      traits: ["Analytical", "Patient", "Thorough", "Authoritative"],
      voiceStyle: "Clear and measured",
      avatar: "Professional and trustworthy"
    },
    {
      name: "Empath",
      personality: "Kind & Understanding",
      icon: Heart,
      color: "bg-pink-500",
      description: "Excellent for handling concerns and building emotional connections",
      traits: ["Compassionate", "Active listener", "Supportive", "Reassuring"],
      voiceStyle: "Warm and caring",
      avatar: "Approachable and gentle"
    }
  ];

  return null;
};

export default AIPersonas;
