
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

      // Calculate dynamic spin limit based on VIP level
      const userSpinLimit = profile?.daily_spin_limit || getDefaultSpinLimit(profile?.coins || 0);
      
      // Check if user can spin (based on their personal limit)
      setCanSpin((todaySpins?.length || 0) < userSpinLimit);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSpinLimit = (coins: number) => {
    if (coins >= 3000) return 50; // Grand Master - unlimited (represented as 50)
    if (coins >= 2000) return 10; // Elite Master
    if (coins >= 1000) return 8;  // VIP
    return 5; // Regular
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

    // Set up realtime subscription for coin updates
    if (user) {
      const subscription = supabase
        .channel('user-coins')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
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
