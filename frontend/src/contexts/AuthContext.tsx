import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from Supabase
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If table doesn't exist or profile not found, gracefully handle it
        if (error.code === 'PGRST116' || error.message.includes('schema cache')) {
          console.warn('Profiles table not found - app will work without user profiles');
          return null;
        }
        console.warn('Profile not found for user:', error.message);
        return null;
      }

      return data as Profile;
    } catch (error) {
      // Catch any unexpected errors and allow app to continue
      console.warn('Could not fetch profile (table may not exist):', error);
      return null;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Initialize auth state and listen for changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isInitialized = false;

    // Safety timeout - ensure loading is set to false after 5 seconds max
    timeoutId = setTimeout(() => {
      if (!isInitialized) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Got session:', currentSession ? 'User authenticated' : 'No session');

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('Fetching profile for user:', currentSession.user.id);
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);
          console.log('Profile fetched:', profileData ? 'Success' : 'No profile');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        isInitialized = true;
        clearTimeout(timeoutId);
        console.log('Auth initialization complete - setting loading to false');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    session,
    loading,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
