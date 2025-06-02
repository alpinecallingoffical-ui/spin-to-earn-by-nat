
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

  const calculateCanSpin = (coins: number, spinLimit: number, todaySpinCount: number) => {
    // Grand Master level (3000+ coins) gets unlimited spins
    const isUnlimited = coins >= 3000;
    return isUnlimited || todaySpinCount < spinLimit;
  };

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user data for:', user.id);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      console.log('User profile fetched:', profile);
      setUserData(profile);

      // Fetch today's spins
      const { data: todaySpins, error: spinsError } = await supabase
        .from('spins')
        .select('*')
        .eq('user_id', user.id)
        .gte('spun_at', new Date().toISOString().split('T')[0])
        .order('spun_at', { ascending: false });

      if (spinsError) throw spinsError;
      console.log('Today spins fetched:', todaySpins);
      setSpins(todaySpins || []);

      // Calculate can spin status
      const todaySpinCount = todaySpins?.length || 0;
      const userSpinLimit = profile?.daily_spin_limit || 5;
      const userCoins = profile?.coins || 0;
      
      const canSpinStatus = calculateCanSpin(userCoins, userSpinLimit, todaySpinCount);
      setCanSpin(canSpinStatus);

      console.log('Spin calculation:', {
        userCoins,
        userSpinLimit,
        todaySpinCount,
        canSpinStatus,
        isUnlimited: userCoins >= 3000
      });
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
        // Refresh user data to get updated coins and spin count
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

    if (user) {
      // Set up comprehensive real-time subscription for ALL database changes
      const allChangesSubscription = supabase
        .channel('admin-realtime-updates')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to ALL events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time users table update:', payload);
            
            // Update local state immediately with new data
            setUserData(prev => {
              if (!prev) return null;
              
              const updatedData = { 
                ...prev, 
                ...payload.new
              };
              
              console.log('Updated user data from admin change:', updatedData);
              
              // Recalculate canSpin based on new data
              const todaySpinCount = spins.length;
              const newCanSpin = calculateCanSpin(
                updatedData.coins, 
                updatedData.daily_spin_limit, 
                todaySpinCount
              );
              
              console.log('Real-time spin calculation after admin change:', {
                coins: updatedData.coins,
                spinLimit: updatedData.daily_spin_limit,
                todaySpinCount,
                newCanSpin,
                isUnlimited: updatedData.coins >= 3000
              });
              
              setCanSpin(newCanSpin);
              
              return updatedData;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'spins',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time spins table update:', payload);
            // Refresh spins data when any spin changes occur
            fetchUserData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'withdrawals',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time withdrawals table update:', payload);
            // Refresh user data as withdrawals might affect coins
            fetchUserData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'referrals',
          },
          (payload) => {
            console.log('Real-time referrals table update:', payload);
            // Check if this affects the current user with proper type checking
            if (payload.new && typeof payload.new === 'object') {
              const newData = payload.new as any;
              if (newData.referrer_id === user.id || newData.referred_user_id === user.id) {
                fetchUserData();
              }
            }
          }
        )
        .subscribe();

      console.log('Real-time subscription setup for admin changes');

      return () => {
        supabase.removeChannel(allChangesSubscription);
        console.log('Real-time subscription cleaned up');
      };
    }
  }, [user]);

  // Re-calculate canSpin whenever spins array changes
  useEffect(() => {
    if (userData) {
      const todaySpinCount = spins.length;
      const newCanSpin = calculateCanSpin(
        userData.coins, 
        userData.daily_spin_limit, 
        todaySpinCount
      );
      setCanSpin(newCanSpin);
      
      console.log('Spins array changed, recalculating:', {
        coins: userData.coins,
        spinLimit: userData.daily_spin_limit,
        todaySpinCount,
        newCanSpin
      });
    }
  }, [spins, userData]);

  return {
    userData,
    spins,
    canSpin,
    loading,
    recordSpin,
    refetch: fetchUserData,
  };
};
