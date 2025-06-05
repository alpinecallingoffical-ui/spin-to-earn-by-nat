
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WithdrawalHistory } from '@/components/WithdrawalHistory';
import { NotificationCenter } from '@/components/NotificationCenter';
import { EmailConfigModal } from '@/components/EmailConfigModal';
import { useNotifications } from '@/hooks/useNotifications';

interface WalletDisplayConnectedProps {
  onSwitchToHistory?: () => void;
}

export const WalletDisplayConnected: React.FC<WalletDisplayConnectedProps> = ({ onSwitchToHistory }) => {
  const { userData } = useUserData();
  const { user } = useAuth();
  const { toast } = useToast();
  const { unreadCount } = useNotifications();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);
  const [esewaNumber, setEsewaNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const coins = userData?.coins || 0;
  const minWithdrawCoins = 1000;
  const canWithdraw = coins >= minWithdrawCoins;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canWithdraw) return;

    setLoading(true);
    try {
      const coinAmount = parseInt(withdrawAmount);
      if (coinAmount > coins) {
        throw new Error('Insufficient coins');
      }

      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          esewa_number: esewaNumber,
          coin_amount: coinAmount,
        });

      if (error) throw error;

      toast({
        title: '✅ Withdrawal Request Submitted!',
        description: 'Your request will be reviewed within 24 hours.',
      });

      setIsWithdrawOpen(false);
      setEsewaNumber('');
      setWithdrawAmount('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-3xl">🪙</span>
          <span className="text-2xl font-bold text-white">Your Wallet</span>
          <div className="relative ml-4">
            <Button
              onClick={() => setIsNotificationOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </div>
          <Button
            onClick={() => setIsEmailConfigOpen(true)}
            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
            title="Configure Email Notifications"
          >
            📧
          </Button>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <p className="text-white/80 text-sm mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-yellow-300">{coins.toLocaleString()}</p>
          <p className="text-white/80 text-xs">coins</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={!canWithdraw}
            className={`py-3 rounded-xl font-semibold transition-all ${
              canWithdraw
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            💰 Withdraw
          </Button>
          
          <Button
            onClick={() => setIsHistoryOpen(true)}
            variant="outline"
            className="py-3 rounded-xl font-semibold bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            📊 History
          </Button>
        </div>

        {!canWithdraw && (
          <p className="text-white/70 text-xs mt-3">
            Minimum withdrawal: {minWithdrawCoins.toLocaleString()} coins
          </p>
        )}
      </div>

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="bg-gradient-to-br from-green-600 to-blue-600 text-white border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">💰 Withdraw to eSewa</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">eSewa Number</label>
              <Input
                type="tel"
                placeholder="98xxxxxxxx"
                value={esewaNumber}
                onChange={(e) => setEsewaNumber(e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Amount (Coins)</label>
              <Input
                type="number"
                placeholder={`Min: ${minWithdrawCoins}`}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={minWithdrawCoins}
                max={coins}
                required
                className="bg-white/20 border-white/30 text-white placeholder-white/70"
              />
              <p className="text-xs text-white/70 mt-1">
                {withdrawAmount && `≈ Rs. ${(parseInt(withdrawAmount) / 10).toFixed(2)}`}
              </p>
            </div>

            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-sm">💡 <strong>Exchange Rate:</strong> 10 coins = Rs. 1</p>
              <p className="text-xs text-white/80">Processing time: 24-48 hours</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
            >
              {loading ? '⏳ Processing...' : '💸 Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdrawal History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">💸 Withdrawal History</DialogTitle>
          </DialogHeader>
          <WithdrawalHistory />
        </DialogContent>
      </Dialog>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />

      {/* Email Configuration Modal */}
      <EmailConfigModal 
        isOpen={isEmailConfigOpen} 
        onClose={() => setIsEmailConfigOpen(false)} 
      />
    </>
  );
};
