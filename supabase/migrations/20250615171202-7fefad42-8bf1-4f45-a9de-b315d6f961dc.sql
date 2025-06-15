
-- 1. Create a function to insert a welcome admin_message for new users
CREATE OR REPLACE FUNCTION public.send_welcome_admin_message()
RETURNS TRIGGER AS $$
BEGIN
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
    NULL, -- You can fill this with a specific admin uuid if you want, or keep NULL for system
    NEW.id,
    '👋 Welcome to SpinToEarn!',
    'Welcome to SpinToEarn, your one-stop destination for earning rewards, prizes, and bonuses just by spinning! Whether you’re here for fun, to win big, or to explore exciting offers, you’ve joined a platform designed to make your experience easy, engaging, and rewarding.

At SpinToEarn, every spin counts — and every user matters.

Our platform offers interactive spinning games, limited-time promotions, loyalty-based bonuses, and real-time updates to ensure you''re always in the loop. You’ll discover daily challenges, seasonal events, and other surprises that make spinning not just fun, but potentially valuable too. Our mission is to provide a fair, transparent, and exciting environment where rewards come through play and persistence.',
    'info',
    NOW(),
    NEW.name,
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a trigger to call this function after every user inserts
DROP TRIGGER IF EXISTS trigger_send_welcome_admin_message ON public.users;

CREATE TRIGGER trigger_send_welcome_admin_message
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.send_welcome_admin_message();
