
import { CheckCircle, Circle } from "lucide-react";

interface Step {
  id: string;
  label: string;
}

interface OnboardingProgressProps {
  steps: Step[];
  activeStep: string;
}

const OnboardingProgress = ({ steps, activeStep }: OnboardingProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = steps.findIndex(s => s.id === activeStep) > index;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* Step indicator */}
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  isActive 
                    ? "bg-ai-cyan/20 border-2 border-ai-cyan shadow-lg shadow-ai-cyan/20" 
                    : isCompleted
                      ? "bg-ai-cyan text-white" 
                      : "bg-gray-100 border border-gray-200"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 animate-scale-in" />
                ) : (
                  <Circle className={`h-5 w-5 ${isActive ? "text-ai-cyan" : "text-gray-400"}`} />
                )}
              </div>
              
              {/* Step label */}
              <span className={`text-xs text-center transition-colors duration-300 ${
                isActive ? "text-ai-cyan font-medium" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-5 w-full h-[2px] left-1/2">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isCompleted 
                        ? "bg-ai-cyan" 
                        : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
