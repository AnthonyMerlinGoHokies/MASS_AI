/**
 * Simple API test utility to verify backend connectivity
 */
import { api } from './api';

export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await api.health();
    console.log('Backend health check successful:', response);
    return true;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

export const testConversationFlow = async (): Promise<boolean> => {
  try {
    // Test starting a conversation
    const startResponse = await api.conversation.start({
      initial_text: "Find me SaaS companies in San Francisco",
      mode: 'auto',
      max_turns: 3
    });
    
    console.log('Conversation start successful:', startResponse);
    
    if (startResponse.needs_conversation && startResponse.conversation_id) {
      // Test responding to conversation
      const respondResponse = await api.conversation.respond(startResponse.conversation_id, {
        answer: "Companies with 10-50 employees and $1M+ revenue"
      });
      
      console.log('Conversation respond successful:', respondResponse);
    }
    
    return true;
  } catch (error) {
    console.error('Conversation flow test failed:', error);
    return false;
  }
};

export const runAllTests = async (): Promise<void> => {
  console.log('Running API integration tests...');
  
  const healthCheck = await testBackendConnection();
  if (!healthCheck) {
    console.error('❌ Backend connection test failed');
    return;
  }
  
  console.log('✅ Backend connection test passed');
  
  const conversationTest = await testConversationFlow();
  if (!conversationTest) {
    console.error('❌ Conversation flow test failed');
    return;
  }
  
  console.log('✅ Conversation flow test passed');
  console.log('🎉 All API integration tests passed!');
};
