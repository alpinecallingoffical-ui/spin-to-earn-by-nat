
-- Create the daily_leaderboard table to save daily rankings.
CREATE TABLE public.daily_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_date DATE NOT NULL,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  profile_picture_url TEXT,
  coins INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookup by date.
CREATE INDEX idx_daily_leaderboard_date ON public.daily_leaderboard (leaderboard_date);

-- Row Level Security: Only admins should insert, but everyone can read.
ALTER TABLE public.daily_leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow select for everyone (public leaderboard).
CREATE POLICY "Public can read daily leaderboard"
  ON public.daily_leaderboard
  FOR SELECT
  USING (true);

-- Allow only service role to insert.
CREATE POLICY "Service role can insert daily leaderboard rows"
  ON public.daily_leaderboard
  FOR INSERT
  TO service_role
  WITH CHECK (true);

