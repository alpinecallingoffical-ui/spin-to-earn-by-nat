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
        <div className="text-center mb-8 max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">🎰 Spin to Earn</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6">Spin the wheel daily and earn coins!</p>
          
          {referralCode && <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 mb-6">
              <p className="text-white font-semibold text-sm sm:text-base">🎁 You've been invited!</p>
              <p className="text-white/80 text-sm sm:text-base">Join now and get 50 bonus coins!</p>
            </div>}
          
          <button onClick={() => setShowAuth(true)} className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-2xl text-lg sm:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all w-full sm:w-auto">
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
      <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-50 flex gap-1 sm:gap-2">
        <button
          onClick={() => setShowChatList(true)}
          className="relative bg-white/20 hover:bg-white/30 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center"
          aria-label="Messages"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline ml-1 text-sm">Messages</span>
          {getTotalUnreadCount() > 0 && (
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg border-2 border-white animate-pulse text-[10px] sm:text-xs">
              {getTotalUnreadCount() > 9 ? "9+" : getTotalUnreadCount()}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowNotifications(true)}
          className="relative bg-white/20 hover:bg-white/30 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center"
          aria-label="Notifications"
        >
          <span className="text-sm sm:text-base">🔔</span>
          <span className="hidden sm:inline ml-1 text-sm">Notifications</span>
          {(unreadCount + systemNotificationCount) > 0 && (
            <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white text-xs font-bold rounded-full px-1 py-0.5 sm:px-2 shadow-lg border-2 border-white animate-bounce text-[10px] sm:text-xs">
              {(unreadCount + systemNotificationCount) > 9 ? "9+" : (unreadCount + systemNotificationCount)}
            </span>
          )}
        </button>
      </div>
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">🎰 Spin to Earn</h1>
          <p className="text-white/80 text-sm sm:text-base">Welcome back! Ready to spin and win?</p>
        </div>

        <AdBanner />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="grid w-full bg-white/20 backdrop-blur-sm p-1 grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1">
            <TabsTrigger value="spin" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="block sm:hidden">🎰</span>
              <span className="hidden sm:block">🎰 Spin</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="block sm:hidden">💰</span>
              <span className="hidden sm:block">💰 Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2">
              <span className="block sm:hidden">📊</span>
              <span className="hidden sm:block">📊 History</span>
            </TabsTrigger>
            <TabsTrigger value="mores" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2 col-span-3 sm:col-span-1">
              <span className="block sm:hidden">🎮 GAMES</span>
              <span className="hidden sm:block">🎮 MORES</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2 hidden md:block">
              ℹ️ ABOUT
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2 hidden sm:block">
              👤 Profile
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-white/30 text-xs sm:text-sm px-1 sm:px-3 py-2 hidden md:block">
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
