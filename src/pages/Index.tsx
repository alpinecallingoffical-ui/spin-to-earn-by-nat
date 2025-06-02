import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthModal } from '@/components/AuthModal';
import { SpinWheelConnected } from '@/components/SpinWheelConnected';
import { WalletDisplayConnected } from '@/components/WalletDisplayConnected';
import { UserProfileConnected } from '@/components/UserProfileConnected';
import { SpinHistoryConnected } from '@/components/SpinHistoryConnected';
import { SpinManagement } from '@/components/SpinManagement';
import { useAuth } from '@/hooks/useAuth';
const Index = () => {
  const {
    user,
    loading
  } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('spin');
  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);
  const handleSwitchToHistory = () => {
    setActiveTab('history');
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">🎰 Loading...</div>
      </div>;
  }
  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">🎰 Spin to Earn</h1>
          <p className="text-xl text-white/80 mb-6">Spin the wheel daily and earn coins!</p>
          
          {referralCode && <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <p className="text-white font-semibold">🎁 You've been invited!</p>
              <p className="text-white/80">Join now and get 50 bonus coins!</p>
            </div>}
          
          <button onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-4 px-8 rounded-2xl text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all">
            🚀 Get Started
          </button>
        </div>

        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} referralCode={referralCode} />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎰 Spin to Earn</h1>
          <p className="text-white/80">Welcome back! Ready to spin and win?</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="spin" className="text-white data-[state=active]:bg-white/30">
              🎰 Spin
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-white/30">
              💰 Wallet
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/30">
              📊 History
            </TabsTrigger>
            
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/30">
              👤 Profile
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="spin" className="space-y-6">
              <SpinWheelConnected />
            </TabsContent>

            <TabsContent value="wallet" className="space-y-6">
              <WalletDisplayConnected onSwitchToHistory={handleSwitchToHistory} />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <SpinHistoryConnected />
            </TabsContent>

            <TabsContent value="manage" className="space-y-6">
              <SpinManagement />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <UserProfileConnected onSwitchToHistory={handleSwitchToHistory} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>;
};
export default Index;