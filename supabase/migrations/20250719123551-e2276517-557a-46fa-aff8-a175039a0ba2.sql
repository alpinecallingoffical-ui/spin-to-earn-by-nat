-- Fix the convert_diamonds_to_coins function to use proper conversion rates instead of hardcoded 1000
CREATE OR REPLACE FUNCTION public.convert_diamonds_to_coins(diamond_amount integer)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
  user_diamonds INTEGER;
  coin_equivalent INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user's current diamonds
  SELECT diamonds INTO user_diamonds
  FROM public.users
  WHERE id = current_user_id;
  
  -- Check if user has enough diamonds
  IF user_diamonds < diamond_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate coin equivalent based on diamond amount using the same rates as packages
  -- 1 diamond = 400 coins, 2 = 900, 3 = 1400, 5 = 2500, 10 = 5200, 20 = 11000
  CASE 
    WHEN diamond_amount = 1 THEN coin_equivalent := 400;
    WHEN diamond_amount = 2 THEN coin_equivalent := 900;
    WHEN diamond_amount = 3 THEN coin_equivalent := 1400;
    WHEN diamond_amount = 5 THEN coin_equivalent := 2500;
    WHEN diamond_amount = 10 THEN coin_equivalent := 5200;
    WHEN diamond_amount = 20 THEN coin_equivalent := 11000;
    ELSE 
      -- For other amounts, use base rate of 400 coins per diamond
      coin_equivalent := diamond_amount * 400;
  END CASE;
  
  -- Deduct diamonds and add coins
  UPDATE public.users
  SET 
    diamonds = diamonds - diamond_amount,
    coins = coins + coin_equivalent
  WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$function$