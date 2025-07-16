import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface LotteryGame {
  id: string;
  name: string;
  description?: string;
  ticket_price: number;
  max_tickets_per_user: number;
  draw_time: string;
  status: string;
  total_prize_pool: number;
  jackpot_amount: number;
  tickets_sold: number;
  max_tickets?: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryPrize {
  id: string;
  lottery_game_id: string;
  prize_tier: number;
  prize_name: string;
  prize_amount: number;
  prize_percentage?: number;
  winners_count: number;
  max_winners: number;
  created_at: string;
}

export interface LotteryTicket {
  id: string;
  lottery_game_id: string;
  user_id: string;
  ticket_number: string;
  numbers_chosen?: any;
  purchased_at: string;
  is_winner: boolean;
  prize_tier?: number;
  prize_amount: number;
}

export interface LotteryWinner {
  id: string;
  lottery_game_id: string;
  user_id: string;
  ticket_id: string;
  prize_tier: number;
  prize_amount: number;
  claimed: boolean;
  claimed_at?: string;
  created_at: string;
  lottery_tickets?: LotteryTicket;
}

export const useLottery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lotteryGames, setLotteryGames] = useState<LotteryGame[]>([]);
  const [lotteryPrizes, setLotteryPrizes] = useState<Record<string, LotteryPrize[]>>({});
  const [userTickets, setUserTickets] = useState<LotteryTicket[]>([]);
  const [userWinnings, setUserWinnings] = useState<LotteryWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Fetch active lottery games
  const fetchLotteryGames = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_games')
        .select('*')
        .in('status', ['active', 'drawing'])
        .order('draw_time', { ascending: true });

      if (error) throw error;
      setLotteryGames(data || []);
    } catch (error) {
      console.error('Error fetching lottery games:', error);
      toast({
        title: "Error",
        description: "Failed to load lottery games",
        variant: "destructive",
      });
    }
  };

  // Fetch lottery prizes for all games
  const fetchLotteryPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_prizes')
        .select('*')
        .order('prize_tier', { ascending: true });

      if (error) throw error;
      
      // Group prizes by lottery game ID
      const prizesGrouped = (data || []).reduce((acc, prize) => {
        if (!acc[prize.lottery_game_id]) {
          acc[prize.lottery_game_id] = [];
        }
        acc[prize.lottery_game_id].push(prize);
        return acc;
      }, {} as Record<string, LotteryPrize[]>);
      
      setLotteryPrizes(prizesGrouped);
    } catch (error) {
      console.error('Error fetching lottery prizes:', error);
    }
  };

  // Fetch user's lottery tickets
  const fetchUserTickets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lottery_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setUserTickets(data || []);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
    }
  };

  // Fetch user's lottery winnings
  const fetchUserWinnings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lottery_winners')
        .select(`
          *,
          lottery_tickets (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserWinnings(data || []);
    } catch (error) {
      console.error('Error fetching user winnings:', error);
    }
  };

  // Buy lottery ticket
  const buyLotteryTicket = async (lotteryGameId: string, chosenNumbers?: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to buy lottery tickets",
        variant: "destructive",
      });
      return false;
    }

    setPurchasing(lotteryGameId);
    try {
      const { data, error } = await supabase.rpc('buy_lottery_ticket', {
        lottery_game_uuid: lotteryGameId,
        chosen_numbers: chosenNumbers || null
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Ticket Purchased! 🎫",
          description: `${result.message} Ticket #${result.ticket_number}`,
        });
        
        // Refresh data
        await Promise.all([
          fetchLotteryGames(),
          fetchUserTickets()
        ]);
        
        return true;
      } else {
        const errorResult = result || {};
        toast({
          title: "Purchase Failed",
          description: errorResult.error || "Unable to purchase ticket",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error buying lottery ticket:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during ticket purchase",
        variant: "destructive",
      });
      return false;
    } finally {
      setPurchasing(null);
    }
  };

  // Conduct lottery draw (admin function)
  const conductLotteryDraw = async (lotteryGameId: string) => {
    try {
      const { data, error } = await supabase.rpc('conduct_lottery_draw', {
        lottery_game_uuid: lotteryGameId
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        toast({
          title: "Draw Completed! 🎉",
          description: `${result.message} Winners: ${result.winners_count}`,
        });
        
        // Refresh data
        await Promise.all([
          fetchLotteryGames(),
          fetchUserWinnings()
        ]);
        
        return true;
      } else {
        const errorResult = result || {};
        toast({
          title: "Draw Failed",
          description: errorResult.error || "Unable to conduct draw",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error conducting lottery draw:', error);
      toast({
        title: "Draw Failed",
        description: "An error occurred during the draw",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get tickets for specific lottery game
  const getTicketsForGame = (lotteryGameId: string) => {
    return userTickets.filter(ticket => ticket.lottery_game_id === lotteryGameId);
  };

  // Get winning tickets
  const getWinningTickets = () => {
    return userTickets.filter(ticket => ticket.is_winner);
  };

  // Calculate time until draw
  const getTimeUntilDraw = (drawTime: string) => {
    const now = new Date().getTime();
    const draw = new Date(drawTime).getTime();
    const diff = draw - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  // Check if user can buy more tickets for a game
  const canBuyMoreTickets = (game: LotteryGame) => {
    if (!user) return false;
    
    const userTicketCount = getTicketsForGame(game.id).length;
    const hasReachedUserLimit = userTicketCount >= game.max_tickets_per_user;
    const isSoldOut = game.max_tickets && game.tickets_sold >= game.max_tickets;
    const isInactive = game.status !== 'active';
    
    return !hasReachedUserLimit && !isSoldOut && !isInactive;
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLotteryGames(),
        fetchLotteryPrizes(),
        fetchUserTickets(),
        fetchUserWinnings()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const lotteryGamesSubscription = supabase
      .channel('lottery_games_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lottery_games'
        },
        () => {
          fetchLotteryGames();
        }
      )
      .subscribe();

    const ticketsSubscription = supabase
      .channel('lottery_tickets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lottery_tickets',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserTickets();
        }
      )
      .subscribe();

    const winnersSubscription = supabase
      .channel('lottery_winners_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lottery_winners',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserWinnings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lotteryGamesSubscription);
      supabase.removeChannel(ticketsSubscription);
      supabase.removeChannel(winnersSubscription);
    };
  }, [user]);

  return {
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
    canBuyMoreTickets,
    fetchLotteryGames,
    fetchUserTickets,
    fetchUserWinnings
  };
};