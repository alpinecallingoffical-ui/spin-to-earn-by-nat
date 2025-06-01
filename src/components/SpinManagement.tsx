
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface SpinManagementRecord {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  spin_time: string;
  admin_notes?: string;
  spins_chance?: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  daily_spin_limit: number;
}

export const SpinManagement: React.FC = () => {
  const [records, setRecords] = useState<SpinManagementRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const { toast } = useToast();

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('spin_management')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch spin management records',
        variant: 'destructive',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, coins, daily_spin_limit')
        .order('coins', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRecords(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const updateSpinStatus = async (id: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase.rpc('update_spin_status', {
        spin_management_id: id,
        new_status: status,
        admin_notes: notes,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Request ${status} successfully`,
      });

      await fetchRecords();
      await fetchUsers(); // Refresh users to show updated coins
    } catch (error) {
      console.error('Error updating spin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update request status',
        variant: 'destructive',
      });
    }
  };

  const updateUserSpinLimit = async (userId: string, newLimit: number) => {
    try {
      const { error } = await supabase.rpc('update_user_spin_limit', {
        target_user_id: userId,
        new_limit: newLimit,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Spin limit updated successfully',
      });

      await fetchUsers();
    } catch (error) {
      console.error('Error updating spin limit:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spin limit',
        variant: 'destructive',
      });
    }
  };

  const getVipLevel = (coins: number) => {
    if (coins >= 3000) return { level: 'Grand Master', color: 'bg-gradient-to-r from-purple-600 to-pink-600', emoji: '👑' };
    if (coins >= 2000) return { level: 'Elite Master', color: 'bg-gradient-to-r from-blue-600 to-purple-600', emoji: '💎' };
    if (coins >= 1000) return { level: 'VIP', color: 'bg-gradient-to-r from-yellow-500 to-orange-500', emoji: '⭐' };
    return { level: 'Regular', color: 'bg-gray-500', emoji: '🎰' };
  };

  const getVipFeatures = (coins: number) => {
    if (coins >= 3000) return ['Unlimited daily spins', 'Priority support', 'Exclusive rewards', 'Grand Master badge'];
    if (coins >= 2000) return ['10 daily spins', 'Priority support', 'Elite rewards', 'Elite Master badge'];
    if (coins >= 1000) return ['8 daily spins', 'VIP support', 'Bonus rewards', 'VIP badge'];
    return ['5 daily spins', 'Standard support'];
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <p>Loading management data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h2 className="text-white text-2xl font-bold mb-4">🔧 Spin Management</h2>
        
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveTab('requests')}
            className={`${activeTab === 'requests' ? 'bg-blue-600' : 'bg-white/20'} text-white`}
          >
            📋 Spin Requests
          </Button>
          <Button
            onClick={() => setActiveTab('users')}
            className={`${activeTab === 'users' ? 'bg-blue-600' : 'bg-white/20'} text-white`}
          >
            👥 User Management
          </Button>
        </div>

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-white/80">No spin requests found.</p>
            ) : (
              records.map((record) => (
                <div key={record.id} className="bg-white/10 rounded-xl p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-white font-semibold">User ID: {record.user_id.slice(0, 8)}...</p>
                      <p className="text-white/80">Amount: {record.amount} coins</p>
                      <p className="text-white/80">Date: {new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <Badge 
                        className={`${
                          record.status === 'approved' ? 'bg-green-500' :
                          record.status === 'rejected' ? 'bg-red-500' :
                          'bg-yellow-500'
                        } text-white`}
                      >
                        {record.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div>
                      {record.admin_notes && (
                        <p className="text-white/80 text-sm">Notes: {record.admin_notes}</p>
                      )}
                    </div>
                    
                    {record.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => updateSpinStatus(record.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1"
                        >
                          ✅ Approve
                        </Button>
                        <Button
                          onClick={() => updateSpinStatus(record.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1"
                        >
                          ❌ Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-white/80">No users found.</p>
            ) : (
              users.map((user) => {
                const vipInfo = getVipLevel(user.coins);
                const features = getVipFeatures(user.coins);
                
                return (
                  <div key={user.id} className="bg-white/10 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-white font-semibold">{user.name}</h3>
                          <div className={`${vipInfo.color} text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1`}>
                            <span>{vipInfo.emoji}</span>
                            <span>{vipInfo.level}</span>
                          </div>
                        </div>
                        <p className="text-white/80">{user.email}</p>
                        <p className="text-white/80">💰 {user.coins} coins</p>
                        <p className="text-white/80">🎲 {user.daily_spin_limit} daily spins</p>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-semibold mb-2">🎁 Features:</h4>
                        <ul className="text-white/80 text-sm space-y-1">
                          {features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <label className="text-white/80 text-sm block mb-2">Change Daily Spin Limit:</label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            defaultValue={user.daily_spin_limit}
                            className="bg-white/20 border-white/30 text-white placeholder-white/50 w-20"
                            min="1"
                            max="50"
                            onChange={(e) => {
                              const newLimit = parseInt(e.target.value);
                              if (newLimit && newLimit !== user.daily_spin_limit) {
                                updateUserSpinLimit(user.id, newLimit);
                              }
                            }}
                          />
                          <div className="text-white/60 text-sm mt-1">
                            Recommended: {user.coins >= 3000 ? '50' : user.coins >= 2000 ? '10' : user.coins >= 1000 ? '8' : '5'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
