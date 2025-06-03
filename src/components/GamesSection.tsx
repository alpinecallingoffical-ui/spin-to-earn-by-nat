
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Play, Trophy, Gamepad, Clock } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  reward: number;
  played: boolean;
  highScore?: number;
  timeToPlay: string;
}

interface GameSession {
  gameId: string;
  playing: boolean;
  progress: number;
}

export const GamesSection = () => {
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      title: 'Number Guessing',
      emoji: '🔢',
      description: 'Guess the secret number between 1-100 in minimum attempts',
      difficulty: 'easy',
      category: 'Puzzle',
      reward: 15,
      played: false,
      timeToPlay: '3-5 min'
    },
    {
      id: '2',
      title: 'Memory Match',
      emoji: '🧠',
      description: 'Match pairs of cards and test your memory skills',
      difficulty: 'medium',
      category: 'Memory',
      reward: 25,
      played: false,
      timeToPlay: '5-8 min'
    },
    {
      id: '3',
      title: 'Quick Math',
      emoji: '➕',
      description: 'Solve math problems as fast as you can',
      difficulty: 'easy',
      category: 'Educational',
      reward: 20,
      played: false,
      timeToPlay: '2-4 min'
    },
    {
      id: '4',
      title: 'Word Puzzle',
      emoji: '🔤',
      description: 'Find hidden words in the letter grid',
      difficulty: 'medium',
      category: 'Word',
      reward: 30,
      played: false,
      timeToPlay: '8-12 min'
    },
    {
      id: '5',
      title: 'Color Match',
      emoji: '🌈',
      description: 'Match colors in the right sequence before time runs out',
      difficulty: 'hard',
      category: 'Reaction',
      reward: 40,
      played: false,
      timeToPlay: '10-15 min'
    },
    {
      id: '6',
      title: 'Snake Classic',
      emoji: '🐍',
      description: 'Classic snake game with a modern twist',
      difficulty: 'medium',
      category: 'Arcade',
      reward: 35,
      played: false,
      timeToPlay: '5-10 min'
    }
  ]);

  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  const playGame = (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setGameSession({ gameId, playing: true, progress: 0 });

    // Simulate game progress
    const interval = setInterval(() => {
      setGameSession(prev => {
        if (!prev) return null;
        const newProgress = prev.progress + 20;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Mark game as played and give reward
          setGames(prevGames => prevGames.map(g => 
            g.id === gameId ? { ...g, played: true, highScore: Math.floor(Math.random() * 1000) + 500 } : g
          ));
          
          toast({
            title: '🎮 Game Completed!',
            description: `Great job! You earned ${game.reward} coins playing "${game.title}"`,
          });
          
          return null;
        }
        
        return { ...prev, progress: newProgress };
      });
    }, 800);
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

  const playedGames = games.filter(g => g.played).length;
  const totalEarned = games.filter(g => g.played).reduce((sum, g) => sum + g.reward, 0);
  const totalHighScore = games.filter(g => g.highScore).reduce((sum, g) => sum + (g.highScore || 0), 0);

  return (
    <div className="space-y-6">
      {/* Gaming Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-white text-xl font-bold mb-4">🎮 Gaming Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{playedGames}/{games.length}</div>
            <div className="text-white/80 text-sm">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalEarned}</div>
            <div className="text-white/80 text-sm">Coins Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{totalHighScore.toLocaleString()}</div>
            <div className="text-white/80 text-sm">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{Math.round((playedGames / games.length) * 100)}%</div>
            <div className="text-white/80 text-sm">Completion</div>
          </div>
        </div>
      </div>

      {/* Game Player Modal */}
      {gameSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-white text-xl font-bold mb-2">Playing Game...</h3>
              <p className="text-white/80 mb-4">Get ready for some fun!</p>
              <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{width: `${gameSession.progress}%`}}
                ></div>
              </div>
              <p className="text-white/60 text-sm">Progress: {gameSession.progress}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
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
              {game.played && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-500 text-white text-xs flex items-center">
                    <Trophy className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
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
                  {game.highScore && (
                    <span className="flex items-center">
                      <Trophy className="w-3 h-3 mr-1" />
                      {game.highScore.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-yellow-400 font-semibold">+{game.reward} coins</span>
              </div>
              
              {game.played ? (
                <Button disabled className="w-full bg-green-600 text-white opacity-75">
                  <Trophy className="w-4 h-4 mr-2" />
                  Completed
                </Button>
              ) : (
                <Button 
                  onClick={() => playGame(game.id)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
                  disabled={gameSession?.playing}
                >
                  <Gamepad className="w-4 h-4 mr-2" />
                  Play Game
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
