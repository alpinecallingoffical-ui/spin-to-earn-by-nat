
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  cost: number;
  reward: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const games: Game[] = [
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Match pairs of cards to win coins!',
    icon: '🧠',
    cost: 10,
    reward: '20-50 coins',
    difficulty: 'Easy'
  },
  {
    id: 'puzzle',
    title: 'Number Puzzle',
    description: 'Solve the number sequence puzzle',
    icon: '🧩',
    cost: 20,
    reward: '50-100 coins',
    difficulty: 'Medium'
  },
  {
    id: 'quiz',
    title: 'Quick Quiz',
    description: 'Answer trivia questions correctly',
    icon: '🧠',
    cost: 15,
    reward: '30-80 coins',
    difficulty: 'Easy'
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    description: 'Test your reflexes and reaction speed',
    icon: '⚡',
    cost: 25,
    reward: '60-120 coins',
    difficulty: 'Hard'
  },
  {
    id: 'word',
    title: 'Word Challenge',
    description: 'Find words in the letter grid',
    icon: '📝',
    cost: 30,
    reward: '80-150 coins',
    difficulty: 'Medium'
  },
  {
    id: 'slots',
    title: 'Mini Slots',
    description: 'Try your luck with mini slot machine',
    icon: '🎰',
    cost: 50,
    reward: '100-300 coins',
    difficulty: 'Hard'
  }
];

export const GamesSection: React.FC = () => {
  const { userData } = useUserData();
  const { toast } = useToast();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handlePlayGame = (game: Game) => {
    if (!userData || userData.coins < game.cost) {
      toast({
        title: 'Insufficient Coins',
        description: `You need ${game.cost} coins to play this game.`,
        variant: 'destructive',
      });
      return;
    }

    setSelectedGame(game);
    toast({
      title: '🎮 Game Starting!',
      description: `Starting ${game.title}. Good luck!`,
    });

    // Simulate game play (you can replace this with actual game logic)
    setTimeout(() => {
      const randomReward = Math.floor(Math.random() * 100) + 20;
      toast({
        title: '🎉 Game Complete!',
        description: `You won ${randomReward} coins!`,
      });
      setSelectedGame(null);
    }, 3000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center">
            🎮 Mini Games Collection
            <span className="ml-3 text-sm bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-full">
              Earn More Coins!
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 mb-6">
            Play exciting mini-games to earn extra coins! Each game costs coins to play but offers great rewards.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.id} className="bg-white/10 border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl">{game.icon}</div>
                    <div className={`text-sm font-bold ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg">{game.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 text-sm">{game.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Cost:</span>
                      <span className="text-red-400 font-bold">{game.cost} coins</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Reward:</span>
                      <span className="text-green-400 font-bold">{game.reward}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePlayGame(game)}
                    disabled={!userData || userData.coins < game.cost || selectedGame !== null}
                    className={`w-full py-2 rounded-xl font-semibold transition-all ${
                      userData && userData.coins >= game.cost && selectedGame === null
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {selectedGame?.id === game.id ? (
                      <>⏳ Playing...</>
                    ) : userData && userData.coins >= game.cost ? (
                      <>🎮 Play Now</>
                    ) : (
                      <>🚫 Need {game.cost} coins</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Stats */}
      <Card className="bg-white/20 backdrop-blur-sm border-white/30">
        <CardHeader>
          <CardTitle className="text-white text-xl">📊 Gaming Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Games Played Today</p>
              <p className="text-white font-bold text-2xl">0</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Coins Earned</p>
              <p className="text-green-400 font-bold text-2xl">0</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">Win Rate</p>
              <p className="text-yellow-400 font-bold text-2xl">0%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
