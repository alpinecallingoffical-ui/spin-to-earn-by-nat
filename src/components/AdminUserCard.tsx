import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ban, Shield, ChevronDown, ChevronUp, Coins, Trophy, User } from 'lucide-react';
import { format } from 'date-fns';

interface AdminUserCardProps {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    coins: number;
    diamonds: number;
    banned: boolean;
    daily_spin_limit: number;
    created_at: string;
    profile_picture_url: string | null;
  };
  onUpdate: () => void;
}

export const AdminUserCard: React.FC<AdminUserCardProps> = ({ user: initialUser, onUpdate }) => {
  const [user, setUser] = useState(initialUser);
  const [expanded, setExpanded] = useState(false);
  const [newSpinLimit, setNewSpinLimit] = useState(user.daily_spin_limit);
  const [stats, setStats] = useState({
    totalSpins: 0,
    todaySpins: 0,
    totalCoinsEarned: 0,
    withdrawals: 0,
    reports: 0
  });

  // Set up realtime subscription for this specific user
  useEffect(() => {
    const userChannel = supabase
      .channel(`user_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('User updated:', payload);
          setUser(payload.new as any);
          onUpdate();
        }
      )
      .subscribe();

    // Fetch user stats
    fetchUserStats();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      // Get total spins
      const { count: totalSpins } = await supabase
        .from('spins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get today's spins
      const { count: todaySpins } = await supabase
        .from('spins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('spun_at', new Date().toISOString().split('T')[0]);

      // Get total coins earned from spins
      const { data: spinsData } = await supabase
        .from('spins')
        .select('reward')
        .eq('user_id', user.id);
      const totalCoinsEarned = spinsData?.reduce((sum, spin) => sum + spin.reward, 0) || 0;

      // Get withdrawals count
      const { count: withdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get reports count
      const { count: reports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        totalSpins: totalSpins || 0,
        todaySpins: todaySpins || 0,
        totalCoinsEarned,
        withdrawals: withdrawals || 0,
        reports: reports || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const toggleBan = async () => {
    try {
      const { error } = await supabase.rpc('admin_ban_user', {
        target_user_id: user.id,
        should_ban: !user.banned
      });

      if (error) throw error;

      toast.success(`User ${!user.banned ? 'banned' : 'unbanned'} successfully`);
      onUpdate();
    } catch (error) {
      console.error('Error updating ban status:', error);
      toast.error('Failed to update user status');
    }
  };

  const updateSpinLimit = async () => {
    try {
      const { error } = await supabase.rpc('admin_update_spin_limit', {
        target_user_id: user.id,
        new_limit: newSpinLimit
      });

      if (error) throw error;

      toast.success('Spin limit updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Error updating spin limit:', error);
      toast.error('Failed to update spin limit');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {user.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt={user.name}
                className="w-16 h-16 rounded-full border-2 border-purple-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-2xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg truncate">{user.name}</h3>
                <span className="text-sm text-muted-foreground">@{user.username}</span>
                {user.banned && <Badge variant="destructive">Banned</Badge>}
              </div>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {user.coins} coins
                </span>
                <span className="flex items-center gap-1">
                  💎 {user.diamonds} diamonds
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  {user.daily_spin_limit} spins/day
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant={user.banned ? "default" : "destructive"}
              onClick={toggleBan}
            >
              {user.banned ? <Shield className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Spins</p>
              <p className="text-xl font-bold text-blue-600">{stats.totalSpins}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Today's Spins</p>
              <p className="text-xl font-bold text-green-600">{stats.todaySpins}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Coins Earned</p>
              <p className="text-xl font-bold text-yellow-600">{stats.totalCoinsEarned}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Withdrawals</p>
              <p className="text-xl font-bold text-purple-600">{stats.withdrawals}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Reports</p>
              <p className="text-xl font-bold text-red-600">{stats.reports}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">User ID:</span>
              <p className="font-mono text-xs truncate">{user.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Joined:</span>
              <p>{format(new Date(user.created_at), 'PPP')}</p>
            </div>
          </div>

          {/* Spin Limit Control */}
          <div className="flex gap-2">
            <Input
              type="number"
              value={newSpinLimit}
              onChange={(e) => setNewSpinLimit(parseInt(e.target.value) || 0)}
              placeholder="New spin limit"
              min="0"
              max="1000"
              className="w-32"
            />
            <Button
              size="sm"
              onClick={updateSpinLimit}
              disabled={newSpinLimit === user.daily_spin_limit}
            >
              Update Spin Limit
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};