import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLottery } from '@/hooks/useLottery';
import { useUserData } from '@/hooks/useUserData';
import { 
  Ticket, 
  Coins, 
  Trophy, 
  Clock, 
  Users,
  Sparkles,
  Gift,
  Target,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const LotterySection: React.FC = () => {
  const { userData } = useUserData();
  const {
    lotteryGames,
    lotteryPrizes,
    userTickets,
    userWinnings,
    loading,
    purchasing,
    buyLotteryTicket,
    conductLotteryDraw,
    getTicketsForGame,
    getWinningTickets,
    getTimeUntilDraw,
    canBuyMoreTickets
  } = useLottery();

  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showTickets, setShowTickets] = useState(false);
  const [showWinnings, setShowWinnings] = useState(false);

  // Update countdown timer
  const [, setForceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (timeLeft: any) => {
    if (!timeLeft) return 'Draw time reached!';
    
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    } else {
      return `${timeLeft.minutes}m`;
    }
  };

  const getPrizeIcon = (tier: number) => {
    switch (tier) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Gift className="h-5 w-5 text-silver-500" />;
      case 3: return <Target className="h-5 w-5 text-orange-500" />;
      default: return <Sparkles className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'drawing': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const LotteryGameCard = ({ game }: { game: any }) => {
    const userTicketCount = getTicketsForGame(game.id).length;
    const canBuy = canBuyMoreTickets(game);
    const timeLeft = getTimeUntilDraw(game.draw_time);
    const prizes = lotteryPrizes[game.id] || [];
    const soldPercentage = game.max_tickets ? (game.tickets_sold / game.max_tickets) * 100 : 0;

    return (
      <Card className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Ticket className="h-6 w-6 text-blue-500" />
              {game.name}
            </CardTitle>
            <Badge className={getStatusColor(game.status)}>
              {game.status}
            </Badge>
          </div>
          <CardDescription>{game.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Jackpot Amount */}
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">Current Jackpot</p>
            <p className="text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2">
              <Coins className="h-8 w-8" />
              {game.jackpot_amount.toLocaleString()}
            </p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-500" />
              <span>Price: {game.ticket_price.toLocaleString()} coins</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span>Sold: {game.tickets_sold}/{game.max_tickets || '∞'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>{formatCountdown(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span>Your tickets: {userTicketCount}/{game.max_tickets_per_user}</span>
            </div>
          </div>

          {/* Progress Bar for Sold Tickets */}
          {game.max_tickets && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets Sold</span>
                <span>{soldPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={soldPercentage} className="h-2" />
            </div>
          )}

          {/* Prize Tiers */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Prize Tiers
            </h4>
            <div className="grid gap-1">
              {prizes.slice(0, 3).map((prize) => (
                <div key={prize.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getPrizeIcon(prize.prize_tier)}
                    <span>{prize.prize_name}</span>
                  </div>
                  <span className="font-semibold">{prize.prize_amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedGame(game)}
                >
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Ticket className="h-6 w-6" />
                    {game.name}
                  </DialogTitle>
                  <DialogDescription>{game.description}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Jackpot Display */}
                  <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg p-6 text-center">
                    <p className="text-lg text-muted-foreground mb-2">Current Jackpot</p>
                    <p className="text-4xl font-bold text-yellow-600 flex items-center justify-center gap-3">
                      <Coins className="h-10 w-10" />
                      {game.jackpot_amount.toLocaleString()} coins
                    </p>
                  </div>

                  {/* Draw Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Draw Time
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.draw_time).toLocaleString()}
                      </p>
                      <p className="text-sm font-semibold text-orange-600">
                        {formatCountdown(timeLeft)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Ticket className="h-4 w-4" />
                        Ticket Info
                      </h4>
                      <p className="text-sm">Price: {game.ticket_price.toLocaleString()} coins</p>
                      <p className="text-sm">Max per user: {game.max_tickets_per_user}</p>
                      <p className="text-sm">Your tickets: {userTicketCount}</p>
                    </div>
                  </div>

                  {/* All Prize Tiers */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Prize Breakdown
                    </h4>
                    <div className="grid gap-2">
                      {prizes.map((prize) => (
                        <Card key={prize.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getPrizeIcon(prize.prize_tier)}
                                <div>
                                  <p className="font-semibold">{prize.prize_name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {prize.max_winners} winner{prize.max_winners > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{prize.prize_amount.toLocaleString()}</p>
                                <p className="text-sm text-muted-foreground">coins</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Button */}
                  {canBuy ? (
                    <Button
                      onClick={() => buyLotteryTicket(game.id)}
                      disabled={purchasing === game.id}
                      className="w-full"
                      size="lg"
                    >
                      {purchasing === game.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Purchasing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Ticket className="h-5 w-5" />
                          Buy Ticket ({game.ticket_price.toLocaleString()} coins)
                        </div>
                      )}
                    </Button>
                  ) : (
                    <Button disabled className="w-full" size="lg">
                      {userTicketCount >= game.max_tickets_per_user ? 'Max tickets reached' :
                       game.max_tickets && game.tickets_sold >= game.max_tickets ? 'Sold out' :
                       game.status !== 'active' ? 'Not active' : 'Cannot purchase'}
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {canBuy && (
              <Button
                onClick={() => buyLotteryTicket(game.id)}
                disabled={purchasing === game.id}
                size="sm"
                className="flex-1"
              >
                {purchasing === game.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Buying...
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4" />
                    Buy Ticket
                  </div>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6" />
            Lottery Games
          </h2>
          <p className="text-muted-foreground">
            Buy tickets with coins and win amazing jackpots!
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{userData?.coins.toLocaleString() || 0}</span>
          </div>
          
          <Button variant="outline" onClick={() => setShowTickets(true)}>
            <Ticket className="h-4 w-4 mr-2" />
            My Tickets ({userTickets.length})
          </Button>
          
          <Button variant="outline" onClick={() => setShowWinnings(true)}>
            <Trophy className="h-4 w-4 mr-2" />
            Winnings ({userWinnings.length})
          </Button>
        </div>
      </div>

      {/* Lottery Games */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lotteryGames.map((game) => (
          <LotteryGameCard key={game.id} game={game} />
        ))}
      </div>

      {lotteryGames.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Ticket className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Lotteries</h3>
            <p className="text-muted-foreground">Check back later for new lottery games!</p>
          </CardContent>
        </Card>
      )}

      {/* My Tickets Dialog */}
      <Dialog open={showTickets} onOpenChange={setShowTickets}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              My Lottery Tickets
            </DialogTitle>
            <DialogDescription>
              View all your purchased lottery tickets
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {userTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tickets purchased yet</p>
                <p className="text-sm text-muted-foreground">Buy lottery tickets to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTickets.map((ticket) => {
                  const game = lotteryGames.find(g => g.id === ticket.lottery_game_id);
                  return (
                    <Card key={ticket.id} className={ticket.is_winner ? 'ring-2 ring-yellow-500' : ''}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {ticket.is_winner && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {game?.name} - #{ticket.ticket_number}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Purchased: {new Date(ticket.purchased_at).toLocaleDateString()}
                            </p>
                            {ticket.is_winner && (
                              <p className="text-sm font-semibold text-green-600">
                                🎉 Winner! Prize: {ticket.prize_amount.toLocaleString()} coins
                              </p>
                            )}
                          </div>
                          <Badge variant={ticket.is_winner ? "default" : "outline"}>
                            {ticket.is_winner ? `Tier ${ticket.prize_tier} Winner` : 'Pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Winnings Dialog */}
      <Dialog open={showWinnings} onOpenChange={setShowWinnings}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              My Winnings
            </DialogTitle>
            <DialogDescription>
              View your lottery winnings history
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {userWinnings.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No winnings yet</p>
                <p className="text-sm text-muted-foreground">Keep playing for a chance to win!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userWinnings.map((winning) => {
                  const game = lotteryGames.find(g => g.id === winning.lottery_game_id);
                  return (
                    <Card key={winning.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getPrizeIcon(winning.prize_tier)}
                            <div>
                              <h4 className="font-semibold">{game?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Tier {winning.prize_tier} • {new Date(winning.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-green-600">
                              +{winning.prize_amount.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">coins</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LotterySection;