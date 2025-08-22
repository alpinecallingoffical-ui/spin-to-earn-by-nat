-- Add helper functions for the daily maintenance system

-- Function to enable extensions safely
CREATE OR REPLACE FUNCTION public.create_extension_if_not_exists(extension_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  BEGIN
    EXECUTE format('CREATE EXTENSION IF NOT EXISTS %I', extension_name);
    RETURN true;
  EXCEPTION WHEN OTHERS THEN
    -- Extension might already exist or insufficient privileges
    RETURN false;
  END;
END;
$$;

-- Function to execute SQL safely (for cron setup)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  BEGIN
    EXECUTE sql;
    RETURN 'SUCCESS';
  EXCEPTION WHEN OTHERS THEN
    RETURN SQLERRM;
  END;
END;
$$;

-- Function to refresh daily stats (placeholder for now)
CREATE OR REPLACE FUNCTION public.refresh_daily_stats()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reset daily spin counts for new day if needed
  -- This is a placeholder - could be expanded based on business logic
  RETURN true;
END;
$$;

-- Function to update leaderboard rankings
CREATE OR REPLACE FUNCTION public.update_leaderboard_rankings()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update any cached leaderboard data if needed
  -- This is a placeholder - could be expanded based on business logic
  RETURN true;
END;
$$;