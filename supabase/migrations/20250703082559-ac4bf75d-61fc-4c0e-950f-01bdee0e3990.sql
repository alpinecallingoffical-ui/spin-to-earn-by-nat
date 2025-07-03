
-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_user_id UUID;
  initial_coins INTEGER := 0;
BEGIN
  -- Generate unique referral code
  LOOP
    new_referral_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.users WHERE referral_code = new_referral_code);
  END LOOP;

  -- Check if user was referred and set initial coins
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    initial_coins := 50; -- Welcome bonus for referred users
  END IF;

  -- Insert new user profile
  INSERT INTO public.users (id, name, email, phone, referral_code, referred_by, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'User'),
    NEW.email,
    NEW.phone,
    new_referral_code,
    NEW.raw_user_meta_data->>'referred_by',
    initial_coins
  );

  -- Handle referral bonus if user was referred
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    -- Find the referrer
    SELECT id INTO referrer_user_id 
    FROM public.users 
    WHERE referral_code = NEW.raw_user_meta_data->>'referred_by';
    
    IF referrer_user_id IS NOT NULL THEN
      -- Give bonus to referrer (100 coins)
      UPDATE public.users 
      SET coins = coins + 100 
      WHERE id = referrer_user_id;
      
      -- Record the referral
      INSERT INTO public.referrals (referrer_id, referred_user_id, bonus_given)
      VALUES (referrer_user_id, NEW.id, 100);
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger to automatically create user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing auth users who don't have profiles yet
INSERT INTO public.users (id, name, email, phone, referral_code, coins)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1), 'User'),
  au.email,
  au.phone,
  generate_referral_code(),
  0
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
