-- Fix security issue: Replace insecure user_daily_stats view with secure function
-- This approach protects user personal information by ensuring only authenticated users can see their own data

-- Drop the existing insecure view
DROP VIEW IF EXISTS public.user_daily_stats;

-- Create a secure function that returns current user's daily stats only
CREATE OR REPLACE FUNCTION public.get_current_user_daily_stats()
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
  WHERE u.id = auth.uid(); -- Security: Only return authenticated user's data
$$;

-- Create an admin-only function for administrative purposes (service role only)
CREATE OR REPLACE FUNCTION public.get_all_user_daily_stats()
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
  ) pending_requests ON (u.id = pending_requests.user_id);
$$;

-- Grant execute permissions only to authenticated users for the secure function
GRANT EXECUTE ON FUNCTION public.get_current_user_daily_stats() TO authenticated;

-- Grant execute permissions only to service role for the admin function
GRANT EXECUTE ON FUNCTION public.get_all_user_daily_stats() TO service_role;