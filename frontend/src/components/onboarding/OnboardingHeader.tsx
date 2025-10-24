
import { Link } from "react-router-dom";
import { ArrowLeft, User, HelpCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const OnboardingHeader = () => {
  return (
    <header className="backdrop-blur-md bg-background/50 border-b border-ai-cyan/10 py-4 px-6 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between max-w-5xl">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-ai-cyan transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Home</span>
          </Link>
          <div className="h-6 w-[1px] bg-border hidden md:block"></div>
          <h2 className="text-xl font-semibold hidden md:block text-ai-cyan">Client Onboarding</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Help</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-white/5">
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Button>
          
          <Button variant="outline" size="sm" className="border-ai-cyan/20 hover:border-ai-cyan text-foreground">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default OnboardingHeader;
