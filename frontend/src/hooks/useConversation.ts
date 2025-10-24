import { useState, useCallback } from 'react';
import { api, ConversationStartRequest, ConversationRespondRequest, ConversationMessage } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface ConversationState {
  conversationId: string | null;
  sessionId: string | null;
  messages: ConversationMessage[];
  isComplete: boolean;
  isLoading: boolean;
  isAgentTyping: boolean;
  progressPercentage: number;
  needsMoreInfo: boolean;
  currentState: any;
  icpConfig: any;
}

export const useConversation = () => {
  const [state, setState] = useState<ConversationState>({
    conversationId: null,
    sessionId: null,
    messages: [],
    isComplete: false,
    isLoading: false,
    isAgentTyping: false,
    progressPercentage: 0,
    needsMoreInfo: false,
    currentState: null,
    icpConfig: null,
  });

  const { toast } = useToast();

  const startConversation = useCallback(async (request: ConversationStartRequest) => {
    // Add user message optimistically
    const userMessage = { role: 'user' as const, content: request.initial_text };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isAgentTyping: true,
    }));
    
    try {
      const response = await api.conversation.start(request);
      
      setState(prev => ({
        ...prev,
        conversationId: response.conversation_id,
        sessionId: response.session_id,
        messages: [
          ...prev.messages.filter((_, index) => index !== prev.messages.length - 1), // Remove optimistic user message
          { role: 'user', content: request.initial_text },
          ...(response.needs_conversation && response.message ? [{ role: 'agent', content: response.message }] : []),
          ...(!response.needs_conversation ? [{ role: 'agent', content: 'Great! I have enough information to proceed with your request.' }] : [])
        ],
        isComplete: !response.needs_conversation,
        needsMoreInfo: response.needs_conversation,
        currentState: response.current_state,
        icpConfig: response.icp_config,
        isLoading: false,
        isAgentTyping: false,
      }));

      return response;
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
      // Remove optimistic user message on error
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter((_, index) => index !== prev.messages.length - 1),
        isLoading: false,
        isAgentTyping: false,
      }));
      throw error;
    }
  }, [toast]);

  const respondToConversation = useCallback(async (answer: string) => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    // Add user message optimistically
    const userMessage = { role: 'user' as const, content: answer };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      isAgentTyping: true,
    }));
    
    try {
      const response = await api.conversation.respond(state.conversationId, { answer });
      
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages.filter((_, index) => index !== prev.messages.length - 1), // Remove optimistic user message
          { role: 'user', content: answer },
          ...(response.message ? [{ role: 'agent', content: response.message }] : [])
        ],
        isComplete: !response.needs_more_info,
        needsMoreInfo: response.needs_more_info,
        progressPercentage: response.progress_percentage,
        currentState: response.current_state,
        icpConfig: response.icp_config || prev.icpConfig,
        isLoading: false,
        isAgentTyping: false,
      }));

      return response;
    } catch (error) {
      console.error('Error responding to conversation:', error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive"
      });
      // Remove optimistic user message on error
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter((_, index) => index !== prev.messages.length - 1),
        isLoading: false,
        isAgentTyping: false,
      }));
      throw error;
    }
  }, [state.conversationId, toast]);

  const getConversationStatus = useCallback(async () => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    try {
      const response = await api.conversation.getStatus(state.conversationId);
      
      setState(prev => ({
        ...prev,
        messages: response.messages,
        isComplete: response.is_complete,
        progressPercentage: response.progress_percentage,
        currentState: {
          known_fields: response.known_fields,
          missing_fields: response.missing_fields,
          turn_count: response.turn_count,
        },
      }));

      return response;
    } catch (error) {
      console.error('Error getting conversation status:', error);
      throw error;
    }
  }, [state.conversationId]);

  const finalizeConversation = useCallback(async (forceComplete = false) => {
    if (!state.conversationId) {
      throw new Error('No active conversation');
    }

    try {
      const response = await api.conversation.finalize(state.conversationId, forceComplete);
      
      setState(prev => ({
        ...prev,
        isComplete: true,
        needsMoreInfo: false,
        icpConfig: response.icp_config,
      }));

      return response;
    } catch (error) {
      console.error('Error finalizing conversation:', error);
      throw error;
    }
  }, [state.conversationId]);

  const resetConversation = useCallback(() => {
    setState({
      conversationId: null,
      sessionId: null,
      messages: [],
      isComplete: false,
      isLoading: false,
      isAgentTyping: false,
      progressPercentage: 0,
      needsMoreInfo: false,
      currentState: null,
      icpConfig: null,
    });
  }, []);

  return {
    ...state,
    startConversation,
    respondToConversation,
    getConversationStatus,
    finalizeConversation,
    resetConversation,
  };
};
