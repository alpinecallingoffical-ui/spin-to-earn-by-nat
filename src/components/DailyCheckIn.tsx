import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Gift, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface CheckInStreak {
  current_streak: number;
  last_check_in: string | null;
  total_check_ins: number;
}

export const DailyCheckIn = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<CheckInStreak>({ current_streak: 0, last_check_in: null, total_check_ins: 0 });
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reward, setReward] = useState(0);

  useEffect(() => {
    fetchCheckInStatus();
  }, [user]);

  const fetchCheckInStatus = async () => {
    if (!user) return;

    try {
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', user.id)
        .single();

      const { data: checkIns } = await supabase
        .from('user_benefits')
        .select('*')
        .eq('user_id', user.id)
        .eq('benefit_type', 'daily_check_in')
        .order('used_at', { ascending: false });

      if (checkIns && checkIns.length > 0) {
        const lastCheckIn = checkIns[0];
        const lastCheckInDate = new Date(lastCheckIn.used_at).toDateString();
        const today = new Date().toDateString();
        
        const daysSinceLastCheckIn = Math.floor((new Date().getTime() - new Date(lastCheckIn.used_at).getTime()) / (1000 * 60 * 60 * 24));
        
        let currentStreak = (lastCheckIn.benefit_data as any)?.streak || 1;
        if (daysSinceLastCheckIn === 1) {
          currentStreak += 1;
        } else if (daysSinceLastCheckIn > 1) {
          currentStreak = 1;
        }

        setStreak({
          current_streak: currentStreak,
          last_check_in: lastCheckIn.used_at,
          total_check_ins: checkIns.length
        });

        setCanCheckIn(lastCheckInDate !== today);
      } else {
        setCanCheckIn(true);
        setStreak({ current_streak: 0, last_check_in: null, total_check_ins: 0 });
      }

      // Calculate reward based on coins (VIP multiplier)
      const userCoins = userData?.coins || 0;
      let baseReward = 10 + (streak.current_streak * 5);
      let multiplier = 1;
      
      if (userCoins >= 3000) multiplier = 10;
      else if (userCoins >= 2000) multiplier = 5;
      else if (userCoins >= 1000) multiplier = 2;

      setReward(baseReward * multiplier);
    } catch (error) {
      console.error('Error fetching check-in status:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || !canCheckIn) return;

    setLoading(true);
    try {
      const newStreak = streak.current_streak + 1;
      
      // Record check-in
      const { error: insertError } = await supabase
        .from('user_benefits')
        .insert({
          user_id: user.id,
          benefit_type: 'daily_check_in',
          benefit_data: { streak: newStreak, reward }
        });

      if (insertError) throw insertError;

      // Award coins
      const { error: updateError } = await supabase.rpc('exec_sql', {
        sql: `UPDATE users SET coins = coins + ${reward} WHERE id = '${user.id}'`
      });

      if (updateError) throw updateError;

      toast.success(`🎉 Check-in successful! +${reward} coins`, {
        description: `${newStreak} day streak! Keep it up!`
      });

      setStreak(prev => ({
        ...prev,
        current_streak: newStreak,
        last_check_in: new Date().toISOString(),
        total_check_ins: prev.total_check_ins + 1
      }));
      setCanCheckIn(false);
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Daily Check-In
            </CardTitle>
            <CardDescription>Check in daily to earn rewards and build your streak!</CardDescription>
          </div>
          {streak.current_streak > 0 && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              <TrendingUp className="w-4 h-4 mr-1" />
              {streak.current_streak} Day Streak
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-primary">{streak.current_streak}</div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{reward}</div>
            <div className="text-xs text-muted-foreground">Coins Reward</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{streak.total_check_ins}</div>
            <div className="text-xs text-muted-foreground">Total Check-Ins</div>
          </div>
        </div>

        <Button
          onClick={handleCheckIn}
          disabled={!canCheckIn || loading}
          className="w-full"
          size="lg"
        >
          <Gift className="w-5 h-5 mr-2" />
          {canCheckIn ? `Check In & Claim ${reward} Coins` : 'Come Back Tomorrow'}
        </Button>

        {streak.last_check_in && (
          <p className="text-xs text-center text-muted-foreground">
            Last check-in: {new Date(streak.last_check_in).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};