-- Fix security issue: Require authentication to view daily leaderboard
-- This protects user personal information (names, profile pictures) from being publicly accessible

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public can read daily leaderboard" ON public.daily_leaderboard;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can read daily leaderboard" 
ON public.daily_leaderboard 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the service role insert policy as is for the snapshot function
-- (This policy already exists and is working correctly)