
import React, { useState, useEffect } from 'react';
import { SpinWheel } from '@/components/SpinWheel';
import { WalletDisplay } from '@/components/WalletDisplay';
import { UserProfile } from '@/components/UserProfile';
import { SpinHistory } from '@/components/SpinHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [coins, setCoins] = useState(0);
  const [spinsToday, setSpinsToday] = useState(0);
  const [spinHistory, setSpinHistory] = useState<Array<{id: string, amount: number, timestamp: Date}>>([]);
  const maxSpinsPerDay = 5;

  const handleSpinWin = (amount: number) => {
    setCoins(prev => prev + amount);
    setSpinsToday(prev => prev + 1);
    
    // Add to spin history
    const newSpin = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date()
    };
    setSpinHistory(prev => [newSpin, ...prev.slice(0, 9)]); // Keep last 10 spins
  };

  const canSpin = spinsToday < maxSpinsPerDay;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🎰 Spin to Earn</h1>
          <p className="text-white/80">Spin the wheel and earn coins!</p>
        </div>

        {/* Wallet Display */}
        <WalletDisplay coins={coins} />

        {/* Tabs */}
        <Tabs defaultValue="spin" className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="spin" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-600">
              Spin
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-600">
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-600">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spin" className="mt-6">
            <div className="space-y-6">
              {/* Spin Counter */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                <p className="text-white/80 text-sm">Daily Spins</p>
                <p className="text-white text-xl font-bold">
                  {spinsToday}/{maxSpinsPerDay}
                </p>
              </div>

              {/* Spin Wheel */}
              <SpinWheel onSpinComplete={handleSpinWin} canSpin={canSpin} />

              {!canSpin && (
                <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                  <p className="text-white">
                    🚫 Daily spin limit reached! Come back tomorrow.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <UserProfile coins={coins} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <SpinHistory history={spinHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
