import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthModal } from '@/components/AuthModal';
import { SpinWheelConnected } from '@/components/SpinWheelConnected';
import { WalletDisplayConnected } from '@/components/WalletDisplayConnected';
import { UserProfileConnected } from '@/components/UserProfileConnected';
import { SpinHistoryConnected } from '@/components/SpinHistoryConnected';
import { MoreSection } from '@/components/MoreSection';
import { AboutSection } from '@/components/AboutSection';
import { useAuth } from '@/hooks/useAuth';
import { NotificationCenter } from '@/components/NotificationCenter';
import { useNotifications } from '@/hooks/useNotifications';
import { WelcomeAnimation } from '@/components/WelcomeAnimation';
import { useUnreadAdminMessagesContext } from "@/hooks/UnreadAdminMessagesContext";
import { Leaderboard } from "@/components/Leaderboard";
import { Button } from "@/components/ui/button";
import { Crown, MessageCircle } from "lucide-react";
import { AdBanner } from "@/components/AdBanner";
import { ChatList } from "@/components/ChatList";
import { useChat } from "@/hooks/useChat";
import ShopSection from "@/components/ShopSection";

const Index = () => {
  const location = useLocation();
  const {
    user,
    loading,
    signOut,
    isNewLogin
  } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('spin');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChatList, setShowChatList] = useState(false);
  const { unreadCount } = useUnreadAdminMessagesContext();
  const { getTotalUnreadCount } = useChat();
  const { unreadCount: systemNotificationCount } = useNotifications();

  useEffect(() => {
    // Handle navigation from success/failure pages
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  useEffect(() => {
    if (user && isNewLogin) {
      setShowWelcome(true);
      // Hide welcome after 2.5s
      const timeout = setTimeout(() => setShowWelcome(false), 2500);
      return () => clearTimeout(timeout);
    }
  }, [user, isNewLogin]);

  const handleSwitchToHistory = () => {
    setActiveTab('history');
  };

  // Debug log for notification state
  console.log('[Notification-Debug] unreadCount:', unreadCount);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
      <WelcomeAnimation show={showWelcome} userName={user.user_metadata?.name || user.email || "User"} />
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <ChatList isOpen={showChatList} onClose={() => setShowChatList(false)} />
      <div className="fixed top-3 right-3 z-50 flex gap-2">
        <button
          onClick={() => setShowChatList(true)}
          className="relative bg-white/20 hover:bg-white/30 text-white text-lg px-4 py-2 rounded-xl shadow-lg transition-all duration-200"
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5" />
          {getTotalUnreadCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
              {getTotalUnreadCount() > 9 ? "9+" : getTotalUnreadCount()}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowNotifications(true)}
          className="relative bg-white/20 hover:bg-white/30 text-white text-lg px-4 py-2 rounded-xl shadow-lg transition-all duration-200"
          aria-label="Notifications"
        >
          <span>🔔 Notifications</span>
          {(unreadCount + systemNotificationCount) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg border-2 border-white animate-bounce">
              {(unreadCount + systemNotificationCount) > 9 ? "9+" : (unreadCount + systemNotificationCount)}
            </span>
          )}
        </button>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎰 Spin to Earn</h1>
          <p className="text-white/80">Welcome back! Ready to spin and win?</p>
        </div>

        <AdBanner />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-7 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="spin" className="text-white data-[state=active]:bg-white/30">
              🎰 Spin
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-white/30">
              💰 Wallet
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/30">
              📊 History
            </TabsTrigger>
            <TabsTrigger value="mores" className="text-white data-[state=active]:bg-white/30">
              🎮 MORES
            </TabsTrigger>
            <TabsTrigger value="about" className="text-white data-[state=active]:bg-white/30">
              ℹ️ ABOUT
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/30">
              👤 Profile
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-white/30">
              🏆 Leaderboard
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

            <TabsContent value="mores" className="space-y-6">
              <MoreSection />
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <AboutSection />
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <UserProfileConnected onSwitchToHistory={handleSwitchToHistory} />
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Leaderboard />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
