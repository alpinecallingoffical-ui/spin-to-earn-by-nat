-- Add terms acceptance tracking to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS terms_version text DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS ip_address text,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_count integer DEFAULT 0;

-- Create user sessions table for tracking
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  user_agent text,
  login_at timestamp with time zone DEFAULT now(),
  logout_at timestamp with time zone,
  session_duration interval
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- System can insert sessions
CREATE POLICY "System can insert sessions"
ON public.user_sessions FOR INSERT
WITH CHECK (true);

-- Create system settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
ON public.system_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create user notes table for admin notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  admin_id uuid REFERENCES public.users(id) NOT NULL,
  note text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Admins can manage user notes
CREATE POLICY "Admins can manage user notes"
ON public.user_notes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_users_terms_accepted ON public.users(terms_accepted_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login_at);