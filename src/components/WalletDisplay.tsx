
import React from 'react';
import { Button } from '@/components/ui/button';

interface WalletDisplayProps {
  coins: number;
}

export const WalletDisplay: React.FC<WalletDisplayProps> = ({ coins }) => {
  const minWithdrawCoins = 1000;
  const canWithdraw = coins >= minWithdrawCoins;

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center shadow-xl">
      <div className="flex items-center justify-center space-x-2 mb-4">
        <span className="text-3xl">🪙</span>
        <span className="text-2xl font-bold text-white">Your Wallet</span>
      </div>
      
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <p className="text-white/80 text-sm mb-1">Current Balance</p>
        <p className="text-4xl font-bold text-yellow-300">{coins.toLocaleString()}</p>
        <p className="text-white/80 text-xs">coins</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
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
  );
};
