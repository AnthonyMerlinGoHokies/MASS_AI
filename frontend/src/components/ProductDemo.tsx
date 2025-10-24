import { useState, useEffect } from "react";
import { Plus, Mic, AudioWaveform } from "lucide-react";
const ProductDemo = () => {
  const [typedText, setTypedText] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const examples = ["Create a campaign for my Ideal Customer Profile", "Pull up the research report on ABC Corp", "Draft an email to TechCorp", "Find me 100+ leads in the enterprise SaaS space", "Schedule follow-ups with all warm leads", "Analyze sentiment from recent customer conversations"];
  const currentExample = examples[currentExampleIndex];
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (typedText.length < currentExample.length) {
      timeout = setTimeout(() => {
        setTypedText(currentExample.slice(0, typedText.length + 1));
      }, 50);
    } else {
      // Wait a moment, then move to next example
      timeout = setTimeout(() => {
        setTypedText("");
        setCurrentExampleIndex(prev => (prev + 1) % examples.length);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [typedText, currentExample, examples.length]);
  return <div className="w-full h-full flex items-center justify-center p-8">
      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl px-4 animate-fade-in">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light mb-8 text-white">Your complete sales operating system</h1>

        {/* Input bar */}
        <div className="w-full max-w-3xl rounded-full shadow-2xl border transition-all duration-300 bg-white/5 border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-6 py-4">
            {/* Plus button */}
            <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
              <Plus className="h-6 w-6" />
            </button>

            {/* Input with typing animation */}
            <div className="flex-1 text-lg text-white">
              {typedText}
              <span className="inline-block w-0.5 h-6 ml-1 animate-pulse" style={{
              backgroundColor: '#00C8FF'
            }}></span>
            </div>

            {/* Microphone button */}
            <button className="flex-shrink-0 transition-all duration-300 text-white/60 hover:text-white">
              <Mic className="h-6 w-6" />
            </button>

            {/* Audio waveform button */}
            <button className="flex-shrink-0 transition-colors text-white/60 hover:text-white">
              <AudioWaveform className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>;
};
export default ProductDemo;