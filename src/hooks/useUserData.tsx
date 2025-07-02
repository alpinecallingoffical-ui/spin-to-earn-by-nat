import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useVipSounds } from './useVipSounds';

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
  profile_picture_url?: string;
}

interface SpinRecord {
  id: string;
  reward: number;
  spun_at: string;
}

// Simple referral code generator
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useUserData = () => {
  const { user } = useAuth();
  const { playGrandMasterSound, playVipLevelUpSound } = useVipSounds();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [spins, setSpins] = useState<SpinRecord[]>([]);
  const [canSpin, setCanSpin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previousCoins, setPreviousCoins] = useState<number | null>(null);
  const [profileTimeout, setProfileTimeout] = useState(false);

  const calculateCanSpin = (coins: number, spinLimit: number, todaySpinCount: number) => {
    // Grand Master level (3000+ coins) gets unlimited spins
    const isUnlimited = coins >= 3000;
    return isUnlimited || todaySpinCount < spinLimit;
  };

  const checkForVipLevelUp = (newCoins: number, oldCoins: number | null) => {
    if (oldCoins === null) return;

    // Check if user just reached Grand Master (3000 coins)
    if (oldCoins < 3000 && newCoins >= 3000) {
      console.log('🎉 User reached Grand Master level!');
      setTimeout(() => {
        playGrandMasterSound();
      }, 500);
    }
    // Check if user just reached Elite Master (2000 coins)
    else if (oldCoins < 2000 && newCoins >= 2000) {
      console.log('🎉 User reached Elite Master level!');
      setTimeout(() => {
        playVipLevelUpSound();
      }, 500);
    }
    // Check if user just reached VIP (1000 coins)
    else if (oldCoins < 1000 && newCoins >= 1000) {
      console.log('🎉 User reached VIP level!');
      setTimeout(() => {
        playVipLevelUpSound();
      }, 500);
    }
  };

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true); // always set loading on new fetch
    try {
      console.log('Fetching user data for:', user.id);
      
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // Handle the case where profile doesn't yet exist
      if (profileError && profileError.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        
        // Create user profile if it doesn't exist
        try {
          const newUserData = {
            id: user.id,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            phone: user.phone,
            coins: 0,
            daily_spin_limit: 5,
            referral_code: generateReferralCode(),
            referred_by: null
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setProfileTimeout(true);
            setLoading(false);
            return;
          }

          console.log('Profile created successfully:', createdProfile);
          setUserData(createdProfile);
          
          // Continue with spins fetch
          const { data: todaySpins } = await supabase
            .from('spins')
            .select('*')
            .eq('user_id', user.id)
            .gte('spun_at', new Date().toISOString().split('T')[0])
            .order('spun_at', { ascending: false });
          
          setSpins(todaySpins || []);
          const todaySpinCount = todaySpins?.length || 0;
          const userSpinLimit = createdProfile.daily_spin_limit || 5;
          const canSpinStatus = calculateCanSpin(createdProfile.coins, userSpinLimit, todaySpinCount);
          setCanSpin(canSpinStatus);
          setLoading(false);
        } catch (error) {
          console.error('Failed to create user profile:', error);
          setProfileTimeout(true);
          setLoading(false);
        }
        return;
      }

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
      // Set up realtime subscription for user table updates
      const userSubscription = supabase
        .channel('user-data-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time user update received:', payload);
            
            // Update local state immediately with new data
            setUserData(prev => {
              if (!prev) return null;
              
              const updatedData = { 
                ...prev, 
                ...payload.new
              };
              
              console.log('Updated user data:', updatedData);
              
              // Check for VIP level up and play sounds
              checkForVipLevelUp(updatedData.coins, prev.coins);
              setPreviousCoins(prev.coins);
              
              // Recalculate canSpin based on new data
              const todaySpinCount = spins.length;
              const newCanSpin = calculateCanSpin(
                updatedData.coins, 
                updatedData.daily_spin_limit, 
                todaySpinCount
              );
              
              console.log('Real-time spin calculation:', {
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
        .subscribe();

      // Set up realtime subscription for spins table updates
      const spinsSubscription = supabase
        .channel('spins-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'spins',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Real-time spins update received:', payload);
            // Refresh spins data when new spin is added
            fetchUserData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(userSubscription);
        supabase.removeChannel(spinsSubscription);
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
    profileTimeout, // add this
  };
};
