import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ban, Shield, ChevronDown, ChevronUp, Coins, Trophy, Clock, Calendar, MapPin, MessageSquare, FileText } from 'lucide-react';
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
    terms_accepted_at?: string;
    terms_version?: string;
    ip_address?: string;
    last_login_at?: string;
    login_count?: number;
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
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');

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

    if (expanded) {
      fetchUserStats();
      fetchActivityLogs();
      fetchUserSessions();
      fetchUserNotes();
    }

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [user.id, expanded]);

  const fetchUserStats = async () => {
    try {
      const { count: totalSpins } = await supabase
        .from('spins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: todaySpins } = await supabase
        .from('spins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('spun_at', new Date().toISOString().split('T')[0]);

      const { data: spinsData } = await supabase
        .from('spins')
        .select('reward')
        .eq('user_id', user.id);
      const totalCoinsEarned = spinsData?.reduce((sum, spin) => sum + spin.reward, 0) || 0;

      const { count: withdrawals } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

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

  const fetchUserSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('login_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUserSessions(data || []);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  const fetchUserNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*, admin:admin_id(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserNotes(data || []);
    } catch (error) {
      console.error('Error fetching user notes:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          note: newNote,
        });

      if (error) throw error;
      
      toast.success('Note added successfully');
      setNewNote('');
      fetchUserNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const activities = [];

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

      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivityLogs(activities.slice(0, 20));
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

          <Separator />

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Joined:</span>
              <span className="font-medium">{format(new Date(user.created_at), 'PPP')}</span>
            </div>
            {user.terms_accepted_at && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Terms Accepted:</span>
                <span className="font-medium">{format(new Date(user.terms_accepted_at), 'PPP')}</span>
                <Badge variant="outline">v{user.terms_version || '1.0'}</Badge>
              </div>
            )}
            {user.last_login_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-medium">{format(new Date(user.last_login_at), 'PPP')}</span>
              </div>
            )}
            {user.ip_address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">IP Address:</span>
                <span className="font-mono text-xs">{user.ip_address}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Login Count:</span>
              <span className="font-medium">{user.login_count || 0} times</span>
            </div>
          </div>

          <Separator />

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

          <Separator />

          {/* Activity Logs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>📋</span> Activity Log
            </h4>
            <ScrollArea className="h-64 border rounded-lg p-2">
              {activityLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No activity yet
                </div>
              ) : (
                <div className="space-y-2">
                  {activityLogs.map((log, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border bg-card shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{log.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sm capitalize">
                              {log.type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
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
                                <div className="text-xs">#{log.data.ticket_id}</div>
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

          <Separator />

          {/* User Sessions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              <h4 className="font-semibold">Recent Sessions</h4>
            </div>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {userSessions.length === 0 ? (
                <p className="text-sm text-center py-8 text-muted-foreground">No sessions found</p>
              ) : (
                <div className="space-y-2">
                  {userSessions.map((session) => (
                    <div key={session.id} className="p-2 rounded bg-muted text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {format(new Date(session.login_at), 'PPp')}
                        </span>
                        {session.logout_at && (
                          <Badge variant="outline">Logged out</Badge>
                        )}
                      </div>
                      {session.ip_address && (
                        <p className="text-xs text-muted-foreground font-mono">{session.ip_address}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Separator />

          {/* Admin Notes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" />
              <h4 className="font-semibold">Admin Notes</h4>
            </div>
            <div className="space-y-2 mb-3">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this user..."
                rows={3}
              />
              <Button onClick={addNote} size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {userNotes.length === 0 ? (
                <p className="text-sm text-center py-8 text-muted-foreground">No notes yet</p>
              ) : (
                <div className="space-y-2">
                  {userNotes.map((note: any) => (
                    <div key={note.id} className="p-2 rounded bg-muted text-sm">
                      <p className="font-medium">{note.note}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          By: {note.admin?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'PPp')}
                        </p>
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
