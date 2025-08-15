-- Fix security issue: Secure user_daily_stats view to protect personal information
-- Since user_daily_stats is a view, we need to recreate it with proper security

-- First, drop the existing view
DROP VIEW IF EXISTS public.user_daily_stats;

-- Create a security definer function to get user daily stats
CREATE OR REPLACE FUNCTION public.get_user_daily_stats()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  total_coins integer,
  daily_spin_limit integer,
  today_spins bigint,
  today_coins bigint,
  pending_requests bigint
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    u.id,
    u.name,
    u.email,
    u.coins AS total_coins,
    u.daily_spin_limit,
    COALESCE(today_spins.spin_count, 0::bigint) AS today_spins,
    COALESCE(today_spins.today_coins, 0::bigint) AS today_coins,
    COALESCE(pending_requests.pending_count, 0::bigint) AS pending_requests
  FROM users u
  LEFT JOIN (
    SELECT 
      spins.user_id,
      count(*) AS spin_count,
      sum(spins.reward) AS today_coins
    FROM spins
    WHERE date(spins.spun_at) = CURRENT_DATE
    GROUP BY spins.user_id
  ) today_spins ON (u.id = today_spins.user_id)
  LEFT JOIN (
    SELECT 
      spin_management.user_id,
      count(*) AS pending_count
    FROM spin_management
    WHERE spin_management.status = 'pending'::text
    GROUP BY spin_management.user_id
  ) pending_requests ON (u.id = pending_requests.user_id)
  WHERE u.id = auth.uid(); -- Only return current user's data
$$;

-- Recreate the view with security
CREATE VIEW public.user_daily_stats AS
SELECT * FROM public.get_user_daily_stats();

-- Enable RLS on the view (this will work now)
ALTER VIEW public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to see only their own data
CREATE POLICY "Users can view their own daily stats" 
ON public.user_daily_stats 
FOR SELECT 
TO authenticated
USING (id = auth.uid());