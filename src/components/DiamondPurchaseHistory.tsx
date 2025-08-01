import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface DiamondPurchase {
  id: string;
  package_id: string;
  diamonds_purchased: number;
  price_paid_rs: number;
  created_at: string;
  completed_at?: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  esewa_payment_id?: string;
}

interface DiamondPackage {
  id: string;
  name: string;
  description?: string;
}

export const DiamondPurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<DiamondPurchase[]>([]);
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch purchases
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('diamond_purchases')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (purchaseError) throw purchaseError;

        // Fetch packages for reference
        const { data: packageData, error: packageError } = await supabase
          .from('diamond_packages')
          .select('id, name, description');

        if (packageError) throw packageError;

        setPurchases(purchaseData || []);
        setPackages(packageData || []);
      } catch (error) {
        console.error('Error fetching diamond purchase history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      case 'failed':
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
      case 'failed':
        return '❌';
      default:
        return '📄';
    }
  };

  const getPackageName = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    return pkg?.name || 'Unknown Package';
  };

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="text-center py-8">
          <div className="text-white text-lg">Loading purchase history...</div>
        </div>
      </div>
    );
  }

  const totalSpent = purchases
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.price_paid_rs, 0);

  const totalDiamonds = purchases
    .filter(p => p.payment_status === 'completed')
    .reduce((sum, p) => sum + p.diamonds_purchased, 0);

  const pendingPurchases = purchases.filter(p => p.payment_status === 'pending').length;

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
      <h3 className="text-white text-lg font-bold mb-4 flex items-center">
        💎 Diamond Purchase History
        <span className="text-sm font-normal text-white/70 ml-2">
          View your diamond purchase history and payment status
        </span>
      </h3>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Total Purchases</p>
          <p className="text-white font-bold text-lg">{purchases.length}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Total Spent</p>
          <p className="text-white font-bold text-lg">Rs. {totalSpent}</p>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <p className="text-white/80 text-sm">Diamonds Earned</p>
          <p className="text-white font-bold text-lg">{totalDiamonds}💎</p>
        </div>
      </div>
      
      {purchases.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60 text-lg">💎</p>
          <p className="text-white/60">No diamond purchases yet!</p>
          <p className="text-white/40 text-sm">Your diamond purchase history will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {purchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white/10 rounded-xl p-4 border border-white/20"
            >
              {/* Header with package info and status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">💎</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{getPackageName(purchase.package_id)}</p>
                    <p className="text-white/60 text-sm">
                      {purchase.diamonds_purchased} diamonds • Rs. {purchase.price_paid_rs}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(purchase.payment_status)}`}>
                    {getStatusIcon(purchase.payment_status)} {purchase.payment_status.charAt(0).toUpperCase() + purchase.payment_status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Bill Details */}
              <div className="bg-white/5 rounded-lg p-3 mb-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/50">Transaction ID</p>
                    <p className="text-white/80 font-mono text-xs break-all">
                      {purchase.transaction_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Payment Method</p>
                    <p className="text-white/80 flex items-center gap-1">
                      <img src="/lovable-uploads/6d2e49b8-6015-4603-a887-6dba4d22641d.png" alt="eSewa" className="w-4 h-4" />
                      {purchase.payment_method.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50">Purchase Date</p>
                    <p className="text-white/80">{formatDate(purchase.created_at)}</p>
                  </div>
                  {purchase.completed_at && (
                    <div>
                      <p className="text-white/50">Completed</p>
                      <p className="text-white/80">{formatDate(purchase.completed_at)}</p>
                    </div>
                  )}
                  {purchase.esewa_payment_id && (
                    <div className="col-span-2">
                      <p className="text-white/50">eSewa Payment ID</p>
                      <p className="text-white/80 font-mono text-xs break-all">
                        {purchase.esewa_payment_id}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Purchase Breakdown */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Package:</span>
                    <span className="text-white">{getPackageName(purchase.package_id)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Diamonds:</span>
                    <span className="text-purple-300">{purchase.diamonds_purchased} 💎</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-white/60">Amount Paid:</span>
                    <span className="text-white">Rs. {purchase.price_paid_rs}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold pt-1 border-t border-white/10">
                    <span className="text-green-400">Status:</span>
                    <span className={`${purchase.payment_status === 'completed' ? 'text-green-400' : purchase.payment_status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                      {purchase.payment_status.charAt(0).toUpperCase() + purchase.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment Information */}
              {purchase.payment_status === 'completed' && (
                <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-2">
                  <p className="text-green-300 text-xs font-semibold mb-1">✅ Payment Successful</p>
                  <p className="text-green-200 text-xs">
                    Your {purchase.diamonds_purchased} diamonds have been added to your account successfully!
                  </p>
                </div>
              )}
              
              {purchase.payment_status === 'pending' && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-2">
                  <p className="text-yellow-300 text-xs font-semibold mb-1">⏳ Payment Processing</p>
                  <p className="text-yellow-200 text-xs">
                    Your payment is being processed. Diamonds will be added once payment is confirmed.
                  </p>
                </div>
              )}
              
              {purchase.payment_status === 'failed' && (
                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-2">
                  <p className="text-red-300 text-xs font-semibold mb-1">❌ Payment Failed</p>
                  <p className="text-red-200 text-xs">
                    Payment could not be processed. Please try again or contact support.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 bg-white/10 rounded-xl p-3">
        <p className="text-white/70 text-xs">
          💡 <strong>Note:</strong> Diamond purchases are processed instantly upon successful payment verification
        </p>
      </div>
    </div>
  );
};