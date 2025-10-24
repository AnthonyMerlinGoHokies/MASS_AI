import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import colorfulLogo from "@/assets/colorful-logo.png";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import WaitlistModal from "./WaitlistModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location.pathname !== '/') {
      navigate('/', { replace: true });
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleWaitlistCTA = () => {
    setIsWaitlistModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/20 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Zone - Logo */}
            <div className="flex items-center">
              <img 
                src={colorfulLogo}
                alt="SIOS Logo"
                onClick={() => navigate('/')}
                className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity duration-300"
              />
            </div>
            
            {/* Right Zone - Dropdown Menu (Desktop) */}
            <div className="hidden md:flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:text-ai-cyan hover:bg-white/10 transition-all duration-300"
                    aria-label="Open menu"
                  >
                    <Menu size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[28rem] bg-black/95 backdrop-blur-md border-white/20 z-[60]"
                >
                  <DropdownMenuItem
                    onClick={() => handleNavigation('/auth')}
                    className="text-white hover:text-ai-cyan hover:bg-white/10 cursor-pointer font-space-grotesk transition-colors duration-300 text-lg py-4 px-6"
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleWaitlistCTA}
                    className="text-ai-cyan hover:text-ai-cyan hover:bg-white/10 cursor-pointer font-space-grotesk font-semibold transition-colors duration-300 text-lg py-4 px-6"
                  >
                    Get Early Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile - Hamburger Menu */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <button 
                    className="min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-white/10 transition-colors duration-300 flex items-center justify-center touch-manipulation"
                    aria-label="Open navigation menu"
                    aria-expanded={isMenuOpen}
                    aria-controls="mobile-menu"
                  >
                    <Menu size={24} className="text-white" />
                  </button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-80 bg-black border-l border-white/20"
                  id="mobile-menu"
                  aria-labelledby="mobile-menu-title"
                >
                  <div className="flex flex-col h-full">
                    <h2 id="mobile-menu-title" className="sr-only">Navigation Menu</h2>
                    
                    {/* Mobile Navigation Links */}
                    <nav className="flex flex-col space-y-2 mt-8" role="navigation" aria-label="Main navigation">
                      <button
                        onClick={() => handleNavigation('/squad')}
                        className="text-white hover:text-ai-cyan transition-colors duration-300 font-medium text-lg py-3 px-2 text-left font-inter min-h-[44px] rounded-md hover:bg-white/5 touch-manipulation"
                        aria-label="Navigate to Squad page"
                      >
                        Squad
                      </button>
                    </nav>
                    
                    {/* Mobile CTAs - Pinned at Bottom */}
                    <div className="mt-auto mb-6 space-y-4">
                      <Button 
                        onClick={() => handleNavigation('/auth')}
                        variant="outline"
                        size="lg"
                        className="border-white text-white hover:bg-white hover:text-black font-semibold px-6 py-3 rounded-full w-full transition-all duration-300 font-space-grotesk touch-manipulation"
                        aria-label="Sign in to your account"
                      >
                        Sign In
                      </Button>
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-ai-cyan to-ai-purple hover:from-ai-cyan/90 hover:to-ai-purple/90 text-white font-semibold px-6 py-3 rounded-full w-full transition-all duration-300 hover:scale-105 font-space-grotesk touch-manipulation"
                        onClick={handleWaitlistCTA}
                        aria-label="Get early access to SIOS"
                      >
                        Get Early Access
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <WaitlistModal 
        open={isWaitlistModalOpen} 
        onOpenChange={setIsWaitlistModalOpen} 
      />
    </>
  );
};

export default Header;
