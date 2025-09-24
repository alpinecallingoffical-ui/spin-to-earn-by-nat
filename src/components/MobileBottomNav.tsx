import React from 'react';
import { Button } from '@/components/ui/button';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange,
  unreadCount 
}) => {
  const navItems = [
    { id: 'spin', icon: '🎰', label: 'Spin', primary: true },
    { id: 'wallet', icon: '💰', label: 'Wallet', primary: true },
    { id: 'history', icon: '📊', label: 'History', primary: true },
    { id: 'mores', icon: '🎮', label: 'Games', primary: true },
    { id: 'profile', icon: '👤', label: 'Profile', primary: false },
  ];

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40">
      {/* Main Navigation Bar */}
      <div className="bg-white/95 backdrop-blur-lg border-t border-white/20 px-2 py-2 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.filter(item => item.primary).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <span className={`text-xl mb-1 ${activeTab === item.id ? 'animate-bounce' : ''}`}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
              
              {item.id === 'wallet' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Navigation (Expandable) */}
      <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm px-4 py-1">
        <div className="flex justify-center space-x-8 max-w-sm mx-auto">
          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-full transition-all duration-200 ${
              activeTab === 'profile'
                ? 'bg-white/30 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
          >
            <span>👤</span>
            <span className="text-sm font-medium">Profile</span>
          </button>
          
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-full transition-all duration-200 ${
              activeTab === 'leaderboard'
                ? 'bg-white/30 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
          >
            <span>🏆</span>
            <span className="text-sm font-medium">Leaderboard</span>
          </button>
          
          <button
            onClick={() => onTabChange('about')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-full transition-all duration-200 ${
              activeTab === 'about'
                ? 'bg-white/30 text-white'
                : 'text-white/80 hover:text-white hover:bg-white/20'
            }`}
          >
            <span>ℹ️</span>
            <span className="text-sm font-medium">About</span>
          </button>
        </div>
      </div>
    </div>
  );
};