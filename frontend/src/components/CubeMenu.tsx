import { Canvas } from '@react-three/fiber';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { Card } from './ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CubeMenuProps {
  isDarkMode: boolean;
  isDashboardMode: boolean;
  isPipelineMode?: boolean;
  onClosePipeline?: () => void;
  isVoicePage?: boolean;
  isStandalonePage?: boolean;
}

interface MenuItem {
  label: string;
  path?: string;
  onClick?: () => void;
  hideOnVoicePage?: boolean;
  hideOnPipeline?: boolean;
  hideOnDashboard?: boolean;
}

function DotCube({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  // Create 9 dots in a 3x3 pattern
  const dots = [];
  const spacing = 0.6;
  const offset = -spacing;

  // Create 3x3 grid of dots
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      dots.push(
        <mesh
          key={`dot-${x}-${y}`}
          position={[offset + x * spacing, offset + y * spacing, 0]}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color="#FFFFFF"
            metalness={0.1}
            roughness={0.3}
            emissive="#FFFFFF"
            emissiveIntensity={0.2}
          />
        </mesh>
      );
    }
  }

  return (
    <group
      ref={groupRef}
      onClick={onClick}
      rotation={[0, 0, 0]}
      scale={isOpen ? 1.3 : 1}
    >
      {dots}
    </group>
  );
}

export const CubeMenu = ({ isDarkMode, isDashboardMode, isPipelineMode, onClosePipeline, isVoicePage, isStandalonePage }: CubeMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Different menu items for standalone pages (like day-streak)
  const standaloneMenuItems: MenuItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Squad', path: '/squad' },
    { label: 'Sign Out', onClick: handleSignOut }
  ];

  const allMenuItems: MenuItem[] = [
    { label: 'Home', onClick: () => window.dispatchEvent(new CustomEvent('showVoicePage')), hideOnVoicePage: true },
    { label: 'Inbox', path: '/inbox', hideOnPipeline: false },
    { label: 'My Account', path: '/account', hideOnPipeline: false },
    { label: 'Settings', path: '/settings', hideOnPipeline: false },
    { label: 'Support', path: '/support', hideOnPipeline: false },
    { label: 'Pipeline', onClick: () => window.dispatchEvent(new CustomEvent('showPipeline')), hideOnPipeline: true },
    { label: 'Dashboard', onClick: () => window.dispatchEvent(new CustomEvent('showDashboard')), hideOnDashboard: true, hideOnPipeline: false },
    { label: 'Sign Out', onClick: handleSignOut }
  ];

  // Use standalone menu items if on standalone page
  const baseMenuItems = isStandalonePage ? standaloneMenuItems : allMenuItems;

  // Filter menu items based on mode
  const menuItems = baseMenuItems.filter(item => {
    // Hide items that should only show on voice page
    if (isVoicePage && item.hideOnVoicePage) {
      return false;
    }
    if (isPipelineMode) {
      return !item.hideOnPipeline;
    }
    if (isDashboardMode) {
      return !item.hideOnDashboard;
    }
    return true;
  });

  const handleMenuClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      navigate(item.path);
    }
    setIsOpen(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* 3D Dot Cube Button */}
      <div 
        className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform"
      >
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} intensity={1} />
          <pointLight position={[-2, -2, -2]} intensity={0.5} />
          <DotCube onClick={() => {}} isOpen={isOpen} />
        </Canvas>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <Card className={`absolute top-full right-0 mt-2 w-48 z-50 animate-fade-in shadow-xl ${
          isDarkMode 
            ? 'bg-black/95 border-white/20 backdrop-blur-xl' 
            : 'bg-white border-ai-cyan/30 backdrop-blur-xl'
        }`}>
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                className={`w-full px-4 py-3 text-left text-sm font-inter transition-colors ${
                  isDarkMode
                    ? 'text-white hover:bg-white/10'
                    : 'text-ai-midnight hover:bg-ai-cyan/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
