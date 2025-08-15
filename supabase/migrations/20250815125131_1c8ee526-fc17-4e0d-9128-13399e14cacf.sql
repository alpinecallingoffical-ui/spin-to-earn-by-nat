-- Fix security issue: Update existing policy to require authentication
-- This protects user personal information (names, profile pictures) from being publicly accessible

-- Drop all existing policies on daily_leaderboard
DROP POLICY IF EXISTS "Public can read daily leaderboard" ON public.daily_leaderboard;
DROP POLICY IF EXISTS "Authenticated users can read daily leaderboard" ON public.daily_leaderboard;

-- Create new policy that requires authentication  
CREATE POLICY "Authenticated users can view leaderboard" 
ON public.daily_leaderboard 
FOR SELECT 
TO authenticated
USING (true);