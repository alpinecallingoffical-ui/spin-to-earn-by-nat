
import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SpinHistoryConnected: React.FC = () => {
  const { userData, spins, loading } = useUserData();

  // Get VIP level info
  const getVipLevel = (coins: number) => {
    if (coins >= 3000) return { level: 'Grand Master', multiplier: 10, isUnlimited: true };
    if (coins >= 2000) return { level: 'Elite Master', multiplier: 5, isUnlimited: false };
    if (coins >= 1000) return { level: 'VIP', multiplier: 2, isUnlimited: false };
    return { level: 'Regular', multiplier: 1, isUnlimited: false };
  };

  if (loading) {
    return (
      <div className="text-center text-white">
        <p>Loading spin history...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center text-white">
        <p>Please log in to view your spin history.</p>
      </div>
    );
  }

  const vipInfo = getVipLevel(userData.coins);
  const todaySpinCount = spins.length;
  const userSpinLimit = userData.daily_spin_limit || 5;

  return (
    <div className="space-y-6">
      {/* Spin Statistics Card */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center">
            📊 Today's Spin Statistics
            {vipInfo.level !== 'Regular' && (
              <span className="ml-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                {vipInfo.level}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Spins Used Today</p>
              <p className="text-white font-bold text-2xl">{todaySpinCount}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Daily Limit</p>
              <p className="text-white font-bold text-2xl flex items-center justify-center">
                {vipInfo.isUnlimited ? (
                  <span className="text-yellow-300 animate-pulse">♾️</span>
                ) : (
                  userSpinLimit
                )}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          {!vipInfo.isUnlimited && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>Progress</span>
                <span>{Math.round((todaySpinCount / userSpinLimit) * 100)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    todaySpinCount >= userSpinLimit 
                      ? 'bg-red-500' 
                      : 'bg-gradient-to-r from-green-400 to-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min((todaySpinCount / userSpinLimit) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* VIP Status Message */}
          {vipInfo.isUnlimited && (
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/50">
              <div className="text-center">
                <p className="text-yellow-300 font-bold animate-pulse">👑 UNLIMITED SPINS ACTIVE! 👑</p>
                <p className="text-white/90 text-sm">Grand Master level - Spin as much as you want!</p>
              </div>
            </div>
          )}
          
          {vipInfo.level === 'Elite Master' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl border border-blue-400/50">
              <div className="text-center">
                <p className="text-blue-300 font-bold">💎 Elite Master Benefits Active</p>
                <p className="text-white/90 text-sm">{userSpinLimit} daily spins with 5x multiplier</p>
              </div>
            </div>
          )}
          
          {vipInfo.level === 'VIP' && (
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl border border-yellow-400/50">
              <div className="text-center">
                <p className="text-yellow-300 font-bold">⭐ VIP Benefits Active</p>
                <p className="text-white/90 text-sm">{userSpinLimit} daily spins with 2x multiplier</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spin History */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">🎰 Today's Spin History</CardTitle>
        </CardHeader>
        <CardContent>
          {spins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/80">No spins today yet!</p>
              <p className="text-white/60 text-sm mt-2">Start spinning to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {spins.map((spin, index) => (
                <div 
                  key={spin.id} 
                  className="bg-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <p className="text-white font-semibold">Spin #{spins.length - index}</p>
                      <p className="text-white/70 text-sm">
                        {new Date(spin.spun_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-lg flex items-center">
                      +{spin.reward} 
                      <span className="ml-1 text-yellow-400">🪙</span>
                      {vipInfo.multiplier > 1 && (
                        <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                          x{vipInfo.multiplier}
                        </span>
                      )}
                    </p>
                    <p className="text-white/60 text-sm">Coins earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">📈 Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-white/80 text-xs">Total Coins</p>
              <p className="text-white font-bold text-lg">{userData.coins.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-white/80 text-xs">Today's Earnings</p>
              <p className="text-green-400 font-bold text-lg">
                {spins.reduce((total, spin) => total + spin.reward, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-white/80 text-xs">VIP Level</p>
              <p className="text-yellow-300 font-bold text-sm">{vipInfo.level}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
