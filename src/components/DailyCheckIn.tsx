
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { Gift, CheckCircle } from 'lucide-react';

export const DailyCheckIn = () => {
  const { user } = useAuth();
  const { userData, refetch } = useUserData();
  const { toast } = useToast();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (user) {
      checkDailyCheckInStatus();
    }
  }, [user]);

  const checkDailyCheckInStatus = async () => {
    if (!user) return;

    try {
      setCheckingStatus(true);
      
      // Check if user has already checked in today
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_type', 'daily_checkin')
        .eq('status', 'completed')
        .gte('completed_at', new Date().toISOString().split('T')[0]);

      if (error) throw error;
      
      setHasCheckedInToday(data && data.length > 0);
    } catch (error) {
      console.error('Error checking daily check-in status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleDailyCheckIn = async () => {
    if (!user || hasCheckedInToday || loading) return;

    setLoading(true);
    try {
      // Find or create daily check-in task
      const { data: existingTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('task_type', 'daily_checkin')
        .gte('created_at', new Date().toISOString().split('T')[0])
        .single();

      let taskId = existingTask?.id;

      if (!existingTask) {
        // Create new daily check-in task
        const { data: newTask, error: createError } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            task_type: 'daily_checkin',
            task_title: 'Daily Check-in',
            task_description: 'Log in to the app and claim your daily bonus',
            reward_coins: 10,
            status: 'pending'
          })
          .select()
          .single();

        if (createError) throw createError;
        taskId = newTask.id;
      }

      // Complete the task
      const { data, error } = await supabase.rpc('complete_task', {
        task_uuid: taskId
      });

      if (error) throw error;

      if (data) {
        const vipMultiplier = userData?.coins && userData.coins >= 3000 ? 10 : 
                             userData?.coins && userData.coins >= 2000 ? 5 : 
                             userData?.coins && userData.coins >= 1000 ? 2 : 1;
        
        const finalReward = 10 * vipMultiplier;

        toast({
          title: '🎉 Daily Check-in Complete!',
          description: `You earned ${finalReward} coins for checking in today!${vipMultiplier > 1 ? ` (${vipMultiplier}x VIP bonus!)` : ''}`,
        });

        setHasCheckedInToday(true);
        await refetch();
      }
    } catch (error) {
      console.error('Error completing daily check-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete daily check-in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <div className="text-center text-white/70">Checking daily status...</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30">
      <div className="text-center">
        <div className="text-4xl mb-3">🎁</div>
        <h3 className="text-white text-xl font-bold mb-2">Daily Check-in</h3>
        <p className="text-white/80 mb-4">
          {hasCheckedInToday 
            ? "You've already checked in today! Come back tomorrow for another bonus."
            : "Check in daily to earn bonus coins!"
          }
        </p>
        
        {hasCheckedInToday ? (
          <Button disabled className="bg-green-600 text-white opacity-75 w-full">
            <CheckCircle className="w-4 h-4 mr-2" />
            Already Checked In Today
          </Button>
        ) : (
          <Button 
            onClick={handleDailyCheckIn}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white w-full"
          >
            <Gift className="w-4 h-4 mr-2" />
            {loading ? 'Checking In...' : 'Claim Daily Bonus'}
          </Button>
        )}
      </div>
    </div>
  );
};
