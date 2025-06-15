
import React from 'react';

export interface WelcomeAnimationProps {
  show: boolean;
  userName: string;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ show, userName }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-3xl shadow-2xl px-10 py-12 flex flex-col items-center animate-scale-in">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <div className="text-3xl font-bold text-white mb-2">Welcome, {userName}!</div>
        <div className="text-lg text-white/80 mb-4">We're glad to have you back. Good luck!</div>
        <div className="flex space-x-2">
          <span className="animate-pulse text-yellow-300 text-2xl">🌟</span>
          <span className="animate-pulse text-pink-300 text-2xl">🪄</span>
          <span className="animate-pulse text-orange-300 text-2xl">🎰</span>
        </div>
      </div>
    </div>
  );
};
