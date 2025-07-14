-- Add banned field to users table
ALTER TABLE public.users ADD COLUMN banned boolean NOT NULL DEFAULT false;

-- Create notifications table for system messages
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  is_admin_message boolean NOT NULL DEFAULT false,
  admin_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Update record_spin function to check for banned users
CREATE OR REPLACE FUNCTION public.record_spin(user_uuid uuid, reward_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_spin_limit INTEGER;
  spin_count INTEGER;
  user_coins INTEGER;
  user_banned BOOLEAN;
BEGIN
  -- Get user's details including banned status
  SELECT daily_spin_limit, coins, banned INTO user_spin_limit, user_coins, user_banned
  FROM public.users
  WHERE id = user_uuid;
  
  -- Check if user is banned
  IF user_banned = true THEN
    RETURN FALSE;
  END IF;
  
  -- If user has 3000+ coins, they get unlimited spins (Grand Master level)
  IF user_coins >= 3000 THEN
    -- Record the spin without checking limits
    INSERT INTO public.spins (user_id, reward)
    VALUES (user_uuid, reward_amount);
    
    -- Update user's coins
    UPDATE public.users
    SET coins = coins + reward_amount
    WHERE id = user_uuid;
    
    RETURN TRUE;
  END IF;
  
  -- For users below Grand Master level, check daily limit
  SELECT COUNT(*) INTO spin_count
  FROM public.spins
  WHERE user_id = user_uuid
    AND DATE(spun_at) = CURRENT_DATE;
  
  -- Check if user can spin today based on their actual daily limit
  IF spin_count >= COALESCE(user_spin_limit, 5) THEN
    RETURN FALSE;
  END IF;
  
  -- Record the spin
  INSERT INTO public.spins (user_id, reward)
  VALUES (user_uuid, reward_amount);
  
  -- Update user's coins
  UPDATE public.users
  SET coins = coins + reward_amount
  WHERE id = user_uuid;
  
  RETURN TRUE;
END;
$function$;

-- Update complete_task function to check for banned users
CREATE OR REPLACE FUNCTION public.complete_task(task_uuid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  task_reward INTEGER;
  task_user_id UUID;
  user_coins_count INTEGER;
  user_banned BOOLEAN;
  multiplier INTEGER := 1;
BEGIN
  -- Get task details
  SELECT reward_coins, user_id INTO task_reward, task_user_id
  FROM public.tasks
  WHERE id = task_uuid AND status = 'pending';
  
  IF task_reward IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user's current coins and banned status
  SELECT coins, banned INTO user_coins_count, user_banned
  FROM public.users
  WHERE id = task_user_id;
  
  -- Check if user is banned
  IF user_banned = true THEN
    RETURN FALSE;
  END IF;
  
  -- Apply VIP multipliers
  IF user_coins_count >= 3000 THEN
    multiplier := 10; -- Grand Master
  ELSIF user_coins_count >= 2000 THEN
    multiplier := 5;  -- Elite Master
  ELSIF user_coins_count >= 1000 THEN
    multiplier := 2;  -- VIP
  END IF;
  
  -- Update task status
  UPDATE public.tasks
  SET status = 'completed', completed_at = now()
  WHERE id = task_uuid;
  
  -- Award coins with VIP multiplier
  UPDATE public.users
  SET coins = coins + (task_reward * multiplier)
  WHERE id = task_user_id;
  
  -- Record benefit usage if VIP
  IF multiplier > 1 THEN
    INSERT INTO public.user_benefits (user_id, benefit_type, benefit_data)
    VALUES (task_user_id, 'task_multiplier', jsonb_build_object('multiplier', multiplier, 'base_reward', task_reward, 'total_reward', task_reward * multiplier));
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Update record_game_score function to check for banned users
CREATE OR REPLACE FUNCTION public.record_game_score(user_uuid uuid, game_type_param text, score_param integer, reward_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  user_coins_count INTEGER;
  user_banned BOOLEAN;
  multiplier INTEGER := 1;
  final_reward INTEGER;
BEGIN
  -- Get user's current coins and banned status
  SELECT coins, banned INTO user_coins_count, user_banned
  FROM public.users
  WHERE id = user_uuid;
  
  -- Check if user is banned
  IF user_banned = true THEN
    RETURN FALSE;
  END IF;
  
  -- Apply VIP multipliers
  IF user_coins_count >= 3000 THEN
    multiplier := 10; -- Grand Master
  ELSIF user_coins_count >= 2000 THEN
    multiplier := 5;  -- Elite Master
  ELSIF user_coins_count >= 1000 THEN
    multiplier := 2;  -- VIP
  END IF;
  
  final_reward := reward_amount * multiplier;
  
  -- Record game score
  INSERT INTO public.game_scores (user_id, game_type, score, reward_coins)
  VALUES (user_uuid, game_type_param, score_param, final_reward);
  
  -- Award coins
  UPDATE public.users
  SET coins = coins + final_reward
  WHERE id = user_uuid;
  
  -- Record benefit usage if VIP
  IF multiplier > 1 THEN
    INSERT INTO public.user_benefits (user_id, benefit_type, benefit_data)
    VALUES (user_uuid, 'video_multiplier', jsonb_build_object('multiplier', multiplier, 'base_reward', reward_amount, 'total_reward', final_reward));
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Function to send ban notification
CREATE OR REPLACE FUNCTION public.send_ban_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Only send notification if user was just banned
  IF OLD.banned = false AND NEW.banned = true THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      is_admin_message
    ) VALUES (
      NEW.id,
      '🚫 Account Suspended',
      'Your account has been temporarily suspended due to violations of our terms of service. Please contact support for more information.',
      'error',
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for ban notifications
CREATE TRIGGER on_user_banned
  AFTER UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_ban_notification();