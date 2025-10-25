-- Add username column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Function to generate unique username from name
CREATE OR REPLACE FUNCTION generate_username(base_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  clean_name TEXT;
  test_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Clean the name: lowercase, remove spaces and special chars
  clean_name := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '', 'g'));
  
  -- Try base username first
  test_username := clean_name;
  
  -- If username exists, append numbers until we find unique one
  WHILE EXISTS (SELECT 1 FROM public.users WHERE username = test_username) LOOP
    counter := counter + 1;
    test_username := clean_name || counter::text;
  END LOOP;
  
  RETURN test_username;
END;
$$;

-- Backfill usernames for existing users
DO $$
DECLARE
  user_record RECORD;
  new_username TEXT;
BEGIN
  FOR user_record IN SELECT id, name FROM public.users WHERE username IS NULL
  LOOP
    new_username := generate_username(user_record.name);
    UPDATE public.users SET username = new_username WHERE id = user_record.id;
  END LOOP;
END;
$$;

-- Make username NOT NULL after backfill
ALTER TABLE public.users ALTER COLUMN username SET NOT NULL;

-- Update handle_new_user function to generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_referral_code TEXT;
  referrer_user_id UUID;
  initial_coins INTEGER := 0;
  generated_username TEXT;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_referral_code);
  END LOOP;

  -- Generate unique username
  generated_username := generate_username(COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'user'));

  -- Check if user was referred and set initial coins
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    initial_coins := 50;
  END IF;

  -- Insert new user profile
  INSERT INTO public.users (id, name, email, phone, referral_code, referred_by, coins, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NEW.phone,
    new_referral_code,
    NEW.raw_user_meta_data->>'referred_by',
    initial_coins,
    generated_username
  );

  -- Handle referral bonus
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO referrer_user_id 
    FROM public.users 
    WHERE referral_code = NEW.raw_user_meta_data->>'referred_by';
    
    IF referrer_user_id IS NOT NULL THEN
      UPDATE public.users 
      SET coins = coins + 100 
      WHERE id = referrer_user_id;
      
      INSERT INTO public.referrals (referrer_id, referred_user_id, bonus_given)
      VALUES (referrer_user_id, NEW.id, 100);
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$;