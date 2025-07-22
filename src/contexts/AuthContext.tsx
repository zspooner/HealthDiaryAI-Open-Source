import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInAsGuest: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for guest mode in localStorage
    const guestMode = localStorage.getItem('isGuestMode');
    if (guestMode === 'true') {
      setIsGuest(true);
      setLoading(false);
    } else {
      // Auto-enable guest mode if no user is authenticated and we're on dashboard
      if (window.location.pathname === '/dashboard' && !session?.user) {
        localStorage.setItem('isGuestMode', 'true');
        setIsGuest(true);
        setLoading(false);
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || ''
        }
      }
    });

    setLoading(false);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    return { error };
  };

  const signInAsGuest = async () => {
    setLoading(true);
    
    // Set guest mode in localStorage
    localStorage.setItem('isGuestMode', 'true');
    setIsGuest(true);
    
    setLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    setLoading(true);
    
    // Clear guest mode
    localStorage.removeItem('isGuestMode');
    setIsGuest(false);
    
    const { error } = await supabase.auth.signOut();
    
    setLoading(false);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isGuest,
    signUp,
    signIn,
    signInAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};