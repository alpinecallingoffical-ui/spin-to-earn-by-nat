
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfileConnectedProps {
  onSwitchToHistory?: () => void;
}

export const UserProfileConnected: React.FC<UserProfileConnectedProps> = ({ onSwitchToHistory }) => {
  const { userData } = useUserData();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const referralLink = userData?.referral_code 
    ? `${window.location.origin}?ref=${userData.referral_code}` 
    : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: '📋 Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: '👋 Goodbye!',
      description: 'You have been signed out',
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

  if (!userData) {
    return (
      <div className="text-center text-white">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h3 className="text-white text-xl font-bold">{userData.name}</h3>
            <p className="text-white/70">Spin Master</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Total Coins</p>
            <p className="text-white font-bold text-lg">{userData.coins.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <p className="text-white/80 text-sm">Member Since</p>
            <p className="text-white font-bold text-lg">
              {new Date(userData.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-white text-lg font-bold mb-4">📊 Quick Actions</h3>
        
        <Button
          onClick={onSwitchToHistory}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl mb-3"
        >
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
              <Input
                value={userData.referral_code}
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
              <li>• Start earning today!</li>
            </ul>
          </div>

          <Button 
            onClick={copyReferralLink}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl"
          >
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
          
          {/* Support Section */}
          <div className="bg-white/10 rounded-xl p-4 space-y-3">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              📞 Contact Support
            </h4>
            
            <Button
              onClick={handleContactSupport}
              variant="outline"
              className="w-full bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30 py-3 rounded-xl justify-start"
            >
              📧 Email: alpinecallingoffical@gmail.com
            </Button>
            
            <Button
              onClick={handleCallSupport}
              variant="outline"
              className="w-full bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 py-3 rounded-xl justify-start"
            >
              📱 Call: +977 976-596-4677
            </Button>
          </div>
          
          <Button
            onClick={handleSignOut}
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
