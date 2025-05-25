
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createUserProfile } from '@/utils/userCreation';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Handle new user registration
        if (event === 'SIGNED_UP' && session?.user) {
          console.log('New user signed up, checking if profile exists...');
          
          // Check if user profile already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();
          
          // If no profile exists, create one manually
          if (!existingUser) {
            console.log('Creating user profile manually...');
            try {
              const userData = {
                name: session.user.user_metadata?.name || 'User',
                email: session.user.email,
                phone: session.user.user_metadata?.phone,
                referredBy: session.user.user_metadata?.referred_by,
              };
              
              await createUserProfile(session.user.id, userData);
              console.log('User profile created successfully');
            } catch (error) {
              console.error('Failed to create user profile:', error);
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
};
