import React, { useEffect } from 'react';

/**
 * Component that enhances the app with mobile accessibility features
 */
const AccessibilityEnhancements: React.FC = () => {
  useEffect(() => {
    // Announce page changes to screen readers
    const announcePageChange = () => {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.setAttribute('class', 'sr-only');
      announcement.textContent = `Page loaded: ${document.title}`;
      document.body.appendChild(announcement);
      
      // Remove the announcement after screen readers have processed it
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    };

    // Enhanced focus management for mobile
    const enhanceFocusManagement = () => {
      let focusableElements: NodeListOf<HTMLElement>;
      let firstElement: HTMLElement;
      let lastElement: HTMLElement;

      const updateFocusableElements = () => {
        focusableElements = document.querySelectorAll(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        firstElement = focusableElements[0];
        lastElement = focusableElements[focusableElements.length - 1];
      };

      const trapFocus = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        updateFocusableElements();

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      };

      // Only trap focus when a modal or important UI is open
      const handleFocusTrap = (event: KeyboardEvent) => {
        const modal = document.querySelector('[role="dialog"]');
        if (modal && modal.contains(document.activeElement)) {
          trapFocus(event);
        }
      };

      document.addEventListener('keydown', handleFocusTrap);
      
      return () => {
        document.removeEventListener('keydown', handleFocusTrap);
      };
    };

    // Skip to main content functionality
    const addSkipToMainContent = () => {
      const skipLink = document.querySelector('a[href="#main-content"]');
      if (skipLink) {
        skipLink.addEventListener('click', (e) => {
          e.preventDefault();
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    };

    // Enhance touch interactions
    const enhanceTouchInteractions = () => {
      // Add touch feedback to interactive elements
      const interactiveElements = document.querySelectorAll('button, [role="button"], a, input, select, textarea');
      
      interactiveElements.forEach(element => {
        element.addEventListener('touchstart', () => {
          element.classList.add('touch-active');
        });
        
        element.addEventListener('touchend', () => {
          setTimeout(() => {
            element.classList.remove('touch-active');
          }, 150);
        });
      });
    };

    // Initialize all enhancements
    announcePageChange();
    const cleanupFocus = enhanceFocusManagement();
    addSkipToMainContent();
    enhanceTouchInteractions();

    // Cleanup function
    return () => {
      cleanupFocus?.();
    };
  }, []);

  // Add CSS for touch feedback
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .touch-active {
        transform: scale(0.98);
        opacity: 0.8;
        transition: transform 0.1s ease, opacity 0.1s ease;
      }
      
      /* Enhanced focus styles for better visibility */
      .focus\\:ring-2:focus {
        box-shadow: 0 0 0 2px hsl(var(--primary)), 0 0 0 4px hsl(var(--primary) / 0.2);
      }
      
      /* Ensure interactive elements have sufficient spacing on mobile */
      @media (max-width: 768px) {
        button + button,
        .touchable + .touchable {
          margin-top: 12px;
        }
        
        /* Increase touch target size for small elements */
        input[type="checkbox"],
        input[type="radio"] {
          min-width: 20px;
          min-height: 20px;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default AccessibilityEnhancements;