import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminUserCard } from './AdminUserCard';
import { AdminSettings } from './AdminSettings';
import { toast } from 'sonner';
import { 
  Users, 
  DollarSign, 
  Flag,
  Settings,
  Coins,
  Trophy,
  Search,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface User {
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
}

interface Report {
  id: string;
  ticket_id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  admin_response: string | null;
  users: {
    name: string;
    username: string;
    email: string;
  };
}

interface Withdrawal {
  id: string;
  user_id: string;
  coin_amount: number;
  esewa_number: string;
  status: string;
  requested_at: string;
  transaction_id: string;
  users: {
    name: string;
    username: string;
    email: string;
  };
}

interface SpinRequest {
  id: string;
  user_id: string;
  spin_time: string;
  status: string;
  admin_notes: string | null;
  users: {
    name: string;
    username: string;
  };
}

interface DiamondPurchase {
  id: string;
  user_id: string;
  diamonds_purchased: number;
  price_paid_rs: number;
  payment_status: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
  users: {
    name: string;
    username: string;
  };
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [spinRequests, setSpinRequests] = useState<SpinRequest[]>([]);
  const [diamondPurchases, setDiamondPurchases] = useState<DiamondPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoins: 0,
    pendingWithdrawals: 0,
    pendingReports: 0,
    todaySpins: 0
  });

  useEffect(() => {
    fetchAllData();

    // Set up realtime subscriptions for all tables
    const usersChannel = supabase
      .channel('admin_users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
        fetchStats();
      })
      .subscribe();

    const reportsChannel = supabase
      .channel('admin_reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        fetchReports();
        fetchStats();
      })
      .subscribe();

    const withdrawalsChannel = supabase
      .channel('admin_withdrawals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawals' }, () => {
        fetchWithdrawals();
        fetchStats();
      })
      .subscribe();

    const spinsChannel = supabase
      .channel('admin_spins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spin_management' }, () => {
        fetchSpinRequests();
      })
      .subscribe();

    const diamondsChannel = supabase
      .channel('admin_diamonds')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diamond_purchases' }, () => {
        fetchDiamondPurchases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(reportsChannel);
      supabase.removeChannel(withdrawalsChannel);
      supabase.removeChannel(spinsChannel);
      supabase.removeChannel(diamondsChannel);
    };
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchReports(),
        fetchWithdrawals(),
        fetchSpinRequests(),
        fetchDiamondPurchases(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setUsers(data);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        users:user_id (name, username, email)
      `)
      .order('created_at', { ascending: false });
    
    if (!error && data) setReports(data);
  };

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        users:user_id (name, username, email)
      `)
      .order('requested_at', { ascending: false });
    
    if (!error && data) setWithdrawals(data);
  };

  const fetchSpinRequests = async () => {
    const { data, error } = await supabase
      .from('spin_management')
      .select(`
        *,
        users!spin_management_user_id_fkey (name, username)
      `)
      .order('spin_time', { ascending: false })
      .limit(50);
    
    if (!error && data) setSpinRequests(data as any);
  };

  const fetchDiamondPurchases = async () => {
    const { data, error } = await supabase
      .from('diamond_purchases')
      .select(`
        *,
        users!diamond_purchases_user_id_fkey (name, username)
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (!error && data) setDiamondPurchases(data as any);
  };

  const fetchStats = async () => {
    const { data: usersData } = await supabase.from('users').select('coins');
    const { count: pendingWithdrawals } = await supabase
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { count: pendingReports } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    const { count: todaySpins } = await supabase
      .from('spins')
      .select('*', { count: 'exact', head: true })
      .gte('spun_at', new Date().toISOString().split('T')[0]);

    setStats({
      totalUsers: usersData?.length || 0,
      totalCoins: usersData?.reduce((sum, u) => sum + u.coins, 0) || 0,
      pendingWithdrawals: pendingWithdrawals || 0,
      pendingReports: pendingReports || 0,
      todaySpins: todaySpins || 0
    });
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateReportStatus = async (reportId: string, status: string, response: string) => {
    const { error } = await supabase.rpc('admin_update_report_status', {
      report_id: reportId,
      new_status: status,
      admin_response_text: response
    });

    if (error) {
      toast.error('Failed to update report');
    } else {
      toast.success('Report updated successfully');
      fetchReports();
    }
  };

  const updateWithdrawalStatus = async (withdrawalId: string, status: string, notes: string) => {
    const { error } = await supabase.rpc('admin_update_withdrawal_status', {
      withdrawal_id: withdrawalId,
      new_status: status,
      admin_notes_text: notes
    });

    if (error) {
      toast.error('Failed to update withdrawal');
    } else {
      if (status === 'completed') {
        // Also trigger approval notification
        await supabase.rpc('approve_withdrawal_with_notification', {
          withdrawal_id: withdrawalId,
          admin_notes: notes
        });
        toast.success('Withdrawal approved and notification sent');
      } else {
        toast.success('Withdrawal updated successfully');
      }
      fetchWithdrawals();
    }
  };

  const updateSpinRequest = async (requestId: string, status: string, notes: string) => {
    const { error } = await supabase.rpc('admin_update_spin_status', {
      spin_management_id: requestId,
      new_status: status,
      admin_notes_text: notes
    });

    if (error) {
      toast.error('Failed to update spin request');
    } else {
      toast.success('Spin request updated successfully');
      fetchSpinRequests();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your platform</p>
        </div>
        <Button onClick={fetchAllData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCoins.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingWithdrawals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Flag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReports}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Spins</CardTitle>
            <Trophy className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todaySpins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="reports">
              <AlertCircle className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <DollarSign className="w-4 h-4 mr-2" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="spins">
              <RefreshCw className="w-4 h-4 mr-2" />
              Spins
            </TabsTrigger>
            <TabsTrigger value="diamonds">
              <Coins className="w-4 h-4 mr-2" />
              Diamonds
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Individual user cards with realtime updates</CardDescription>
                </div>
                <Button onClick={fetchUsers} size="sm" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <AdminUserCard
                        key={user.id}
                        user={user}
                        onUpdate={fetchUsers}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>Manage user-submitted reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {reports.map((report) => (
                    <Card key={report.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                report.status === 'resolved' ? 'default' :
                                report.status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {report.status}
                              </Badge>
                              <Badge variant={
                                report.priority === 'high' ? 'destructive' :
                                report.priority === 'medium' ? 'secondary' : 'outline'
                              }>
                                {report.priority}
                              </Badge>
                              <span className="text-xs text-muted-foreground">#{report.ticket_id}</span>
                            </div>
                            <h3 className="font-semibold">{report.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>By: {report.users.name} (@{report.users.username})</span>
                              <span>•</span>
                              <span>{format(new Date(report.created_at), 'PPp')}</span>
                            </div>
                          </div>
                        </div>
                        {report.status !== 'resolved' && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Admin response..."
                              id={`response-${report.id}`}
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const textarea = document.getElementById(`response-${report.id}`) as HTMLTextAreaElement;
                                  updateReportStatus(report.id, 'in_progress', textarea.value);
                                }}
                              >
                                Mark In Progress
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  const textarea = document.getElementById(`response-${report.id}`) as HTMLTextAreaElement;
                                  updateReportStatus(report.id, 'resolved', textarea.value);
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" /> Resolve
                              </Button>
                            </div>
                          </div>
                        )}
                        {report.admin_response && (
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm font-medium text-blue-900">Admin Response:</p>
                            <p className="text-sm text-blue-700 mt-1">{report.admin_response}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Manage user withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {withdrawals.map((withdrawal) => (
                    <Card key={withdrawal.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                withdrawal.status === 'completed' ? 'default' :
                                withdrawal.status === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {withdrawal.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">#{withdrawal.transaction_id}</span>
                            </div>
                            <p className="font-semibold">{withdrawal.users.name} (@{withdrawal.users.username})</p>
                            <p className="text-sm text-muted-foreground">{withdrawal.users.email}</p>
                            <div className="mt-2 space-y-1 text-sm">
                              <p><span className="text-muted-foreground">Amount:</span> {withdrawal.coin_amount} coins (Rs. {withdrawal.coin_amount / 10})</p>
                              <p><span className="text-muted-foreground">eSewa:</span> {withdrawal.esewa_number}</p>
                              <p><span className="text-muted-foreground">Requested:</span> {format(new Date(withdrawal.requested_at), 'PPp')}</p>
                            </div>
                          </div>
                        </div>
                        {withdrawal.status === 'pending' && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Admin notes (optional)..."
                              id={`withdrawal-notes-${withdrawal.id}`}
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  const textarea = document.getElementById(`withdrawal-notes-${withdrawal.id}`) as HTMLTextAreaElement;
                                  updateWithdrawalStatus(withdrawal.id, 'completed', textarea.value);
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve & Send Payment
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const textarea = document.getElementById(`withdrawal-notes-${withdrawal.id}`) as HTMLTextAreaElement;
                                  updateWithdrawalStatus(withdrawal.id, 'rejected', textarea.value);
                                }}
                              >
                                <X className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spin Requests Tab */}
        <TabsContent value="spins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spin Management Requests</CardTitle>
              <CardDescription>Manage user spin requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {spinRequests.map((request) => (
                    <Card key={request.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge variant={
                              request.status === 'approved' ? 'default' :
                              request.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {request.status}
                            </Badge>
                            <p className="font-semibold mt-2">{request.users.name} (@{request.users.username})</p>
                            <p className="text-sm text-muted-foreground">Requested Spin Time: {format(new Date(request.spin_time), 'PPp')}</p>
                            {request.admin_notes && (
                              <p className="text-sm text-muted-foreground mt-1">Notes: {request.admin_notes}</p>
                            )}
                          </div>
                        </div>
                        {request.status === 'pending' && (
                          <div className="space-y-2">
                            <Textarea
                              placeholder="Admin notes (optional)..."
                              id={`spin-notes-${request.id}`}
                              className="min-h-[60px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const textarea = document.getElementById(`spin-notes-${request.id}`) as HTMLTextAreaElement;
                                  updateSpinRequest(request.id, 'approved', textarea.value);
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  const textarea = document.getElementById(`spin-notes-${request.id}`) as HTMLTextAreaElement;
                                  updateSpinRequest(request.id, 'rejected', textarea.value);
                                }}
                              >
                                <X className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diamonds Tab */}
        <TabsContent value="diamonds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diamond Purchases</CardTitle>
              <CardDescription>View all diamond transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {diamondPurchases.map((purchase) => (
                    <Card key={purchase.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              purchase.payment_status === 'completed' ? 'default' :
                              purchase.payment_status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {purchase.payment_status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">#{purchase.transaction_id}</span>
                          </div>
                          <p className="font-semibold">{purchase.users.name} (@{purchase.users.username})</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p><span className="text-muted-foreground">Diamonds:</span> 💎 {purchase.diamonds_purchased}</p>
                            <p><span className="text-muted-foreground">Amount Paid:</span> Rs. {purchase.price_paid_rs}</p>
                            <p><span className="text-muted-foreground">Method:</span> {purchase.payment_method}</p>
                            <p><span className="text-muted-foreground">Date:</span> {format(new Date(purchase.created_at), 'PPp')}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};