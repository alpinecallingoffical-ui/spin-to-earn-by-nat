
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Trophy, Gamepad, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserData } from '@/hooks/useUserData';
import { NumberGuessingGame } from './games/NumberGuessingGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { QuickMathGame } from './games/QuickMathGame';

interface Game {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  reward: number;
  timeToPlay: string;
  component: string;
}

export const GamesSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { userData, refetch } = useUserData();

  if (userData?.banned) {
    return (
      <div className="text-center p-8">
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-6">
          <h2 className="text-red-400 text-xl font-bold mb-2">🚫 Account Suspended</h2>
          <p className="text-white/80">Your account has been temporarily suspended. You cannot play games at this time.</p>
        </div>
      </div>
    );
  }
  const [games] = useState<Game[]>([
    {
      id: '1',
      title: 'Number Guessing',
      emoji: '🔢',
      description: 'Guess the secret number between 1-100 in minimum attempts',
      difficulty: 'easy',
      category: 'Puzzle',
      reward: 15,
      timeToPlay: '3-5 min',
      component: 'NumberGuessingGame'
    },
    {
      id: '2',
      title: 'Memory Match',
      emoji: '🧠',
      description: 'Match pairs of cards and test your memory skills',
      difficulty: 'medium',
      category: 'Memory',
      reward: 25,
      timeToPlay: '5-8 min',
      component: 'MemoryMatchGame'
    },
    {
      id: '3',
      title: 'Quick Math',
      emoji: '➕',
      description: 'Solve math problems as fast as you can',
      difficulty: 'easy',
      category: 'Educational',
      reward: 20,
      timeToPlay: '2-4 min',
      component: 'QuickMathGame'
    }
  ]);

  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [playedGames, setPlayedGames] = useState<string[]>([]);

  const getVipMultiplier = (coins: number) => {
    if (coins >= 3000) return 10; // Grand Master
    if (coins >= 2000) return 5;  // Elite Master
    if (coins >= 1000) return 2;  // VIP
    return 1; // Regular
  };

  const playGame = (gameId: string) => {
    setCurrentGame(gameId);
  };

  const handleGameComplete = async (gameId: string, score: number) => {
    if (!user) return;

    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      // Record game score and award coins
      const { data, error } = await supabase.rpc('record_game_score', {
        user_uuid: user.id,
        game_type_param: game.component,
        score_param: score,
        reward_amount: game.reward
      });

      if (error) throw error;

      if (data) {
        const multiplier = getVipMultiplier(userData?.coins || 0);
        const finalReward = game.reward * multiplier;
        
        toast({
          title: '🎮 Game Completed!',
          description: `Great job! You earned ${finalReward} coins playing "${game.title}" with a score of ${score}!${multiplier > 1 ? ` (${multiplier}x VIP bonus!)` : ''}`,
        });

        setPlayedGames(prev => [...prev, gameId]);
        await refetch();
      }
    } catch (error) {
      console.error('Error recording game completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to record game completion. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCurrentGame(null);
    }
  };

  const closeGame = () => {
    setCurrentGame(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Puzzle': return 'bg-purple-500';
      case 'Memory': return 'bg-blue-500';
      case 'Educational': return 'bg-indigo-500';
      case 'Word': return 'bg-pink-500';
      case 'Reaction': return 'bg-orange-500';
      case 'Arcade': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const vipMultiplier = getVipMultiplier(userData?.coins || 0);

  const renderGame = () => {
    const game = games.find(g => g.id === currentGame);
    if (!game) return null;

    const gameProps = {
      onComplete: (score: number) => handleGameComplete(currentGame!, score),
      onClose: closeGame
    };

    switch (game.component) {
      case 'NumberGuessingGame':
        return <NumberGuessingGame {...gameProps} />;
      case 'MemoryMatchGame':
        return <MemoryMatchGame {...gameProps} />;
      case 'QuickMathGame':
        return <QuickMathGame {...gameProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* VIP Multiplier Banner */}
      {vipMultiplier > 1 && (
        <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl p-4 border border-yellow-400/50">
          <div className="text-center">
            <p className="text-yellow-300 font-bold animate-pulse">🎉 VIP GAMING BENEFITS! 🎉</p>
            <p className="text-white/90">All game rewards have {vipMultiplier}x multiplier!</p>
          </div>
        </div>
      )}

      {/* Gaming Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white text-xl font-bold mb-4">🎮 Gaming Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{playedGames.length}</div>
            <div className="text-white/80 text-sm">Games Played Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">∞</div>
            <div className="text-white/80 text-sm">Games Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{vipMultiplier}x</div>
            <div className="text-white/80 text-sm">Reward Multiplier</div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      {currentGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {renderGame()}
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const finalReward = game.reward * vipMultiplier;
          
          return (
            <div key={game.id} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/20 transition-all">
              <div className="relative p-6 text-center">
                <div className="text-4xl mb-2">{game.emoji}</div>
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <Badge className={`${getCategoryColor(game.category)} text-white text-xs`}>
                    {game.category}
                  </Badge>
                  <Badge className={`${getDifficultyColor(game.difficulty)} text-white text-xs`}>
                    {game.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="text-white font-semibold mb-2">{game.title}</h4>
                <p className="text-white/70 text-sm mb-3">{game.description}</p>
                
                <div className="flex items-center justify-between text-xs text-white/60 mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {game.timeToPlay}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-semibold">
                    +{finalReward} coins
                    {vipMultiplier > 1 && (
                      <span className="ml-1 text-xs bg-yellow-500 text-white px-1 py-0.5 rounded">
                        {vipMultiplier}x
                      </span>
                    )}
                  </span>
                </div>
                
                <Button 
                  onClick={() => playGame(game.id)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                  disabled={!!currentGame}
                >
                  <Gamepad className="w-4 h-4 mr-2" />
                  Play Game
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
