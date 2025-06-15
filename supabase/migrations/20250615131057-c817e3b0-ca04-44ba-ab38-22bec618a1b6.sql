
-- Create the admin_messages table to store messages sent by admins to users
CREATE TABLE public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL, -- admin user who sent the message
  user_id uuid NOT NULL,  -- recipient user
  title text NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'info',
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- (Optional) Add basic RLS policies if you want:
-- Enable RLS to protect the messages
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert/select/update/delete their sent messages
CREATE POLICY "Admin can manage their messages" ON public.admin_messages
  USING (auth.uid() = admin_id);

-- Allow users to read their own messages
CREATE POLICY "Recipient can read own messages" ON public.admin_messages
  FOR SELECT
  USING (auth.uid() = user_id);

