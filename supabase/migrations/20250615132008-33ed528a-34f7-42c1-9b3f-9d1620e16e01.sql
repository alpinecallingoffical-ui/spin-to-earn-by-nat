
-- Insert a welcome message for every user in the system.
-- This sets the admin_id to the user with the email 'kateljayaram@gmail.com'.

WITH admin_user AS (
  SELECT id AS admin_id FROM public.users WHERE email = 'kateljayaram@gmail.com' LIMIT 1
)
INSERT INTO public.admin_messages (
  admin_id,
  user_id,
  title,
  message,
  message_type
)
SELECT 
  (SELECT admin_id FROM admin_user),
  u.id,
  'Welcome!',
  'Welcome to the admin messages system.',
  'info'
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.admin_messages am WHERE am.user_id = u.id
);
