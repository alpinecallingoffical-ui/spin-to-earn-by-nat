
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SpinWheelProps {
  onSpinComplete: (amount: number) => void;
  canSpin: boolean;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onSpinComplete, canSpin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const prizes = [5, 10, 20, 50, 100, 5, 10, 20];
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
  ];

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setLastWin(null);

    // Generate random rotation (multiple full rotations + random position)
    const randomRotation = 1440 + Math.random() * 360; // 4 full rotations + random
    const finalRotation = rotation + randomRotation;
    setRotation(finalRotation);

    // Calculate which segment we landed on
    const segmentAngle = 360 / prizes.length;
    const normalizedRotation = (finalRotation % 360);
    const segmentIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % prizes.length;
    const wonAmount = prizes[segmentIndex];

    // Wait for animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      setLastWin(wonAmount);
      onSpinComplete(wonAmount);
    }, 3000);
  };

  const segmentAngle = 360 / prizes.length;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Wheel Container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white drop-shadow-lg"></div>
        </div>

        {/* Wheel */}
        <div className="relative w-80 h-80">
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className={`transform transition-transform duration-3000 ease-out drop-shadow-2xl ${
              isSpinning ? 'animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '3s' : '0s'
            }}
          >
            {/* Outer ring */}
            <circle
              cx="160"
              cy="160"
              r="155"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="4"
            />
            
            {/* Segments */}
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
                    fontSize="16"
                    fontWeight="bold"
                    className="drop-shadow-lg"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {prize}
                  </text>
                </g>
              );
            })}

            {/* Center circle */}
            <circle
              cx="160"
              cy="160"
              r="25"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="3"
            />
            <text
              x="160"
              y="165"
              textAnchor="middle"
              fill="#FF6B00"
              fontSize="12"
              fontWeight="bold"
            >
              SPIN
            </text>
          </svg>
        </div>
      </div>

      {/* Win Display */}
      {lastWin && (
        <div className="bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold animate-bounce">
          🎉 You won {lastWin} coins!
        </div>
      )}

      {/* Spin Button */}
      <Button
        onClick={handleSpin}
        disabled={!canSpin || isSpinning}
        className={`w-full py-4 text-lg font-bold rounded-2xl transition-all duration-300 ${
          canSpin && !isSpinning
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105'
            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
        }`}
      >
        {isSpinning ? '🎰 Spinning...' : canSpin ? '🎲 SPIN NOW!' : '🚫 No Spins Left'}
      </Button>
    </div>
  );
};
