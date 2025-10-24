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
import { useAdmin } from '@/hooks/useAdmin';
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
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileFeatures } from '@/components/MobileFeatures';
import { SwipeableContent } from '@/components/SwipeableContent';
import { useIsMobile } from '@/hooks/use-mobile';
import { RoleSelector } from '@/components/RoleSelector';
import { AdminPanel } from '@/components/AdminPanel';

const Index = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const {
    user,
    loading,
    signOut,
    isNewLogin
  } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(null);
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

  const handleRefresh = () => {
    // Refresh logic here
    window.location.reload();
  };

  const handleTabSwipe = (direction: 'left' | 'right') => {
    const tabs = ['spin', 'wallet', 'history', 'mores', 'profile', 'leaderboard', 'about'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'left' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Debug log for notification state
  console.log('[Notification-Debug] unreadCount:', unreadCount);

  if (loading || adminLoading) {
    return <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">🎰 Loading...</div>
      </div>;
  }

  // Show role selector for admin users who haven't selected a role
  if (user && isAdmin && selectedRole === null) {
    return <RoleSelector onSelectRole={setSelectedRole} />;
  }

  // Show admin panel if admin role is selected
  if (user && isAdmin && selectedRole === 'admin') {
    return <AdminPanel />;
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
    <MobileFeatures onRefresh={handleRefresh}>
      <div className={`min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 ${isMobile ? 'pb-24' : ''}`}>
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

        {/* Desktop Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
          <TabsList className="hidden sm:grid w-full grid-cols-7 bg-white/20 backdrop-blur-sm">
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

          {/* Mobile Navigation Tabs */}
          <div className="sm:hidden bg-white/20 backdrop-blur-sm rounded-2xl p-2 mb-4">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveTab('spin')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all ${
                  activeTab === 'spin' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-xl mb-1">🎰</span>
                <span className="text-xs font-medium">Spin</span>
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all ${
                  activeTab === 'wallet' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-xl mb-1">💰</span>
                <span className="text-xs font-medium">Wallet</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all ${
                  activeTab === 'history' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-xl mb-1">📊</span>
                <span className="text-xs font-medium">History</span>
              </button>
              <button
                onClick={() => setActiveTab('mores')}
                className={`flex flex-col items-center py-3 px-2 rounded-xl transition-all ${
                  activeTab === 'mores' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-xl mb-1">🎮</span>
                <span className="text-xs font-medium">Games</span>
              </button>
            </div>
            
            {/* Secondary mobile tabs */}
            <div className="grid grid-cols-3 gap-1 mt-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                  activeTab === 'profile' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-lg mb-1">👤</span>
                <span className="text-xs font-medium">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                  activeTab === 'leaderboard' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-lg mb-1">🏆</span>
                <span className="text-xs font-medium">Leaderboard</span>
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`flex flex-col items-center py-2 px-2 rounded-xl transition-all ${
                  activeTab === 'about' ? 'bg-white/30 text-white' : 'text-white/70'
                }`}
              >
                <span className="text-lg mb-1">ℹ️</span>
                <span className="text-xs font-medium">About</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <SwipeableContent
              onSwipeLeft={() => handleTabSwipe('left')}
              onSwipeRight={() => handleTabSwipe('right')}
            >
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
            </SwipeableContent>
          </div>
        </Tabs>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            unreadCount={unreadCount + systemNotificationCount}
          />
        )}
        </div>
      </div>
    </MobileFeatures>
  );
};

export default Index;
