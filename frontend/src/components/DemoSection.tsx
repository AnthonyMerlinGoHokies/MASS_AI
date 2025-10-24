
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Play, X } from "lucide-react";

const DemoSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-24 bg-gradient-to-br from-flow-primary to-flow-primary/90 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-flow-accent/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-flow-secondary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black text-flow-neutral mb-6 leading-tight">
            See AI Sales Agents
            <br />
            <span className="bg-gradient-to-r from-flow-accent to-flow-secondary bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          
          <p className="text-xl text-flow-neutral/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Watch how our AI Sales Agent Swarm transforms a single lead into a qualified opportunity through intelligent automation.
          </p>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-flow-accent to-flow-secondary hover:from-flow-accent/90 hover:to-flow-secondary/90 text-flow-primary px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 border-0 relative overflow-hidden group"
              >
                <Play size={24} className="mr-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">Watch Live Demo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-flow-secondary to-flow-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-flow-primary border-flow-accent/20">
              <DialogDescription className="sr-only">
                AI Sales Agent Swarm demo video modal
              </DialogDescription>
              <DialogHeader className="absolute top-4 left-4 right-4 z-20 flex flex-row items-center justify-between bg-flow-primary/90 backdrop-blur-sm rounded-lg p-4">
                <DialogTitle className="text-flow-neutral font-bold text-xl">
                  AI Sales Agent Swarm Demo
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-flow-neutral hover:text-flow-accent"
                >
                  <X size={20} />
                </Button>
              </DialogHeader>
              
              <div className="w-full h-full pt-20">
                <iframe
                  src="/demo.html"
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen"
                  title="AI Sales Agent Swarm Demo"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
