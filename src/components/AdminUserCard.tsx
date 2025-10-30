import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

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

      // Fetch comprehensive activity logs
      await fetchActivityLogs();
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const activities = [];

      // Get recent spins
      const { data: spinsData } = await supabase
        .from('spins')
        .select('*')
        .eq('user_id', user.id)
        .order('spun_at', { ascending: false })
        .limit(10);
      
      if (spinsData) {
        activities.push(...spinsData.map(spin => ({
          type: 'spin',
          timestamp: spin.spun_at,
          data: { reward: spin.reward },
          icon: '🎰',
          color: 'blue'
        })));
      }

      // Get recent withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(10);
      
      if (withdrawalsData) {
        activities.push(...withdrawalsData.map(withdrawal => ({
          type: 'withdrawal',
          timestamp: withdrawal.requested_at,
          data: { 
            amount: withdrawal.coin_amount, 
            status: withdrawal.status,
            esewa_number: withdrawal.esewa_number 
          },
          icon: '💰',
          color: 'green'
        })));
      }

      // Get recent reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (reportsData) {
        activities.push(...reportsData.map(report => ({
          type: 'report',
          timestamp: report.created_at,
          data: { 
            title: report.title, 
            status: report.status,
            ticket_id: report.ticket_id 
          },
          icon: '⚠️',
          color: 'red'
        })));
      }

      // Get recent purchases
      const { data: purchasesData } = await supabase
        .from('diamond_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (purchasesData) {
        activities.push(...purchasesData.map(purchase => ({
          type: 'purchase',
          timestamp: purchase.created_at,
          data: { 
            diamonds: purchase.diamonds_purchased, 
            price: purchase.price_paid_rs,
            status: purchase.payment_status 
          },
          icon: '💎',
          color: 'purple'
        })));
      }

      // Get recent messages sent
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (messagesData) {
        activities.push(...messagesData.map(message => ({
          type: 'message',
          timestamp: message.created_at,
          data: { 
            content: message.content.substring(0, 50) + '...',
            read: message.read 
          },
          icon: '💬',
          color: 'indigo'
        })));
      }

      // Sort all activities by timestamp
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivityLogs(activities.slice(0, 20)); // Show latest 20 activities
    } catch (error) {
      console.error('Error fetching activity logs:', error);
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

          {/* Activity Logs */}
          <div className="mt-4">
            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <span>📋</span> Activity Log
            </h4>
            <ScrollArea className="h-64 border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((log, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border-l-4 border-${log.color}-500 bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{log.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm capitalize text-gray-900 dark:text-white">
                              {log.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {log.type === 'spin' && (
                              <span className="font-mono">Reward: {log.data.reward} coins</span>
                            )}
                            {log.type === 'withdrawal' && (
                              <div className="space-y-1">
                                <div className="font-mono">{log.data.amount} coins</div>
                                <div>eSewa: {log.data.esewa_number}</div>
                                <Badge variant={log.data.status === 'approved' ? 'default' : 'secondary'}>
                                  {log.data.status}
                                </Badge>
                              </div>
                            )}
                            {log.type === 'report' && (
                              <div className="space-y-1">
                                <div className="font-medium">{log.data.title}</div>
                                <div className="text-xs text-gray-500">#{log.data.ticket_id}</div>
                                <Badge variant={log.data.status === 'resolved' ? 'default' : 'secondary'}>
                                  {log.data.status}
                                </Badge>
                              </div>
                            )}
                            {log.type === 'purchase' && (
                              <div className="space-y-1">
                                <div className="font-mono">{log.data.diamonds} 💎 for Rs. {log.data.price}</div>
                                <Badge variant={log.data.status === 'completed' ? 'default' : 'secondary'}>
                                  {log.data.status}
                                </Badge>
                              </div>
                            )}
                            {log.type === 'message' && (
                              <div className="space-y-1">
                                <div className="italic truncate">{log.data.content}</div>
                                <Badge variant={log.data.read ? 'default' : 'secondary'}>
                                  {log.data.read ? 'Read' : 'Unread'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      )}
    </Card>
  );
};