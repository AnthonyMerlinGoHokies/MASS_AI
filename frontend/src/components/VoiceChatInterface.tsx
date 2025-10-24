import { useState, useEffect, useRef } from "react";
import { Mic, Plus, AudioWaveform, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConversation } from "@/hooks/useConversation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Typing Indicator Component
const TypingIndicator = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <div className="flex justify-start">
    <div
      className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
        isDarkMode
          ? 'bg-white/10 text-white backdrop-blur-xl'
          : 'bg-white text-gray-900 border border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-current opacity-60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className={`text-sm ml-2 ${isDarkMode ? 'text-white/70' : 'text-gray-500'}`}>
          AI is thinking...
        </span>
      </div>
    </div>
  </div>
);

interface VoiceChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onConversationComplete?: (icpConfig: any, sessionId: string) => void;
}

const VoiceChatInterface = ({ isOpen, onClose, isDarkMode, onConversationComplete }: VoiceChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const conversation = useConversation();
  const hasShownCompletionToast = useRef(false);

  const conversationStarters = [
    "Start a campaign for my ICP",
    "Do deep research on Company ABC",
    "Draft an email to TechCorp 123",
    "Analyze competitor strategies",
    "Create a sales pitch deck",
    "Schedule follow-up reminders"
  ];

  const handleStarterClick = (starter: string) => {
    setInputValue(starter);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || conversation.isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    try {
      if (!conversation.conversationId) {
        // Reset toast flag for new conversation
        hasShownCompletionToast.current = false;
        // Start new conversation
        await conversation.startConversation({
          initial_text: message,
          mode: 'auto',
          max_turns: 5
        });
      } else {
        // Continue existing conversation
        await conversation.respondToConversation(message);
      }
    } catch (error) {
      console.error('Error in conversation:', error);
      // Error handling is done in the hook
    }
  };

  // Handle conversation completion
  useEffect(() => {
    if (conversation.isComplete && conversation.icpConfig && conversation.sessionId && onConversationComplete) {
      // Only show toast once per conversation
      if (!hasShownCompletionToast.current) {
        toast({
          title: "🎯 ICP Complete!",
          description: "Starting company search...",
          duration: 3000,
        });
        hasShownCompletionToast.current = true;
      }
      
      onConversationComplete(conversation.icpConfig, conversation.sessionId);
    }
  }, [conversation.isComplete, conversation.icpConfig, conversation.sessionId, onConversationComplete, toast]);

  const toggleVoiceListening = () => {
    setIsListening(!isListening);
    // Voice functionality will be added later
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Centered content */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-4xl px-4 pointer-events-auto">
        {/* Heading */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-light mb-8 ${isDarkMode ? 'text-white' : 'text-ai-midnight'}`}>
          Grow your pipeline now
        </h1>

        {/* Messages display */}
        {(conversation.messages.length > 0 || conversation.isAgentTyping) && (
          <div className="w-full max-w-3xl mb-6 max-h-96 overflow-y-auto px-4">
            <div className="space-y-4">
              {conversation.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 ${
                      message.role === 'user'
                        ? isDarkMode
                          ? 'bg-primary text-white'
                          : 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-white/10 text-white backdrop-blur-xl'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Show typing indicator when agent is responding */}
              {conversation.isAgentTyping && <TypingIndicator isDarkMode={isDarkMode} />}
            </div>
          </div>
        )}

        {/* Enhanced progress indicator with context-aware loading */}
        {conversation.conversationId && !conversation.isComplete && (
          <div className="w-full max-w-3xl mb-4 px-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                {conversation.isLoading ? (
                  conversation.currentState?.turn_count === 0 ? 'Analyzing your requirements...' :
                  conversation.currentState?.turn_count === 1 ? 'Gathering additional information...' :
                  conversation.currentState?.turn_count === 2 ? 'Processing your responses...' :
                  conversation.currentState?.turn_count === 3 ? 'Finalizing your ICP profile...' :
                  'Almost complete...'
                ) : (
                  `Progress: ${Math.round(conversation.progressPercentage)}%`
                )}
              </span>
              <span>Turn {conversation.currentState?.turn_count || 0}/5</span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-white/20' : 'bg-gray-200'}`}>
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${conversation.progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Enhanced input bar with better loading states */}
        <div className={`w-full max-w-3xl rounded-full shadow-2xl border transition-all duration-300 ${
          isDarkMode 
            ? 'bg-white/5 border-white/10 backdrop-blur-xl' 
            : 'bg-white border-gray-200'
        } ${conversation.isLoading ? 'opacity-75' : ''}`}>
          <div className="flex items-center gap-3 px-6 py-4">
            {/* Plus button */}
            <button
              onClick={onClose}
              className={`flex-shrink-0 transition-colors ${
                isDarkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Plus className="h-6 w-6" />
            </button>

            {/* Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !conversation.isLoading && inputValue.trim() && handleSendMessage()}
              placeholder={
                conversation.isComplete ? "Start a new conversation" : 
                conversation.isLoading ? "AI is thinking..." :
                "Ask anything"
              }
              disabled={conversation.isLoading}
              className={`flex-1 bg-transparent outline-none text-lg transition-all duration-300 ${
                isDarkMode 
                  ? 'text-white placeholder:text-white/40' 
                  : 'text-gray-900 placeholder:text-gray-400'
              } ${conversation.isLoading ? 'cursor-not-allowed' : ''}`}
            />

            {/* Send button with loading state */}
            <button
              onClick={handleSendMessage}
              disabled={conversation.isLoading || !inputValue.trim()}
              className={`flex-shrink-0 transition-all duration-300 ${
                conversation.isLoading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : inputValue.trim()
                    ? 'text-blue-500 hover:text-blue-600'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              {conversation.isLoading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>

            {/* Microphone button */}
            <button
              onClick={toggleVoiceListening}
              disabled={conversation.isLoading}
              className={`flex-shrink-0 transition-all duration-300 ${
                conversation.isLoading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : isListening 
                    ? 'text-red-500' 
                    : isDarkMode 
                      ? 'text-white/60 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Mic className="h-6 w-6" />
            </button>

            {/* Loading or Audio waveform button */}
            {conversation.isLoading ? (
              <div className="flex-shrink-0">
                <Loader2 className={`h-6 w-6 animate-spin ${
                  isDarkMode ? 'text-white/60' : 'text-gray-500'
                }`} />
              </div>
            ) : (
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className={`flex-shrink-0 transition-colors ${
                  isDarkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                } disabled:opacity-50`}
              >
                <AudioWaveform className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>

        {/* Conversation Starters */}
        {conversation.messages.length === 0 && (
          <div className="w-full max-w-3xl mt-6 px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {conversationStarters.map((starter, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterClick(starter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Complete Actions */}
        {conversation.isComplete && conversation.icpConfig && (
          <div className="w-full max-w-3xl mt-6 px-4">
            <div className="text-center">
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
                ✅ ICP configuration complete! Ready to find companies and leads.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={conversation.resetConversation}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isDarkMode
                      ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-xl'
                      : 'bg-white text-gray-900 border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  Start New Conversation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceChatInterface;
