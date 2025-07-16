
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUserData } from '@/hooks/useUserData';
import { useToast } from '@/hooks/use-toast';
import { useEquippedItems } from '@/hooks/useEquippedItems';

export const SpinWheelConnected: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const { canSpin, recordSpin, userData } = useUserData();
  const { toast } = useToast();
  const { getPowerUpMultiplier, hasActivePowerUp } = useEquippedItems();

  const prizes = [5, 10, 20, 50, 100, 5, 10, 20];
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  // Get VIP level info
  const getVipLevel = (coins: number) => {
    if (coins >= 3000) return { level: 'Grand Master', multiplier: 10, isUnlimited: true };
    if (coins >= 2000) return { level: 'Elite Master', multiplier: 5, isUnlimited: false };
    if (coins >= 1000) return { level: 'VIP', multiplier: 2, isUnlimited: false };
    return { level: 'Regular', multiplier: 1, isUnlimited: false };
  };

  // Early returns AFTER all hooks are defined
  if (!userData) {
    return <div className="text-white">Loading user data...</div>;
  }

  if (userData.banned) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-6">
          <h2 className="text-red-400 text-xl font-bold mb-2">🚫 Account Suspended</h2>
          <p className="text-white/80">Your account has been temporarily suspended. Please contact support for more information.</p>
        </div>
      </div>
    );
  }

  const handleSpin = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setLastWin(null);

    // Generate random rotation with enhanced animation for VIP levels
    const baseRotation = 1440 + Math.random() * 360;
    const vipInfo = getVipLevel(userData?.coins || 0);
    const enhancedRotation = vipInfo.level !== 'Regular' ? baseRotation + 720 : baseRotation;
    
    const finalRotation = rotation + enhancedRotation;
    setRotation(finalRotation);

    // Calculate which segment we landed on
    const segmentAngle = 360 / prizes.length;
    const normalizedRotation = (finalRotation % 360);
    const segmentIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % prizes.length;
    let wonAmount = prizes[segmentIndex];

    // Apply VIP multiplier
    wonAmount = Math.floor(wonAmount * vipInfo.multiplier);
    
    // Apply power-up effects
    if (hasActivePowerUp('double_coins')) {
      wonAmount = getPowerUpMultiplier(wonAmount, 'double_coins');
    }
    
    if (hasActivePowerUp('lucky_multiplier')) {
      // 10x chance for rare rewards
      if (Math.random() < 0.1) {
        wonAmount = getPowerUpMultiplier(wonAmount, 'lucky_multiplier');
      }
    }

    // Enhanced animation duration for VIP levels
    const animationDuration = vipInfo.level !== 'Regular' ? 4000 : 3000;

    // Wait for animation to complete
    setTimeout(async () => {
      const success = await recordSpin(wonAmount);
      
      if (success) {
        setLastWin(wonAmount);
        
        // Enhanced toast for VIP levels
        let toastTitle = '🎉 Congratulations!';
        let toastDescription = `You won ${wonAmount} coins!`;
        
        if (vipInfo.multiplier > 1) {
          toastTitle = `🎉 ${vipInfo.level} Bonus!`;
          toastDescription = `You won ${wonAmount} coins! (${vipInfo.multiplier}x multiplier applied!)`;
        }
        
        if (vipInfo.isUnlimited) {
          toastTitle = '👑 Grand Master Spin!';
          toastDescription = `You won ${wonAmount} coins! Unlimited spins active!`;
        }

        toast({
          title: toastTitle,
          description: toastDescription,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to record spin. Please try again.',
          variant: 'destructive',
        });
      }
      
      setIsSpinning(false);
    }, animationDuration);
  };

  const segmentAngle = 360 / prizes.length;
  const vipInfo = getVipLevel(userData?.coins || 0);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* VIP Status Display */}
      {vipInfo.level !== 'Regular' && (
        <div className={`p-4 rounded-xl text-center ${
          vipInfo.isUnlimited 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse' 
            : vipInfo.level === 'Elite Master'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 animate-bounce'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse'
        }`}>
          <div className="text-white font-bold">
            {vipInfo.level === 'Grand Master' && (
              <>
                <div className="text-2xl">👑 GRAND MASTER 👑</div>
                <div className="text-sm">♾️ UNLIMITED SPINS • 10x MULTIPLIER ♾️</div>
              </>
            )}
            {vipInfo.level === 'Elite Master' && (
              <>
                <div className="text-xl">💎 ELITE MASTER 💎</div>
                <div className="text-sm">5x COIN MULTIPLIER ACTIVE</div>
              </>
            )}
            {vipInfo.level === 'VIP' && (
              <>
                <div className="text-xl">⭐ VIP MEMBER ⭐</div>
                <div className="text-sm">2x COIN MULTIPLIER ACTIVE</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Wheel Container */}
      <div className="relative">
        {/* Enhanced Pointer with VIP styling */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className={`w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow-lg ${
            vipInfo.level !== 'Regular' ? 'animate-pulse' : ''
          }`}></div>
        </div>

        {/* Enhanced Wheel with VIP effects */}
        <div className={`relative w-80 h-80 ${vipInfo.level !== 'Regular' ? 'animate-pulse' : ''}`}>
          {/* VIP Glow Effect */}
          {vipInfo.level !== 'Regular' && (
            <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${
              vipInfo.isUnlimited 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : vipInfo.level === 'Elite Master'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}></div>
          )}
          
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className={`transform transition-transform ease-out drop-shadow-2xl relative z-10 ${
              vipInfo.level !== 'Regular' ? 'drop-shadow-2xl' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? (vipInfo.level !== 'Regular' ? '4s' : '3s') : '0s'
            }}
          >
            {/* Enhanced Outer ring */}
            <circle
              cx="160"
              cy="160"
              r="155"
              fill={vipInfo.level !== 'Regular' ? '#FFD700' : '#FFD700'}
              stroke={vipInfo.isUnlimited ? '#FF1493' : vipInfo.level === 'Elite Master' ? '#4169E1' : '#FFA500'}
              strokeWidth={vipInfo.level !== 'Regular' ? '6' : '4'}
            />
            
            {/* Segments with enhanced colors for VIP */}
            {prizes.map((prize, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const x1 = 160 + 140 * Math.cos(startAngleRad);
              const y1 = 160 + 140 * Math.sin(startAngleRad);
              const x2 = 160 + 140 * Math.cos(endAngleRad);
              const y2 = 160 + 140 * Math.sin(endAngleRad);

              const pathData = [
                `M 160 160`,
                `L ${x1} ${y1}`,
                `A 140 140 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              const textAngle = startAngle + segmentAngle / 2;
              const textAngleRad = (textAngle * Math.PI) / 180;
              const textX = 160 + 100 * Math.cos(textAngleRad);
              const textY = 160 + 100 * Math.sin(textAngleRad);

              // Enhanced prize display with multiplier
              const displayPrize = Math.floor(prize * vipInfo.multiplier);

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={colors[index]}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={vipInfo.level !== 'Regular' ? '18' : '16'}
                    fontWeight="bold"
                    className="drop-shadow-lg"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {displayPrize}
                  </text>
                  {vipInfo.multiplier > 1 && (
                    <text
                      x={textX}
                      y={textY + 15}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="yellow"
                      fontSize="10"
                      fontWeight="bold"
                      className="drop-shadow-lg"
                      transform={`rotate(${textAngle}, ${textX}, ${textY + 15})`}
                    >
                      x{vipInfo.multiplier}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Enhanced Center circle */}
            <circle
              cx="160"
              cy="160"
              r="25"
              fill={vipInfo.isUnlimited ? '#FF1493' : vipInfo.level === 'Elite Master' ? '#4169E1' : '#FFD700'}
              stroke={vipInfo.level !== 'Regular' ? '#FFF' : '#FFA500'}
              strokeWidth="3"
            />
            <text
              x="160"
              y="165"
              textAnchor="middle"
              fill={vipInfo.level !== 'Regular' ? '#FFF' : '#FF6B00'}
              fontSize="12"
              fontWeight="bold"
            >
              {vipInfo.isUnlimited ? '♾️' : 'SPIN'}
            </text>
          </svg>
        </div>
      </div>

      {/* Enhanced Win Display */}
      {lastWin && (
        <div className={`text-white px-6 py-3 rounded-full text-xl font-bold animate-bounce ${
          vipInfo.isUnlimited 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
            : vipInfo.level === 'Elite Master'
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : vipInfo.level === 'VIP'
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
            : 'bg-green-500'
        }`}>
          {vipInfo.isUnlimited && '👑 '}
          {vipInfo.level === 'Elite Master' && '💎 '}
          {vipInfo.level === 'VIP' && '⭐ '}
          🎉 You won {lastWin} coins!
          {vipInfo.multiplier > 1 && ` (x${vipInfo.multiplier})`}
        </div>
      )}

      {/* Enhanced Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
          canSpin && !isSpinning
            ? vipInfo.isUnlimited
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 animate-pulse'
              : vipInfo.level === 'Elite Master'
              ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-blue-500/50 transform hover:scale-105'
              : vipInfo.level === 'VIP'
              ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
      >
        {isSpinning ? (
          <>
            {vipInfo.isUnlimited && '👑 '}
            {vipInfo.level === 'Elite Master' && '💎 '}
            {vipInfo.level === 'VIP' && '⭐ '}
            🎰 Spinning...
          </>
        ) : canSpin ? (
          <>
            {vipInfo.isUnlimited && '👑 '}
            {vipInfo.level === 'Elite Master' && '💎 '}
            {vipInfo.level === 'VIP' && '⭐ '}
            🎲 SPIN NOW!
            {vipInfo.multiplier > 1 && ` (${vipInfo.multiplier}x)`}
            {vipInfo.isUnlimited && ' ♾️'}
          </>
        ) : (
          '🚫 No Spins Left'
        )}
      </Button>

      {/* VIP Information Display */}
      {vipInfo.level !== 'Regular' && (
        <div className="text-center space-y-2">
          <div className="text-white/80 text-sm">
            {vipInfo.isUnlimited ? 
              'You have unlimited spins today!' : 
              `You have enhanced spins with ${vipInfo.multiplier}x multiplier!`
            }
          </div>
          {userData && (
            <div className="text-white/60 text-xs">
              Current level: {vipInfo.level} | Coins: {userData.coins.toLocaleString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
