-- Fix security issue: Add RLS policies to user_daily_stats to protect user personal information
-- This prevents unauthorized access to user emails, names, and other personal data

-- Enable Row Level Security on user_daily_stats
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own data
CREATE POLICY "Users can view their own daily stats" 
ON public.user_daily_stats 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow service role (for admin functions) to view all data
CREATE POLICY "Service role can view all daily stats" 
ON public.user_daily_stats 
FOR SELECT 
TO service_role
USING (true);

-- Note: Since this appears to be a view/aggregated table, we're not allowing INSERT/UPDATE/DELETE
-- as those operations should happen through the underlying tables (users, spins, etc.)