
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, checking if profile exists...');
          
          // Wait a moment to allow trigger to process
          setTimeout(async () => {
            try {
              // Check if user profile exists
              const { data: existingUser, error } = await supabase
                .from('users')
                .select('id, name, email, coins')
                .eq('id', session.user.id)
                .maybeSingle();
              
              if (error) {
                console.error('Error checking user profile:', error);
                return;
              }
              
              console.log('Existing user check result:', existingUser);
              
              // If no profile exists and this looks like a new signup, the trigger should have handled it
              // But if it failed, we don't want to create duplicate users here
              if (!existingUser) {
                console.log('No user profile found - trigger may have failed or this is a returning user');
              } else {
                console.log('User profile found:', existingUser);
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
            }
          }, 2000); // Wait 2 seconds for trigger to complete
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    console.log('Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  return { user, loading, signOut };
};
