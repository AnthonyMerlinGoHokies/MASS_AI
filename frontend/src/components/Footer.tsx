import { Mail, Phone, MapPin, X, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WaitlistModal from "./WaitlistModal";
const Footer = () => {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const navigate = useNavigate();
  return <>
      <footer className="text-white" style={{ backgroundColor: '#0A0E12' }}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12">
          
          {/* Branding Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] bg-clip-text text-transparent font-space-grotesk">
                SIOS
              </h3>
              <div className="space-y-2 text-sm font-inter" style={{ color: '#B9C5D1' }}>
                <p>© 2025 SIOS</p>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-1 flex-shrink-0" style={{ color: '#00C8FF' }} />
                  <span className="leading-relaxed">
                    650 Enterprise Blvd<br />
                    Suite 4209<br />
                    Charleston, SC 29492
                  </span>
                </div>
              </div>
              {/* B-Corp Badge Placeholder */}
              
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-space-grotesk" style={{ color: '#00C8FF' }}>Product</h4>
            <ul className="space-y-3 text-sm font-inter" style={{ color: '#B9C5D1' }}>
              <li><button onClick={() => navigate('/squad')} className="hover:text-ai-cyan transition-colors hover:underline text-left">Squad</button></li>
              <li><a href="#" className="hover:text-ai-cyan transition-colors hover:underline">Changelog</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-space-grotesk" style={{ color: '#1E78FF' }}>Resources</h4>
            <ul className="space-y-3 text-sm font-inter" style={{ color: '#B9C5D1' }}>
              <li><a href="#" className="hover:text-ai-purple transition-colors hover:underline">Blog</a></li>
              <li><a href="#" className="hover:text-ai-purple transition-colors hover:underline">Help Center</a></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-space-grotesk" style={{ color: '#00C8FF' }}>Company</h4>
            <ul className="space-y-3 text-sm font-inter" style={{ color: '#B9C5D1' }}>
              <li><a href="#" className="hover:text-ai-cyan transition-colors hover:underline">Careers</a></li>
              <li><a href="#" className="hover:text-ai-cyan transition-colors hover:underline">Press</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-space-grotesk" style={{ color: '#E6EDF4' }}>Legal</h4>
            <ul className="space-y-3 text-sm font-inter" style={{ color: '#B9C5D1' }}>
              <li><a href="#" className="hover:text-white transition-colors hover:underline">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:underline">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors hover:underline">DPA</a></li>
            </ul>
          </div>

          {/* Social Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h4 className="text-lg font-semibold mb-4 font-space-grotesk" style={{ color: '#00C8FF' }}>Social</h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="p-2 rounded-lg transition-colors" style={{ backgroundColor: '#1E78FF30' }}>
                <X size={16} style={{ color: '#00C8FF' }} />
              </a>
              <a href="#" className="p-2 rounded-lg transition-colors" style={{ backgroundColor: '#00C8FF30' }}>
                <Linkedin size={16} style={{ color: '#1E78FF' }} />
              </a>
              <a href="#" className="p-2 rounded-lg transition-colors" style={{ backgroundColor: '#1E78FF30' }}>
                <Youtube size={16} style={{ color: '#00C8FF' }} />
              </a>
            </div>
            
            {/* CTA for lazy decision-makers */}
            <Button onClick={() => setIsWaitlistOpen(true)} className="w-full bg-gradient-to-r from-[#1E78FF] to-[#00C8FF] text-white hover:from-[#1E78FF]/90 hover:to-[#00C8FF]/90 font-semibold font-space-grotesk">
              Get Early Access
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: '#3A4656' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-inter" style={{ color: '#6F8091' }}>
              Sales Intelligence Operating System
            </div>
            <div className="text-sm text-center md:text-right font-inter" style={{ color: '#B9C5D1' }}>
              Ready to scale your business? <a href="#contact" className="hover:underline font-medium" style={{ color: '#00C8FF' }}>Get started today</a>
            </div>
          </div>
        </div>
      </div>
      </footer>

      <WaitlistModal open={isWaitlistOpen} onOpenChange={setIsWaitlistOpen} />
    </>;
};
export default Footer;