-- Fix the admin_id column to allow NULL values for system messages
ALTER TABLE public.admin_messages ALTER COLUMN admin_id DROP NOT NULL;

-- Update the trigger function to handle the admin_id properly
CREATE OR REPLACE FUNCTION public.send_welcome_admin_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  system_admin_id UUID;
BEGIN
  -- Try to get the first admin user, or use a system default
  SELECT id INTO system_admin_id 
  FROM public.users 
  LIMIT 1;
  
  -- If no admin found, we'll use NULL (system message)
  INSERT INTO public.admin_messages (
    admin_id,
    user_id,
    title,
    message,
    message_type,
    sent_at,
    user_name,
    user_email
  ) VALUES (
    system_admin_id, -- This can be NULL now
    NEW.id,
    '👋 Welcome to SpinToEarn!',
    'Welcome to SpinToEarn, your one-stop destination for earning rewards, prizes, and bonuses just by spinning! Whether you''re here for fun, to win big, or to explore exciting offers, you''ve joined a platform designed to make your experience easy, engaging, and rewarding.

At SpinToEarn, every spin counts — and every user matters.

Our platform offers interactive spinning games, limited-time promotions, loyalty-based bonuses, and real-time updates to ensure you''re always in the loop. You''ll discover daily challenges, seasonal events, and other surprises that make spinning not just fun, but potentially valuable too. Our mission is to provide a fair, transparent, and exciting environment where rewards come through play and persistence.',
    'info',
    NOW(),
    NEW.name,
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create the trigger for welcome messages if it doesn't exist
DROP TRIGGER IF EXISTS send_welcome_message_trigger ON public.users;
CREATE TRIGGER send_welcome_message_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.send_welcome_admin_message();