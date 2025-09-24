import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MobileFeaturesProps {
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const MobileFeatures: React.FC<MobileFeaturesProps> = ({ onRefresh, children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const { toast } = useToast();

  // Pull to refresh functionality
  const handleTouchStart = (e: TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      onRefresh?.();
      
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        toast({
          title: "✨ Refreshed!",
          description: "Content has been updated",
        });
      }, 1500);
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [startY, pullDistance, isRefreshing]);

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center z-50 bg-white/90 backdrop-blur-sm transition-all duration-200"
          style={{ height: `${pullDistance}px` }}
        >
          <div className={`text-2xl transition-transform duration-200 ${pullDistance > 80 ? 'animate-spin' : ''}`}>
            {pullDistance > 80 ? '🔄' : '⬇️'}
          </div>
        </div>
      )}

      {/* Refresh loading indicator */}
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 z-50 animate-fade-in">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin">🔄</div>
            <span className="text-sm font-medium">Refreshing...</span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

// Haptic feedback hook
export const useHapticFeedback = () => {
  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  return {
    light: () => vibrate(10),
    medium: () => vibrate(50),
    heavy: () => vibrate(100),
    success: () => vibrate([50, 100, 50]),
    error: () => vibrate([100, 50, 100]),
    notification: () => vibrate([100, 50, 100, 50, 100])
  };
};