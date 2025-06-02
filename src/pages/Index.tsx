
import { AuthModal } from '@/components/AuthModal';
import { SpinWheelConnected } from '@/components/SpinWheelConnected';
import { SpinHistoryConnected } from '@/components/SpinHistoryConnected';
import { UserProfileConnected } from '@/components/UserProfileConnected';
import { WalletDisplayConnected } from '@/components/WalletDisplayConnected';
import { GamesSection } from '@/components/GamesSection';
import { VideosSection } from '@/components/VideosSection';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'spin' | 'games' | 'videos'>('spin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">🎰 Spin to Earn</h1>
            <p className="text-white/80 mb-8">Spin the wheel and earn amazing rewards!</p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
            >
              Get Started - Login/Register
            </button>
          </div>
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 flex space-x-2">
            <button
              onClick={() => setActiveSection('spin')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'spin'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🎰 Spin Wheel
            </button>
            <button
              onClick={() => setActiveSection('games')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'games'
                  ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              🎮 Games
            </button>
            <button
              onClick={() => setActiveSection('videos')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeSection === 'videos'
                  ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              📺 Videos
            </button>
          </div>
        </div>

        {activeSection === 'spin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Section */}
            <div className="lg:col-span-1">
              <UserProfileConnected />
              <div className="mt-6">
                <WalletDisplayConnected />
              </div>
            </div>

            {/* Main Spin Wheel Section */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center">
              <SpinWheelConnected />
            </div>

            {/* Spin History Section */}
            <div className="lg:col-span-1">
              <SpinHistoryConnected />
            </div>
          </div>
        )}

        {activeSection === 'games' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Section */}
            <div className="lg:col-span-1">
              <UserProfileConnected />
              <div className="mt-6">
                <WalletDisplayConnected />
              </div>
            </div>

            {/* Games Section */}
            <div className="lg:col-span-2">
              <GamesSection />
            </div>
          </div>
        )}

        {activeSection === 'videos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Section */}
            <div className="lg:col-span-1">
              <UserProfileConnected />
              <div className="mt-6">
                <WalletDisplayConnected />
              </div>
            </div>

            {/* Videos Section */}
            <div className="lg:col-span-2">
              <VideosSection />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
