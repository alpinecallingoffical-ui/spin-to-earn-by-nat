
import React from 'react';

interface SpinHistoryProps {
  history: Array<{
    id: string;
    amount: number;
    timestamp: Date;
  }>;
}

export const SpinHistory: React.FC<SpinHistoryProps> = ({ history }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats Card */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center">
          📊 Your Stats
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-white/80 text-sm">Today's Spins</p>
            <p className="text-white font-bold text-xl">{history.length}</p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-sm">Total Won</p>
            <p className="text-white font-bold text-xl">
              {history.reduce((sum, spin) => sum + spin.amount, 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-white/80 text-sm">Best Spin</p>
            <p className="text-white font-bold text-xl">
              {history.length > 0 ? Math.max(...history.map(s => s.amount)) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">📜 Recent Spins</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 text-lg">🎰</p>
            <p className="text-white/60">No spins yet!</p>
            <p className="text-white/40 text-sm">Start spinning to see your history</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((spin) => (
              <div
                key={spin.id}
                className="bg-white/10 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">🪙</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">+{spin.amount} coins</p>
                    <p className="text-white/60 text-sm">
                      {formatDate(spin.timestamp)} at {formatTime(spin.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    spin.amount >= 50 
                      ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                      : spin.amount >= 20
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-gray-500/20 text-gray-300 border border-gray-400/30'
                  }`}>
                    {spin.amount >= 50 ? '🔥 Big Win!' : spin.amount >= 20 ? '✨ Good!' : '🎯 Nice!'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Badge */}
      {history.length >= 5 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-center">
          <p className="text-white font-bold text-lg">🏆 Achievement Unlocked!</p>
          <p className="text-white/80">Daily Spinner - Completed 5 spins today</p>
        </div>
      )}
    </div>
  );
};
