import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useVipBenefits } from '@/hooks/useVipBenefits';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { VerifiedBadge } from './VerifiedBadge';
import { AvatarDisplay } from './AvatarDisplay';
import { PowerUpManager } from './PowerUpManager';
interface UserProfileConnectedProps {
  onSwitchToHistory?: () => void;
}
export const UserProfileConnected: React.FC<UserProfileConnectedProps> = ({
  onSwitchToHistory
}) => {
  const {
    userData,
    refetch
  } = useUserData();
  const {
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    getTotalMultiplierSavings,
    getTodaysBenefits
  } = useVipBenefits();
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
      progress: (coins - 2000) / 1000 * 100,
      animation: 'animate-bounce',
      glow: 'shadow-xl shadow-blue-500/50',
      isVerified: false
    };
    if (coins >= 1000) return {
      level: 'VIP',
      color: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
      emoji: '⭐',
      nextLevel: 'Elite Master',
      progress: (coins - 1000) / 1000 * 100,
      animation: 'animate-pulse',
      glow: 'shadow-lg shadow-yellow-500/50',
      isVerified: false
    };
    return {
      level: 'Regular',
      color: 'bg-gray-500',
      emoji: '🎰',
      nextLevel: 'VIP',
      progress: coins / 1000 * 100,
      animation: '',
      glow: '',
      isVerified: false
    };
  };
  const getVipFeatures = (coins: number) => {
    const todaysBenefits = getTodaysBenefits();
    const multiplierSavings = getTotalMultiplierSavings();
    if (coins >= 3000) return [{
      text: `🎰 Unlimited daily spins`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎯 Priority support`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎁 Exclusive Grand Master rewards`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `👑 Grand Master badge & crown`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `💫 Special rainbow animations`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🌟 VIP chat access`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🔥 10x bonus multiplier`,
      status: 'ACTIVE',
      special: true,
      used: todaysBenefits.length > 0,
      savings: multiplierSavings
    }, {
      text: `💰 Daily bonus coins`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `✅ Verified status`,
      status: 'ACTIVE',
      special: true,
      used: false
    }];
    if (coins >= 2000) return [{
      text: `🎰 15 daily spins`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎯 Priority support`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎁 Elite Master rewards`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `💎 Elite Master badge`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `✨ Enhanced blue animations`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎨 Custom blue themes`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🚀 5x bonus multiplier`,
      status: 'ACTIVE',
      special: true,
      used: todaysBenefits.length > 0,
      savings: multiplierSavings
    }, {
      text: `💝 Weekly bonus rewards`,
      status: 'ACTIVE',
      special: true,
      used: false
    }];
    if (coins >= 1000) return [{
      text: `🎰 10 daily spins`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎯 VIP support`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎁 VIP bonus rewards`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `⭐ VIP golden badge`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🌟 Golden animations`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `🎵 VIP sound effects`,
      status: 'ACTIVE',
      special: true,
      used: false
    }, {
      text: `💰 2x bonus multiplier`,
      status: 'ACTIVE',
      special: true,
      used: todaysBenefits.length > 0,
      savings: multiplierSavings
    }, {
      text: `🎉 Special celebrations`,
      status: 'ACTIVE',
      special: true,
      used: false
    }];
    return [{
      text: '🎰 5 daily spins',
      status: 'STANDARD',
      special: false,
      used: false
    }, {
      text: '🎯 Standard support',
      status: 'STANDARD',
      special: false,
      used: false
    }];
  };
  const referralLink = userData?.referral_code ? `${window.location.origin}?ref=${userData.referral_code}` : '';
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: '📋 Copied!',
      description: 'Referral link copied to clipboard'
    });
  };
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: '👋 Goodbye!',
      description: 'You have been signed out'
    });
  };
  const handleContactSupport = () => {
    const subject = encodeURIComponent('Support Request - Spin to Earn');
    const body = encodeURIComponent('Hello,\n\nI need help with...\n\nThanks!');
    window.open(`mailto:alpinecallingoffical@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };
  const handleCallSupport = () => {
    window.open('tel:+9779765964677', '_self');
  };
  const handleProfilePictureUpload = (newUrl: string) => {
    toast({
      title: '📸 Profile Updated!',
      description: 'Your profile picture has been updated successfully'
    });
    refetch();
  };
  if (!userData) {
    return <div className="flex flex-col items-center justify-center min-h-48">
        <span className="text-white text-2xl mb-2">👤</span>
        <p className="text-white">Loading profile...</p>
      </div>;
  }
  const vipInfo = getVipLevel(userData?.coins || 0);
  const features = getVipFeatures(userData?.coins || 0);
  return <div className="space-y-6">
      {/* VIP Status Card with Enhanced Animations */}
      <div className={`${vipInfo.color} ${vipInfo.glow} rounded-2xl p-6 text-white relative overflow-hidden ${vipInfo.animation}`}>
        {/* Enhanced animated background for VIP levels */}
        {(userData?.coins || 0) >= 1000 && <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform skew-x-12 animate-pulse"></div>
            {(userData?.coins || 0) >= 3000 && <>
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-300 to-transparent transform -skew-x-12 animate-pulse delay-1000"></div>
                <div className="absolute top-0 left-0 w-4 h-4 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-4 right-8 w-2 h-2 bg-yellow-300 rounded-full animate-ping delay-500"></div>
                <div className="absolute bottom-8 left-12 w-3 h-3 bg-pink-300 rounded-full animate-ping delay-1000"></div>
              </>}
          </div>}
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`text-4xl ${(userData?.coins || 0) >= 1000 ? 'animate-bounce' : ''}`}>
              {vipInfo.emoji}
              {(userData?.coins || 0) >= 3000 && <span className="ml-2 animate-spin">✨</span>}
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                {vipInfo.level}
                {vipInfo.isVerified && <VerifiedBadge size="lg" className="ml-2" />}
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
        
        {vipInfo.nextLevel && <div className="relative z-10">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {vipInfo.nextLevel}</span>
              <span className="font-bold">{Math.round(vipInfo.progress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-500 animate-pulse" style={{
            width: `${Math.min(vipInfo.progress, 100)}%`
          }}></div>
            </div>
          </div>}
      </div>


      {/* User Info Card with Enhanced Avatar Display */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mx-0 my-0 px-[27px] py-[22px]">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex flex-col items-center space-y-2">
            <AvatarDisplay profilePictureUrl={userData?.profile_picture_url} size="lg" />
            <ProfilePictureUpload currentPictureUrl={userData?.profile_picture_url} onUploadSuccess={handleProfilePictureUpload} />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold flex items-center">
              {userData?.name || userData?.email?.split('@')[0] || 'User'}
              {vipInfo.isVerified && <VerifiedBadge size="md" className="ml-2" />}
            </h3>
            <p className="text-white/70">{vipInfo.level} Spin Master</p>
            {vipInfo.isVerified && <p className="text-blue-300 text-sm animate-pulse">✅ Verified Account</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Daily Spin Limit</p>
            <p className="text-white font-bold text-lg flex items-center justify-center">
              {(userData?.coins || 0) >= 3000 ? <span className="text-yellow-300 animate-pulse">♾️ Unlimited</span> : <span>{userData?.daily_spin_limit || 5}</span>}
              {(userData?.coins || 0) >= 1000 && (userData?.coins || 0) < 3000 && <span className="ml-2 text-yellow-300 animate-bounce">🔥</span>}
            </p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Member Since</p>
            <p className="text-white font-bold text-lg">
              {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Today'}
            </p>
          </div>
        </div>
      </div>

      {/* Power-up Management */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">⚡ Power-ups</h3>
        <PowerUpManager />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">📊 Quick Actions</h3>
        
        <Button onClick={onSwitchToHistory} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl mb-3 transition-all duration-300 hover:scale-105">
          📈 View Spin History
        </Button>
      </div>

      {/* Referral System */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center">
          👥 Invite Friends & Earn
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-white/80 text-sm block mb-2">Your Referral Code</label>
            <div className="flex space-x-2">
              <Input value={userData?.referral_code || ''} readOnly className="bg-white/20 border-white/30 text-white placeholder-white/50" />
              <Button onClick={copyReferralLink} className="bg-blue-500 hover:bg-blue-600 text-white px-4 transition-all duration-300 hover:scale-105">
                📋
              </Button>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">🎁 Referral Benefits:</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Get 100 bonus coins for each friend who joins</li>
              <li>• Your friend gets 50 welcome bonus coins</li>
              <li>• Start earning today!</li>
              {(userData?.coins || 0) >= 1000 && <li className="text-yellow-300 font-semibold">• VIP members get 2x referral bonuses! ✨</li>}
            </ul>
          </div>

          <Button onClick={copyReferralLink} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl transition-all duration-300 hover:scale-105">
            📱 Share Referral Link
          </Button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">⚙️ Settings</h3>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 py-3 rounded-xl justify-start transition-all duration-300 hover:scale-105">
            🔔 Notifications
          </Button>
          
          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              📞 Contact Support
              {(userData?.coins || 0) >= 2000 && <span className="ml-2 text-blue-300 text-xs">(Priority Support)</span>}
            </h4>
            
            <Button onClick={handleContactSupport} variant="outline" className="w-full bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30 rounded-xl justify-start transition-all duration-300 hover:scale-105 mx-0 my-0 px-0 py-[12px] text-left font-thin">
              📧 Email: alpinecallingoffical@gmail.com
            </Button>
            
            <Button onClick={handleCallSupport} variant="outline" className="w-full bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 py-3 rounded-xl justify-start transition-all duration-300 hover:scale-105">
              📱 Call: +977 976-596-4677
            </Button>
          </div>
          
          <Button onClick={handleSignOut} variant="outline" className="w-full bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 py-3 rounded-xl justify-start transition-all duration-300 hover:scale-105">
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>;
};