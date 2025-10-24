import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, FileText, Ban, UserCheck, DollarSign, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(usersData || []);

      // Fetch reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false });
      setReports(reportsData || []);

      // Fetch withdrawals
      const { data: withdrawalsData } = await supabase
        .from('withdrawals')
        .select('*, users(name, email)')
        .order('requested_at', { ascending: false });
      setWithdrawals(withdrawalsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, banned: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned })
        .eq('id', userId);

      if (error) throw error;
      toast.success(banned ? 'User banned successfully' : 'User unbanned successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error updating user ban status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleUpdateReport = async (reportId: string, status: string, adminResponse: string) => {
    try {
      const updates: any = { status };
      if (adminResponse.trim()) {
        updates.admin_response = adminResponse;
      }
      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', reportId);

      if (error) throw error;
      toast.success('Report updated successfully');
      fetchAllData();
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button onClick={fetchAllData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {withdrawals.filter(w => w.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.banned).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                        </div>
                        <div className="flex gap-2">
                          {user.banned ? (
                            <Badge variant="destructive">Banned</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Coins: <span className="font-semibold">{user.coins}</span></div>
                        <div>Diamonds: <span className="font-semibold">{user.diamonds}</span></div>
                        <div>Daily Spins: <span className="font-semibold">{user.daily_spin_limit}</span></div>
                        <div>Referral: <span className="font-mono text-xs">{user.referral_code}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={user.banned ? "outline" : "destructive"}
                          onClick={() => handleBanUser(user.id, !user.banned)}
                        >
                          {user.banned ? <UserCheck className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                          {user.banned ? 'Unban' : 'Ban'} User
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Report Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onUpdate={handleUpdateReport}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{withdrawal.users?.name}</h4>
                          <p className="text-sm text-muted-foreground">{withdrawal.users?.email}</p>
                        </div>
                        <Badge>{withdrawal.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Coins: <span className="font-semibold">{withdrawal.coin_amount}</span></div>
                        <div>Rupees: <span className="font-semibold">Rs. {withdrawal.coin_amount / 10}</span></div>
                        <div>eSewa: <span className="font-mono">{withdrawal.esewa_number}</span></div>
                        <div>Transaction: <span className="font-mono text-xs">{withdrawal.transaction_id}</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Requested: {new Date(withdrawal.requested_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Report Card Component
const ReportCard: React.FC<{ report: any; onUpdate: (id: string, status: string, response: string) => void }> = ({ report, onUpdate }) => {
  const [status, setStatus] = useState(report.status);
  const [adminResponse, setAdminResponse] = useState(report.admin_response || '');

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">{report.ticket_id}</code>
          <h4 className="font-semibold mt-2">{report.title}</h4>
          <p className="text-sm text-muted-foreground">{report.users?.name} ({report.users?.email})</p>
        </div>
        <Badge>{report.priority}</Badge>
      </div>
      
      <p className="text-sm">{report.description}</p>
      
      {report.image_urls && report.image_urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {report.image_urls.map((url: string, idx: number) => (
            <img key={idx} src={url} alt={`Report ${idx + 1}`} className="w-full h-20 object-cover rounded" />
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          value={adminResponse}
          onChange={(e) => setAdminResponse(e.target.value)}
          placeholder="Admin response..."
          rows={2}
        />

        <Button
          size="sm"
          onClick={() => onUpdate(report.id, status, adminResponse)}
          disabled={status === report.status && adminResponse === (report.admin_response || '')}
        >
          Update Report
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Created: {new Date(report.created_at).toLocaleString()}
      </p>
    </div>
  );
};
