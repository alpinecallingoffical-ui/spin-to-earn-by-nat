
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Gift, Users, Gamepad2, Video, CheckSquare, Award, Star } from 'lucide-react';
import { ReportSection } from './ReportSection';

export const AboutSection = () => {
  const features = [
    {
      icon: <Coins className="w-6 h-6" />,
      title: "Daily Spin Wheel",
      description: "Spin the wheel daily to earn coins with exciting rewards up to 1000 coins!"
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Referral System",
      description: "Invite friends and earn 100 coins for each successful referral. Your friends get 50 bonus coins too!"
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: "Daily Tasks",
      description: "Complete various tasks to earn extra coins and boost your daily earnings."
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Entertainment Videos",
      description: "Watch engaging videos and earn coins while being entertained."
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "Mini Games",
      description: "Play fun mini-games like Number Guessing and Rock Paper Scissors to win coins."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Level System",
      description: "Progress through different levels based on your coin balance and unlock special benefits."
    }
  ];

  const levels = [
    { name: "Beginner", coins: "0-99", limit: "3 spins/day", color: "bg-gray-500" },
    { name: "Bronze", coins: "100-499", limit: "5 spins/day", color: "bg-amber-600" },
    { name: "Silver", coins: "500-999", limit: "7 spins/day", color: "bg-gray-400" },
    { name: "Gold", coins: "1000-2999", limit: "10 spins/day", color: "bg-yellow-500" },
    { name: "Grand Master", coins: "3000+", limit: "Unlimited spins", color: "bg-purple-600" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">🎰 Spin to Earn</h1>
            <p className="text-xl text-white/90 mb-6">Your Ultimate Daily Reward Platform</p>
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-white/80">Made with ❤️ by</span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-4 py-1">
                ALPINE
              </Badge>
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white/10 rounded-xl p-4">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Growing Community</h3>
              <p className="text-white/70 text-sm">Join thousands of daily spinners</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Daily Rewards</h3>
              <p className="text-white/70 text-sm">Earn coins every single day</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Gift className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <h3 className="text-white font-semibold">Exciting Features</h3>
              <p className="text-white/70 text-sm">Games, videos, and more!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">✨ Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-4 flex items-start space-x-3">
                <div className="text-blue-400 mt-1">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Level System */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🏆 Level System</h2>
          <div className="space-y-3">
            {levels.map((level, index) => (
              <div key={index} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={`${level.color} text-white font-semibold px-3 py-1`}>
                    {level.name}
                  </Badge>
                  <div>
                    <span className="text-white font-medium">{level.coins} coins</span>
                  </div>
                </div>
                <div className="text-white/80 text-sm">
                  {level.limit}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">🚀 How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Sign Up</h3>
              <p className="text-white/80 text-sm">Create your account and get started</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Spin Daily</h3>
              <p className="text-white/80 text-sm">Use your daily spins to earn coins</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Complete Tasks</h3>
              <p className="text-white/80 text-sm">Earn extra coins through activities</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Level Up</h3>
              <p className="text-white/80 text-sm">Unlock more spins and benefits</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <h3 className="text-white text-xl font-bold mb-2">Built by ALPINE</h3>
            <p className="text-white/80">Dedicated to creating engaging and rewarding experiences</p>
          </div>
          <div className="flex justify-center items-center space-x-4 text-white/60 text-sm">
            <span>© 2024 Spin to Earn</span>
            <span>•</span>
            <span>Made with ❤️</span>
            <span>•</span>
            <span>Powered by ALPINE</span>
          </div>
        </CardContent>
      </Card>

      {/* Report Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Report a Problem</h2>
        <ReportSection />
      </div>
    </div>
  );
};
