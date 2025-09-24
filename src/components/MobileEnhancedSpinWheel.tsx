import React, { useState } from 'react';
import { SpinWheel } from './SpinWheel';
import { SwipeableContent } from './SwipeableContent';
import { useHapticFeedback } from './MobileFeatures';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface MobileEnhancedSpinWheelProps {
  onSpinComplete: (amount: number) => void;
  canSpin: boolean;
  coins: number;
}

export const MobileEnhancedSpinWheel: React.FC<MobileEnhancedSpinWheelProps> = ({
  onSpinComplete,
  canSpin,
  coins
}) => {
  const [quickSpinMode, setQuickSpinMode] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState(0);
  const haptic = useHapticFeedback();
  const { toast } = useToast();

  const handleSpinWithHaptic = (amount: number) => {
    haptic.success();
    onSpinComplete(amount);
    
    if (quickSpinMode && autoSpinCount > 0) {
      setAutoSpinCount(prev => prev - 1);
    }
  };

  const toggleQuickSpin = () => {
    haptic.medium();
    setQuickSpinMode(!quickSpinMode);
    toast({
      title: quickSpinMode ? "Quick Spin Disabled" : "Quick Spin Enabled",
      description: quickSpinMode ? "Back to normal mode" : "Faster spins with reduced animation",
    });
  };

  const startAutoSpin = (count: number) => {
    if (!canSpin) return;
    
    haptic.heavy();
    setAutoSpinCount(count);
    setQuickSpinMode(true);
    toast({
      title: `Auto Spin Started`,
      description: `${count} spins queued`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Coin Balance Display */}
      <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
        <div className="text-white/80 text-sm">Current Balance</div>
        <div className="text-3xl font-bold text-yellow-300 animate-pulse">
          🪙 {coins.toLocaleString()}
        </div>
      </div>

      {/* Enhanced Spin Wheel */}
      <SwipeableContent
        onSwipeLeft={() => {
          haptic.light();
          toast({ title: "💡 Tip", description: "Swipe right to activate quick spin mode!" });
        }}
        onSwipeRight={() => {
          if (canSpin) toggleQuickSpin();
        }}
      >
        <div className={`transition-all duration-300 ${quickSpinMode ? 'scale-95' : 'scale-100'}`}>
          <SpinWheel
            onSpinComplete={handleSpinWithHaptic}
            canSpin={canSpin && (autoSpinCount === 0)}
          />
        </div>
      </SwipeableContent>

      {/* Quick Spin Mode Indicator */}
      {quickSpinMode && (
        <div className="text-center bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-3 animate-fade-in">
          <div className="text-white font-bold text-sm mb-1">⚡ Quick Spin Mode Active</div>
          <div className="text-white/80 text-xs">Reduced animations for faster gameplay</div>
          {autoSpinCount > 0 && (
            <div className="text-yellow-300 font-bold mt-1">
              {autoSpinCount} auto spins remaining
            </div>
          )}
        </div>
      )}

      {/* Mobile Controls */}
      <div className="space-y-3">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={toggleQuickSpin}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 py-3"
          >
            {quickSpinMode ? '🐌 Normal' : '⚡ Quick'}
          </Button>
          
          <Button
            onClick={() => startAutoSpin(5)}
            disabled={!canSpin || autoSpinCount > 0}
            variant="outline"
            className="bg-white/10 border-white/30 text-white hover:bg-white/20 py-3"
          >
            🔄 Auto x5
          </Button>
        </div>

        {/* Power Ups */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 text-center">🚀 Power-Ups</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30 text-xs py-2"
              disabled={coins < 100}
            >
              <div className="text-center">
                <div>🍀</div>
                <div>Luck</div>
                <div className="text-xs">100🪙</div>
              </div>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30 text-xs py-2"
              disabled={coins < 200}
            >
              <div className="text-center">
                <div>⭐</div>
                <div>Boost</div>
                <div className="text-xs">200🪙</div>
              </div>
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="bg-purple-500/20 border-purple-400/30 text-purple-200 hover:bg-purple-500/30 text-xs py-2"
              disabled={coins < 500}
            >
              <div className="text-center">
                <div>💎</div>
                <div>Ultra</div>
                <div className="text-xs">500🪙</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Gesture Hints */}
        <div className="text-center text-white/60 text-xs">
          💡 Swipe right for quick mode • Long press for auto spin
        </div>
      </div>
    </div>
  );
};