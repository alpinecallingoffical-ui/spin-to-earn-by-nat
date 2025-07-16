
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [hasInitialSession, setHasInitialSession] = useState(false);

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful sign in - only for actual new logins, not session restoration
        if (event === 'SIGNED_IN' && session?.user && hasInitialSession) {
          console.log('User signed in successfully:', session.user.id);
          setIsNewLogin(true);
          // Reset the flag after showing welcome
          setTimeout(() => setIsNewLogin(false), 3000);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setUser(session?.user ?? null);
      setLoading(false);
      setHasInitialSession(true); // Mark that we've checked for initial session
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signOut, isNewLogin };
};
