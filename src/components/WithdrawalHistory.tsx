
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Withdrawal {
  id: string;
  coin_amount: number;
  esewa_number: string;
  status: string;
  requested_at: string;
}

export const WithdrawalHistory: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('user_id', user.id)
          .order('requested_at', { ascending: false });

        if (error) throw error;
        setWithdrawals(data || []);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border border-red-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-400/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-white text-lg">Loading withdrawal history...</div>
        </div>
      </div>
    );
  }

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.coin_amount, 0);

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-white text-lg font-bold mb-4 flex items-center">
        💸 All-Time Withdrawal History
      </h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Total Requests</p>
          <p className="text-white font-bold text-lg">{withdrawals.length}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Total Withdrawn</p>
          <p className="text-white font-bold text-lg">{totalWithdrawn.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Pending</p>
          <p className="text-white font-bold text-lg">{pendingWithdrawals}</p>
        </div>
      </div>
      
      {withdrawals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60 text-lg">💰</p>
          <p className="text-white/60">No withdrawals yet!</p>
          <p className="text-white/40 text-sm">Your withdrawal requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className="bg-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">💸</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{withdrawal.coin_amount.toLocaleString()} coins</p>
                    <p className="text-white/60 text-sm">
                      ≈ Rs. {(withdrawal.coin_amount / 10).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(withdrawal.status)}`}>
                    {getStatusIcon(withdrawal.status)} {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="text-white/60 text-sm space-y-1">
                <p>eSewa: {withdrawal.esewa_number}</p>
                <p>Requested: {formatDate(withdrawal.requested_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 bg-white/10 rounded-xl p-3">
        <p className="text-white/70 text-xs">
          💡 <strong>Processing Time:</strong> Withdrawals are typically processed within 24-48 hours
        </p>
      </div>
    </div>
  );
};
