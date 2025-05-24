
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserProfileProps {
  coins: number;
}

export const UserProfile: React.FC<UserProfileProps> = ({ coins }) => {
  const referralCode = "SPIN123ABC"; // This would be generated per user
  const referralLink = `https://spintoearnnp.app/ref/${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">Guest User</h3>
            <p className="text-white/70">Level 1 Spinner</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Total Coins</p>
            <p className="text-white font-bold text-lg">{coins.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Referrals</p>
            <p className="text-white font-bold text-lg">0</p>
          </div>
        </div>
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
              <Input
                value={referralCode}
                readOnly
                className="bg-white/20 border-white/30 text-white placeholder-white/50"
              />
              <Button
                onClick={copyReferralLink}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
              >
                📋
              </Button>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">🎁 Referral Benefits:</h4>
            <ul className="text-white/80 text-sm space-y-1">
              <li>• Get 100 bonus coins for each friend who joins</li>
              <li>• Your friend gets 50 welcome bonus coins</li>
              <li>• Earn 10% of their daily spin winnings</li>
            </ul>
          </div>

          <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl">
            📱 Share Referral Link
          </Button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">⚙️ Settings</h3>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 py-3 rounded-xl justify-start"
          >
            🔔 Notifications
          </Button>
          <Button
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 py-3 rounded-xl justify-start"
          >
            🌍 Language (English)
          </Button>
          <Button
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 py-3 rounded-xl justify-start"
          >
            📞 Support
          </Button>
          <Button
            variant="outline"
            className="w-full bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 py-3 rounded-xl justify-start"
          >
            🚪 Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
