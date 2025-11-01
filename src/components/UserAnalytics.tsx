import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Activity, 
  Award, 
  Coins,
  Calendar,
  BarChart3
} from 'lucide-react';

interface UserStats {
  totalSpins: number;
  totalCoinsEarned: number;
  averageCoinsPerSpin: number;
  bestDayCoins: number;
  daysActive: number;
  currentStreak: number;
  totalWithdrawn: number;
  vipLevel: string;
}

export const UserAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalSpins: 0,
    totalCoinsEarned: 0,
    averageCoinsPerSpin: 0,
    bestDayCoins: 0,
    daysActive: 0,
    currentStreak: 0,
    totalWithdrawn: 0,
    vipLevel: 'Regular'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('coins, created_at')
        .eq('id', user.id)
        .single();

      // Get all spins
      const { data: spins } = await supabase
        .from('spins')
        .select('reward, spun_at')
        .eq('user_id', user.id);

      // Get withdrawals
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('coin_amount')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      // Calculate stats
      const totalCoinsEarned = spins?.reduce((sum, s) => sum + s.reward, 0) || 0;
      const totalSpins = spins?.length || 0;
      const avgCoins = totalSpins > 0 ? Math.round(totalCoinsEarned / totalSpins) : 0;

      // Calculate best day
      const spinsByDay = spins?.reduce((acc, spin) => {
        const day = new Date(spin.spun_at).toDateString();
        acc[day] = (acc[day] || 0) + spin.reward;
        return acc;
      }, {} as Record<string, number>);
      const bestDay = spinsByDay ? Math.max(...Object.values(spinsByDay), 0) : 0;

      // Calculate days active
      const uniqueDays = new Set(spins?.map(s => new Date(s.spun_at).toDateString()) || []).size;

      // Calculate streak
      const sortedDays = Array.from(new Set(spins?.map(s => new Date(s.spun_at).toDateString()) || [])).sort().reverse();
      let streak = 0;
      let currentDate = new Date().toDateString();
      
      for (const day of sortedDays) {
        if (day === currentDate || new Date(day).toDateString() === new Date(Date.now() - 86400000).toDateString()) {
          streak++;
          currentDate = new Date(new Date(day).getTime() - 86400000).toDateString();
        } else {
          break;
        }
      }

      // Total withdrawn
      const withdrawn = withdrawals?.reduce((sum, w) => sum + w.coin_amount, 0) || 0;

      // VIP Level
      const coins = userData?.coins || 0;
      let vipLevel = 'Regular';
      if (coins >= 3000) vipLevel = 'Grand Master (10x)';
      else if (coins >= 2000) vipLevel = 'Elite Master (5x)';
      else if (coins >= 1000) vipLevel = 'VIP (2x)';

      setStats({
        totalSpins,
        totalCoinsEarned,
        averageCoinsPerSpin: avgCoins,
        bestDayCoins: bestDay,
        daysActive: uniqueDays,
        currentStreak: streak,
        totalWithdrawn: withdrawn,
        vipLevel
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading statistics...</CardContent></Card>;
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Statistics
          </CardTitle>
          <CardDescription>Track your progress and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">Total Spins</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalSpins}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Coins Earned</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalCoinsEarned.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-xs text-muted-foreground">Avg Per Spin</span>
              </div>
              <div className="text-2xl font-bold">{stats.averageCoinsPerSpin}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">Best Day</span>
              </div>
              <div className="text-2xl font-bold">{stats.bestDayCoins}</div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span className="text-xs text-muted-foreground">Days Active</span>
              </div>
              <div className="text-2xl font-bold">{stats.daysActive}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-xs text-muted-foreground">Current Streak</span>
              </div>
              <div className="text-2xl font-bold">{stats.currentStreak} days</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-red-600" />
                <span className="text-xs text-muted-foreground">Withdrawn</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalWithdrawn.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span className="text-xs text-muted-foreground">VIP Level</span>
              </div>
              <Badge variant="secondary" className="text-xs">{stats.vipLevel}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};