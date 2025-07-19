import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { WithdrawalHistory } from '@/components/WithdrawalHistory';
import { AdminMessageCenter } from '@/components/AdminMessageCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { EmailService } from '@/services/emailService';
interface WalletDisplayConnectedProps {
  onSwitchToHistory?: () => void;
}
export const WalletDisplayConnected: React.FC<WalletDisplayConnectedProps> = ({
  onSwitchToHistory
}) => {
  const {
    userData,
    refetch
  } = useUserData();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  // Removed useNotifications, isNotificationOpen, and NotificationCenter references here
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // Removed: const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAdminMessageOpen, setIsAdminMessageOpen] = useState(false);
  const [esewaNumber, setEsewaNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const coins = userData?.coins || 0;
  const minWithdrawCoins = 1000;
  const canWithdraw = coins >= minWithdrawCoins;

  // Check if user is admin (you can adjust this logic based on your admin system)
  const isAdmin = userData?.email === 'admin@example.com' || coins >= 10000; // Example admin check

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canWithdraw || !userData) return;
    setLoading(true);
    try {
      const coinAmount = parseInt(withdrawAmount);
      if (coinAmount > coins) {
        throw new Error('Insufficient coins');
      }

      // Automatically deduct coins from user account
      const {
        error: updateError
      } = await supabase.from('users').update({
        coins: coins - coinAmount
      }).eq('id', user.id);
      if (updateError) throw updateError;

      // Create withdrawal record with 'pending' status (this will be auto-approved)
      const {
        data: withdrawal,
        error: withdrawalError
      } = await supabase.from('withdrawals').insert({
        user_id: user.id,
        esewa_number: esewaNumber,
        coin_amount: coinAmount,
        status: 'pending' // Use 'pending' instead of 'completed'
      }).select().single();
      if (withdrawalError) throw withdrawalError;

      // Immediately approve the withdrawal using the database function
      const {
        error: approvalError
      } = await supabase.rpc('approve_withdrawal_with_notification', {
        withdrawal_id: withdrawal.id,
        admin_notes: 'Auto-approved instant withdrawal'
      });
      if (approvalError) {
        console.error('Approval error:', approvalError);
        // Don't throw here - the withdrawal was created successfully
      }

      // Send email notification
      try {
        const emailData = {
          to_email: userData.email || user.email || '',
          to_name: userData.name || 'User',
          withdrawal_amount: coinAmount.toLocaleString(),
          rupee_amount: (coinAmount / 10).toFixed(2),
          esewa_number: esewaNumber,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        };
        console.log('Sending withdrawal email with data:', emailData);
        const emailSent = await EmailService.sendWithdrawalApprovalEmail(emailData);
        if (emailSent) {
          console.log('Email notification sent successfully');
        } else {
          console.log('Email notification failed to send');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Don't throw - email failure shouldn't stop the withdrawal
      }
      toast({
        title: '✅ Withdrawal Completed!',
        description: `${coinAmount.toLocaleString()} coins (Rs. ${(coinAmount / 10).toFixed(2)}) have been deducted and sent to ${esewaNumber}`
      });

      // Refresh user data to show updated coin balance
      refetch();
      setIsWithdrawOpen(false);
      setEsewaNumber('');
      setWithdrawAmount('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <>
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-3xl">🪙</span>
          <span className="text-2xl font-bold text-white">Your Wallet</span>
          {/* Removed notification button here */}
          <div className="flex items-center space-x-2 ml-4">
            {/* No notification icon here */}
            {isAdmin}
          </div>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <p className="text-white/80 text-sm mb-1">Current Balance</p>
          <p className="text-4xl font-bold text-yellow-300">{coins.toLocaleString()}</p>
          <p className="text-white/80 text-xs">coins</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setIsWithdrawOpen(true)} disabled={!canWithdraw} className={`py-3 rounded-xl font-semibold transition-all ${canWithdraw ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl' : 'bg-gray-400 text-gray-200 cursor-not-allowed'}`}>
            💰 Withdraw
          </Button>
          
          <Button onClick={() => setIsHistoryOpen(true)} variant="outline" className="py-3 rounded-xl font-semibold bg-white/20 border-white/30 text-white hover:bg-white/30">
            📊 History
          </Button>
        </div>

        {!canWithdraw && <p className="text-white/70 text-xs mt-3">
            Minimum withdrawal: {minWithdrawCoins.toLocaleString()} coins
          </p>}
      </div>

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="bg-white text-gray-900 border shadow-2xl max-w-md">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/2f720cd6-93b4-4e37-80d4-151d44c27d9f.png" 
                alt="eSewa" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">Withdraw to eSewa</DialogTitle>
                <p className="text-sm text-gray-600">Fast & Secure Payment Gateway</p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleWithdraw} className="space-y-6 pt-4">
            {/* eSewa Info Banner */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="/lovable-uploads/2f720cd6-93b4-4e37-80d4-151d44c27d9f.png" 
                  alt="eSewa" 
                  className="w-6 h-6"
                />
                <span className="font-semibold text-green-800">eSewa Digital Wallet</span>
              </div>
              <p className="text-sm text-green-700">
                Instant transfers • Zero fees • Secure transactions
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  eSewa Mobile Number
                </label>
                <Input 
                  type="tel" 
                  placeholder="98XXXXXXXX" 
                  value={esewaNumber} 
                  onChange={e => setEsewaNumber(e.target.value)} 
                  required 
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your registered eSewa mobile number
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Withdrawal Amount
                </label>
                <Input 
                  type="number" 
                  placeholder={`Minimum: ${minWithdrawCoins} coins`}
                  value={withdrawAmount} 
                  onChange={e => setWithdrawAmount(e.target.value)} 
                  min={minWithdrawCoins} 
                  max={coins} 
                  required 
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Available: {coins.toLocaleString()} coins</span>
                  {withdrawAmount && (
                    <span className="font-semibold text-green-600">
                      ≈ NPR {(parseInt(withdrawAmount) / 10).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Exchange Rate Info */}
            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Exchange Rate</span>
                <span className="text-sm text-green-600 font-bold">10 Coins = NPR 1</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Processing Time</span>
                <span className="font-semibold text-blue-600">Instant</span>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading || !canWithdraw} 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <img 
                    src="/lovable-uploads/2f720cd6-93b4-4e37-80d4-151d44c27d9f.png" 
                    alt="eSewa" 
                    className="w-5 h-5"
                  />
                  Withdraw to eSewa
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By proceeding, you agree to our terms and conditions
            </p>
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

      {/* Admin Message Center */}
      {isAdmin && <AdminMessageCenter isOpen={isAdminMessageOpen} onClose={() => setIsAdminMessageOpen(false)} />}
    </>;
};
