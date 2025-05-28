
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SpinManagementRecord {
  id: string;
  user_id: string;
  original_spin_id: string | null;
  spin_time: string;
  reward_amount: number;
  status: string;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  spins_chance: number | null;
}

export const SpinManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<SpinManagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTime, setEditingTime] = useState<{ [key: string]: string }>({});
  const [editingChance, setEditingChance] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchSpinManagement();
  }, [user]);

  const fetchSpinManagement = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('spin_management')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching spin management:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch spin management records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSpinStatus = async (recordId: string, newStatus: 'approved' | 'rejected', adminNotes?: string) => {
    try {
      const { error } = await supabase.rpc('update_spin_status', {
        spin_management_id: recordId,
        new_status: newStatus,
        admin_notes: adminNotes || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Spin ${newStatus} successfully${newStatus === 'approved' ? ' and coins added' : ''}`,
      });

      fetchSpinManagement();
    } catch (error) {
      console.error('Error updating spin status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spin status',
        variant: 'destructive',
      });
    }
  };

  const updateSpinTime = async (recordId: string, newTime: string) => {
    try {
      const { error } = await supabase.rpc('update_spin_time', {
        spin_management_id: recordId,
        new_spin_time: newTime,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Spin time updated successfully',
      });

      setEditingTime(prev => ({ ...prev, [recordId]: '' }));
      fetchSpinManagement();
    } catch (error) {
      console.error('Error updating spin time:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spin time',
        variant: 'destructive',
      });
    }
  };

  const updateSpinChance = async (recordId: string, newChance: number) => {
    try {
      const { error } = await supabase
        .from('spin_management')
        .update({ spins_chance: newChance })
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Spin chance updated successfully',
      });

      setEditingChance(prev => ({ ...prev, [recordId]: 0 }));
      fetchSpinManagement();
    } catch (error) {
      console.error('Error updating spin chance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update spin chance',
        variant: 'destructive',
      });
    }
  };

  const createSpinRequest = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('spin_management')
        .insert({
          user_id: user.id,
          reward_amount: 10,
          status: 'pending',
          spins_chance: 5,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Spin request created successfully',
      });

      fetchSpinManagement();
    } catch (error) {
      console.error('Error creating spin request:', error);
      toast({
        title: 'Error',
        description: 'Failed to create spin request',
        variant: 'destructive',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-white text-lg">Loading spin management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-lg font-bold">🎰 Spin Management</h3>
          <Button
            onClick={createSpinRequest}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Create Spin Request
          </Button>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-lg">🎰</p>
            <p className="text-white/60">No spin management records yet!</p>
            <p className="text-white/40 text-sm">Create your first spin request</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white/10 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">🎰</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{record.reward_amount} coins</p>
                      <p className="text-white/60 text-sm">
                        Created: {formatDateTime(record.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Spin Time Editor */}
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm min-w-0 flex-shrink-0">Spin Time:</span>
                    {editingTime[record.id] !== undefined ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          type="datetime-local"
                          value={editingTime[record.id]}
                          onChange={(e) => setEditingTime(prev => ({ ...prev, [record.id]: e.target.value }))}
                          className="bg-white/20 border-white/30 text-white text-sm flex-1"
                        />
                        <Button
                          onClick={() => updateSpinTime(record.id, editingTime[record.id])}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                          disabled={!editingTime[record.id]}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingTime(prev => ({ ...prev, [record.id]: '' }))}
                          variant="outline"
                          className="bg-white/10 border-white/30 text-white px-3 py-1 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-white text-sm flex-1">
                          {formatDateTime(record.spin_time)}
                        </span>
                        <Button
                          onClick={() => setEditingTime(prev => ({ 
                            ...prev, 
                            [record.id]: new Date(record.spin_time).toISOString().slice(0, 16)
                          }))}
                          variant="outline"
                          className="bg-white/10 border-white/30 text-white px-3 py-1 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Spins Chance Editor */}
                  <div className="flex items-center space-x-2">
                    <span className="text-white/80 text-sm min-w-0 flex-shrink-0">Spins Chance:</span>
                    {editingChance[record.id] !== undefined ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={editingChance[record.id]}
                          onChange={(e) => setEditingChance(prev => ({ ...prev, [record.id]: parseInt(e.target.value) || 0 }))}
                          className="bg-white/20 border-white/30 text-white text-sm flex-1"
                        />
                        <Button
                          onClick={() => updateSpinChance(record.id, editingChance[record.id])}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-xs"
                          disabled={editingChance[record.id] < 1}
                        >
                          Save
                        </Button>
                        <Button
                          onClick={() => setEditingChance(prev => ({ ...prev, [record.id]: 0 }))}
                          variant="outline"
                          className="bg-white/10 border-white/30 text-white px-3 py-1 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-white text-sm flex-1">
                          {record.spins_chance || 5} daily spins
                        </span>
                        <Button
                          onClick={() => setEditingChance(prev => ({ 
                            ...prev, 
                            [record.id]: record.spins_chance || 5
                          }))}
                          variant="outline"
                          className="bg-white/10 border-white/30 text-white px-3 py-1 text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Status Actions */}
                  {record.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => updateSpinStatus(record.id, 'approved')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
                      >
                        ✅ Approve & Add Coins
                      </Button>
                      <Button
                        onClick={() => updateSpinStatus(record.id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm"
                      >
                        ❌ Reject
                      </Button>
                    </div>
                  )}

                  {record.admin_notes && (
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="text-white/80 text-xs font-semibold mb-1">Admin Notes:</p>
                      <p className="text-white/60 text-xs">{record.admin_notes}</p>
                    </div>
                  )}

                  {record.processed_at && (
                    <p className="text-white/60 text-xs">
                      Processed: {formatDateTime(record.processed_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
