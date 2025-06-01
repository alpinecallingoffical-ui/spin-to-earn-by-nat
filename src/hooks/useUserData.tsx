
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  coins: number;
  referral_code: string;
  referred_by?: string;
  created_at: string;
  daily_spin_limit: number;
}

interface SpinRecord {
  id: string;
  reward: number;
  spun_at: string;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [spins, setSpins] = useState<SpinRecord[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserData(profile);

      // Fetch today's spins
      const { data: todaySpins, error: spinsError } = await supabase
        .from('spins')
        .select('*')
        .eq('user_id', user.id)
        .gte('spun_at', new Date().toISOString().split('T')[0])
        .order('spun_at', { ascending: false });

      if (spinsError) throw spinsError;
      setSpins(todaySpins || []);

      // Use the actual daily_spin_limit from database
      const userSpinLimit = profile?.daily_spin_limit || 5;
      
      // Check if user can spin based on their personal limit
      setCanSpin((todaySpins?.length || 0) < userSpinLimit);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const recordSpin = async (reward: number) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('record_spin', {
        user_uuid: user.id,
        reward_amount: reward,
      });

      if (error) throw error;
      
      if (data) {
        // Refresh user data
        await fetchUserData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error recording spin:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchUserData();

    // Set up realtime subscription for user updates
    if (user) {
      const subscription = supabase
        .channel('user-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('User data updated:', payload);
            setUserData(prev => prev ? { 
              ...prev, 
              coins: payload.new.coins,
              daily_spin_limit: payload.new.daily_spin_limit 
            } : null);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  return {
    userData,
    spins,
    canSpin,
    loading,
    recordSpin,
    refetch: fetchUserData,
  };
};
