-- Create lottery games table
CREATE TABLE public.lottery_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ticket_price INTEGER NOT NULL,
  max_tickets_per_user INTEGER DEFAULT 10,
  draw_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, drawing, completed, cancelled
  total_prize_pool INTEGER DEFAULT 0,
  jackpot_amount INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  max_tickets INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lottery prizes table (different prize tiers)
CREATE TABLE public.lottery_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  prize_tier INTEGER NOT NULL, -- 1 = jackpot, 2 = second prize, etc.
  prize_name TEXT NOT NULL,
  prize_amount INTEGER NOT NULL,
  prize_percentage DECIMAL(5,2), -- percentage of total pool
  winners_count INTEGER DEFAULT 0,
  max_winners INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lottery tickets table
CREATE TABLE public.lottery_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ticket_number TEXT NOT NULL,
  numbers_chosen JSONB, -- for number-based lotteries
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_winner BOOLEAN DEFAULT false,
  prize_tier INTEGER,
  prize_amount INTEGER DEFAULT 0,
  UNIQUE(lottery_game_id, ticket_number)
);

-- Create lottery winners table
CREATE TABLE public.lottery_winners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lottery_game_id UUID REFERENCES public.lottery_games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ticket_id UUID REFERENCES public.lottery_tickets(id) ON DELETE CASCADE,
  prize_tier INTEGER NOT NULL,
  prize_amount INTEGER NOT NULL,
  claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lottery_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lottery_winners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lottery_games (public read)
CREATE POLICY "Anyone can view active lottery games" 
ON public.lottery_games 
FOR SELECT 
USING (status = 'active' OR status = 'drawing');

-- RLS Policies for lottery_prizes (public read)
CREATE POLICY "Anyone can view lottery prizes" 
ON public.lottery_prizes 
FOR SELECT 
USING (true);

-- RLS Policies for lottery_tickets
CREATE POLICY "Users can view their own tickets" 
ON public.lottery_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets" 
ON public.lottery_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lottery_winners
CREATE POLICY "Users can view their own winnings" 
ON public.lottery_winners 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Winners can update their claim status" 
ON public.lottery_winners 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to buy lottery tickets
CREATE OR REPLACE FUNCTION public.buy_lottery_ticket(
  lottery_game_uuid UUID,
  chosen_numbers JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  game_record RECORD;
  user_coins INTEGER;
  user_banned BOOLEAN;
  user_ticket_count INTEGER;
  new_ticket_number TEXT;
  ticket_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user's current coins and banned status
  SELECT coins, banned INTO user_coins, user_banned
  FROM public.users
  WHERE id = current_user_id;
  
  -- Check if user is banned
  IF user_banned = true THEN
    RETURN jsonb_build_object('success', false, 'error', 'User is banned');
  END IF;
  
  -- Get lottery game details
  SELECT * INTO game_record
  FROM public.lottery_games
  WHERE id = lottery_game_uuid AND status = 'active';
  
  IF game_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lottery game not found or not active');
  END IF;
  
  -- Check if user has enough coins
  IF user_coins < game_record.ticket_price THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient coins');
  END IF;
  
  -- Check user's current ticket count for this game
  SELECT COUNT(*) INTO user_ticket_count
  FROM public.lottery_tickets
  WHERE lottery_game_id = lottery_game_uuid AND user_id = current_user_id;
  
  -- Check if user exceeded max tickets per user
  IF user_ticket_count >= game_record.max_tickets_per_user THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum tickets per user reached');
  END IF;
  
  -- Check if lottery reached max tickets
  IF game_record.max_tickets IS NOT NULL AND game_record.tickets_sold >= game_record.max_tickets THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lottery sold out');
  END IF;
  
  -- Generate unique ticket number
  new_ticket_number := game_record.id::text || '-' || LPAD((game_record.tickets_sold + 1)::text, 6, '0');
  
  -- Deduct coins from user
  UPDATE public.users
  SET coins = coins - game_record.ticket_price
  WHERE id = current_user_id;
  
  -- Create lottery ticket
  INSERT INTO public.lottery_tickets (lottery_game_id, user_id, ticket_number, numbers_chosen)
  VALUES (lottery_game_uuid, current_user_id, new_ticket_number, chosen_numbers)
  RETURNING id INTO ticket_id;
  
  -- Update lottery game stats
  UPDATE public.lottery_games
  SET 
    tickets_sold = tickets_sold + 1,
    total_prize_pool = total_prize_pool + game_record.ticket_price,
    jackpot_amount = total_prize_pool + game_record.ticket_price,
    updated_at = now()
  WHERE id = lottery_game_uuid;
  
  RETURN jsonb_build_object(
    'success', true, 
    'ticket_id', ticket_id,
    'ticket_number', new_ticket_number,
    'message', 'Ticket purchased successfully!'
  );
END;
$$;

-- Create function to conduct lottery draw
CREATE OR REPLACE FUNCTION public.conduct_lottery_draw(
  lottery_game_uuid UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  game_record RECORD;
  prize_record RECORD;
  ticket_record RECORD;
  winners_selected INTEGER := 0;
  total_winners INTEGER := 0;
BEGIN
  -- Get lottery game
  SELECT * INTO game_record
  FROM public.lottery_games
  WHERE id = lottery_game_uuid AND status = 'active';
  
  IF game_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lottery game not found or not active');
  END IF;
  
  -- Update game status to drawing
  UPDATE public.lottery_games
  SET status = 'drawing', updated_at = now()
  WHERE id = lottery_game_uuid;
  
  -- Select winners for each prize tier
  FOR prize_record IN 
    SELECT * FROM public.lottery_prizes 
    WHERE lottery_game_id = lottery_game_uuid 
    ORDER BY prize_tier ASC
  LOOP
    winners_selected := 0;
    
    -- Select random winning tickets for this prize tier
    FOR ticket_record IN
      SELECT * FROM public.lottery_tickets
      WHERE lottery_game_id = lottery_game_uuid 
      AND is_winner = false
      ORDER BY RANDOM()
      LIMIT prize_record.max_winners
    LOOP
      -- Mark ticket as winner
      UPDATE public.lottery_tickets
      SET 
        is_winner = true,
        prize_tier = prize_record.prize_tier,
        prize_amount = prize_record.prize_amount
      WHERE id = ticket_record.id;
      
      -- Add coins to winner's account
      UPDATE public.users
      SET coins = coins + prize_record.prize_amount
      WHERE id = ticket_record.user_id;
      
      -- Create winner record
      INSERT INTO public.lottery_winners (
        lottery_game_id, user_id, ticket_id, prize_tier, prize_amount, claimed, claimed_at
      ) VALUES (
        lottery_game_uuid, ticket_record.user_id, ticket_record.id, 
        prize_record.prize_tier, prize_record.prize_amount, true, now()
      );
      
      winners_selected := winners_selected + 1;
    END LOOP;
    
    -- Update prize winners count
    UPDATE public.lottery_prizes
    SET winners_count = winners_selected
    WHERE id = prize_record.id;
    
    total_winners := total_winners + winners_selected;
  END LOOP;
  
  -- Update game status to completed
  UPDATE public.lottery_games
  SET status = 'completed', updated_at = now()
  WHERE id = lottery_game_uuid;
  
  RETURN jsonb_build_object(
    'success', true,
    'winners_count', total_winners,
    'message', 'Lottery draw completed successfully!'
  );
END;
$$;

-- Insert sample lottery games
INSERT INTO public.lottery_games (name, description, ticket_price, max_tickets_per_user, draw_time, jackpot_amount, max_tickets) VALUES
('Daily Jackpot', 'Win big every day! Draw happens at midnight.', 50, 5, '2025-07-17 00:00:00+00', 5000, 100),
('Weekly Mega Lottery', 'Huge prizes every Sunday! Multiple winners possible.', 100, 10, '2025-07-21 20:00:00+00', 15000, 500),
('Lucky Numbers', 'Choose your lucky numbers and win!', 25, 8, '2025-07-18 12:00:00+00', 2500, 200);

-- Insert sample lottery prizes
INSERT INTO public.lottery_prizes (lottery_game_id, prize_tier, prize_name, prize_amount, prize_percentage, max_winners) VALUES
-- Daily Jackpot prizes
((SELECT id FROM public.lottery_games WHERE name = 'Daily Jackpot'), 1, 'Jackpot Winner', 3000, 60.00, 1),
((SELECT id FROM public.lottery_games WHERE name = 'Daily Jackpot'), 2, 'Second Prize', 1500, 30.00, 2),
((SELECT id FROM public.lottery_games WHERE name = 'Daily Jackpot'), 3, 'Third Prize', 500, 10.00, 3),

-- Weekly Mega Lottery prizes
((SELECT id FROM public.lottery_games WHERE name = 'Weekly Mega Lottery'), 1, 'Mega Jackpot', 10000, 50.00, 1),
((SELECT id FROM public.lottery_games WHERE name = 'Weekly Mega Lottery'), 2, 'Second Prize', 3000, 20.00, 3),
((SELECT id FROM public.lottery_games WHERE name = 'Weekly Mega Lottery'), 3, 'Third Prize', 1000, 15.00, 5),
((SELECT id FROM public.lottery_games WHERE name = 'Weekly Mega Lottery'), 4, 'Consolation Prize', 500, 15.00, 10),

-- Lucky Numbers prizes
((SELECT id FROM public.lottery_games WHERE name = 'Lucky Numbers'), 1, 'Lucky Jackpot', 1500, 60.00, 1),
((SELECT id FROM public.lottery_games WHERE name = 'Lucky Numbers'), 2, 'Lucky Prize', 750, 30.00, 2),
((SELECT id FROM public.lottery_games WHERE name = 'Lucky Numbers'), 3, 'Luck Bonus', 250, 10.00, 4);

-- Create trigger for updated_at
CREATE TRIGGER update_lottery_games_updated_at
BEFORE UPDATE ON public.lottery_games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();