import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import { useVipBenefits } from '@/hooks/useVipBenefits';
import { VerifiedBadge } from './VerifiedBadge';

export const BenefitsSection = () => {
  const { userData } = useUserData();
  const { getTotalMultiplierSavings, getTodaysBenefits } = useVipBenefits();

  const getVipLevel = (coins: number) => {
    if (coins >= 3000) return { 
      level: 'Grand Master', 
      color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600', 
      emoji: '👑',
      nextLevel: null,
      progress: 100,
      animation: 'animate-pulse',
      glow: 'shadow-2xl shadow-purple-500/50',
      isVerified: true
    };
    if (coins >= 2000) return { 
      level: 'Elite Master', 
      color: 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600', 
      emoji: '💎',
      nextLevel: 'Grand Master',
      progress: ((coins - 2000) / 1000) * 100,
      animation: 'animate-bounce',
      glow: 'shadow-xl shadow-blue-500/50',
      isVerified: false
    };
    if (coins >= 1000) return { 
      level: 'VIP', 
      color: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500', 
      emoji: '⭐',
      nextLevel: 'Elite Master',
      progress: ((coins - 1000) / 1000) * 100,
      animation: 'animate-pulse',
      glow: 'shadow-lg shadow-yellow-500/50',
      isVerified: false
    };
    return { 
      level: 'Regular', 
      color: 'bg-gray-500', 
      emoji: '🎰',
      nextLevel: 'VIP',
      progress: (coins / 1000) * 100,
      animation: '',
      glow: '',
      isVerified: false
    };
  };

  const getVipFeatures = (coins: number) => {
    const todaysBenefits = getTodaysBenefits();
    const multiplierSavings = getTotalMultiplierSavings();
    
    if (coins >= 3000) return [
      { text: `🎰 Unlimited daily spins`, status: 'ACTIVE', special: true, used: false },
      { text: `🎯 Priority support`, status: 'ACTIVE', special: true, used: false },
      { text: `🎁 Exclusive Grand Master rewards`, status: 'ACTIVE', special: true, used: false },
      { text: `👑 Grand Master badge & crown`, status: 'ACTIVE', special: true, used: false },
      { text: `💫 Special rainbow animations`, status: 'ACTIVE', special: true, used: false },
      { text: `🌟 VIP chat access`, status: 'ACTIVE', special: true, used: false },
      { text: `🔥 10x bonus multiplier`, status: 'ACTIVE', special: true, used: todaysBenefits.length > 0, savings: multiplierSavings },
      { text: `💰 Daily bonus coins`, status: 'ACTIVE', special: true, used: false },
      { text: `✅ Verified status`, status: 'ACTIVE', special: true, used: false }
    ];
    if (coins >= 2000) return [
      { text: `🎰 15 daily spins`, status: 'ACTIVE', special: true, used: false },
      { text: `🎯 Priority support`, status: 'ACTIVE', special: true, used: false },
      { text: `🎁 Elite Master rewards`, status: 'ACTIVE', special: true, used: false },
      { text: `💎 Elite Master badge`, status: 'ACTIVE', special: true, used: false },
      { text: `✨ Enhanced blue animations`, status: 'ACTIVE', special: true, used: false },
      { text: `🎨 Custom blue themes`, status: 'ACTIVE', special: true, used: false },
      { text: `🚀 5x bonus multiplier`, status: 'ACTIVE', special: true, used: todaysBenefits.length > 0, savings: multiplierSavings },
      { text: `💝 Weekly bonus rewards`, status: 'ACTIVE', special: true, used: false }
    ];
    if (coins >= 1000) return [
      { text: `🎰 10 daily spins`, status: 'ACTIVE', special: true, used: false },
      { text: `🎯 VIP support`, status: 'ACTIVE', special: true, used: false },
      { text: `🎁 VIP bonus rewards`, status: 'ACTIVE', special: true, used: false },
      { text: `⭐ VIP golden badge`, status: 'ACTIVE', special: true, used: false },
      { text: `🌟 Golden animations`, status: 'ACTIVE', special: true, used: false },
      { text: `🎵 VIP sound effects`, status: 'ACTIVE', special: true, used: false },
      { text: `💰 2x bonus multiplier`, status: 'ACTIVE', special: true, used: todaysBenefits.length > 0, savings: multiplierSavings },
      { text: `🎉 Special celebrations`, status: 'ACTIVE', special: true, used: false }
    ];
    return [
      { text: '🎰 5 daily spins', status: 'STANDARD', special: false, used: false },
      { text: '🎯 Standard support', status: 'STANDARD', special: false, used: false }
    ];
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48">
        <span className="text-white text-2xl mb-2">🎁</span>
        <p className="text-white">Loading benefits...</p>
      </div>
    );
  }

  const vipInfo = getVipLevel(userData?.coins || 0);
  const features = getVipFeatures(userData?.coins || 0);

  return (
    <div className="space-y-6">
      {/* VIP Status Card */}
      <div className={`${vipInfo.color} ${vipInfo.glow} rounded-2xl p-6 text-white relative overflow-hidden ${vipInfo.animation}`}>
        {/* Enhanced animated background for VIP levels */}
        {(userData?.coins || 0) >= 1000 && (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform skew-x-12 animate-pulse"></div>
            {(userData?.coins || 0) >= 3000 && (
              <>
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-300 to-transparent transform -skew-x-12 animate-pulse delay-1000"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-500"></div>
                <div className="absolute bottom-8 left-12 w-3 h-3 bg-pink-300 rounded-full animate-ping delay-1000"></div>
              </>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`text-4xl ${(userData?.coins || 0) >= 1000 ? 'animate-bounce' : ''}`}>
              {vipInfo.emoji}
              {(userData?.coins || 0) >= 3000 && <span className="ml-2 animate-spin">✨</span>}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                {vipInfo.level}
                {vipInfo.isVerified && (
                  <VerifiedBadge size="lg" className="ml-2" />
                )}
                {(userData?.coins || 0) >= 3000 && <span className="ml-2 text-yellow-300 animate-pulse">♔</span>}
              </h2>
              <p className="text-white/80">
                {(userData?.coins || 0) >= 3000 ? 'VERIFIED GRAND MASTER!' : 'Status Level'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold flex items-center">
              {(userData?.coins || 0).toLocaleString()}
              {(userData?.coins || 0) >= 1000 && <span className="ml-2 text-yellow-300 animate-pulse">💰</span>}
            </p>
            <p className="text-white/80">Total Coins</p>
          </div>
        </div>
        
        {vipInfo.nextLevel && (
          <div className="relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {vipInfo.nextLevel}</span>
              <span className="font-bold">{Math.round(vipInfo.progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500 animate-pulse"
                style={{ width: `${Math.min(vipInfo.progress, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced VIP Features */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center">
          🎁 Your {vipInfo.level} Benefits
          {(userData?.coins || 0) >= 3000 && <span className="ml-2 animate-spin">👑</span>}
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {features.map((feature, index) => (
            <div key={index} className={`rounded-xl p-4 flex items-center justify-between transition-all duration-300 ${
              feature.special 
                ? 'bg-gradient-to-r from-green-500/30 to-blue-500/30 border border-green-400/50 shadow-lg' 
                : 'bg-white/10'
            }`}>
              <span className={`font-semibold ${
                feature.special 
                  ? 'text-green-200' 
                  : 'text-white/70'
              }`}>
                {feature.text}
              </span>
              <div className="flex items-center space-x-2">
                {feature.special && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
                    {feature.status}
                  </span>
                )}
                {feature.used && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    USED TODAY
                  </span>
                )}
                {feature.savings && feature.savings > 0 && (
                  <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                    +{feature.savings} bonus
                  </span>
                )}
                {feature.special && <span className="text-green-400 animate-bounce">✨</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Special VIP Level Messages */}
        {(userData?.coins || 0) >= 3000 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl border border-purple-400/50">
            <div className="text-center">
              <p className="text-yellow-300 font-bold text-lg animate-pulse flex items-center justify-center">
                🎉 CONGRATULATIONS! 🎉 
                <VerifiedBadge size="lg" className="ml-2" />
              </p>
              <p className="text-white/90">You've reached the highest level - Verified Grand Master!</p>
              <p className="text-purple-300 text-sm mt-2">Enjoy unlimited spins, verified status, and exclusive rewards!</p>
            </div>
          </div>
        )}
        
        {(userData?.coins || 0) >= 2000 && (userData?.coins || 0) < 3000 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl border border-blue-400/50">
            <div className="text-center">
              <p className="text-blue-300 font-bold animate-pulse">💎 Elite Master Status Active! 💎</p>
              <p className="text-white/90">Only {3000 - (userData?.coins || 0)} more coins to Verified Grand Master!</p>
            </div>
          </div>
        )}
        
        {(userData?.coins || 0) >= 1000 && (userData?.coins || 0) < 2000 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl border border-yellow-400/50">
            <div className="text-center">
              <p className="text-yellow-300 font-bold animate-pulse">⭐ VIP Status Active! ⭐</p>
              <p className="text-white/90">Only {2000 - (userData?.coins || 0)} more coins to Elite Master!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};