/**
 * Application configuration
 */
export const config = {
  // Backend API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds
  },
  
  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://axsnkfessfornzszswxm.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4c25rZmVzc2Zvcm56c3pzd3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5MDc0MzQsImV4cCI6MjA2MDQ4MzQzNH0.GamVnUmf9GFNoHKOFsxnjRXcKd01P6I-az7-iJoCMAU',
  },
  
  // Application settings
  app: {
    name: 'SIOS',
    version: '1.0.0',
  },
  
  // Feature flags
  features: {
    enableVoiceChat: true,
    enableRealTimeUpdates: true,
    enableMockData: true, // Set to false in production
  },
};
