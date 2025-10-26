-- Fix 1: Drop unused user_chat_messages view
DROP VIEW IF EXISTS public.user_chat_messages;

-- Fix 2: Create secure withdrawal request function
CREATE OR REPLACE FUNCTION public.request_withdrawal(
  p_esewa_number TEXT,
  p_coin_amount INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_coins INTEGER;
  v_user_banned BOOLEAN;
  v_withdrawal_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get current coins with row lock to prevent race conditions
  SELECT coins, banned INTO v_current_coins, v_user_banned
  FROM users
  WHERE id = v_user_id
  FOR UPDATE;
  
  -- Check if user is banned
  IF v_user_banned THEN
    RAISE EXCEPTION 'User is banned';
  END IF;
  
  -- Validate sufficient balance
  IF v_current_coins < p_coin_amount THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
  
  -- Validate minimum withdrawal
  IF p_coin_amount < 1000 THEN
    RAISE EXCEPTION 'Minimum withdrawal is 1000 coins';
  END IF;
  
  -- Validate eSewa number format
  IF p_esewa_number IS NULL OR length(trim(p_esewa_number)) < 10 THEN
    RAISE EXCEPTION 'Invalid eSewa number';
  END IF;
  
  -- Deduct coins atomically
  UPDATE users
  SET coins = coins - p_coin_amount
  WHERE id = v_user_id;
  
  -- Create withdrawal record
  INSERT INTO withdrawals (user_id, esewa_number, coin_amount, status)
  VALUES (v_user_id, p_esewa_number, p_coin_amount, 'pending')
  RETURNING id INTO v_withdrawal_id;
  
  RETURN v_withdrawal_id;
END;
$$;

-- Fix 3: Restrict users table access - drop overly permissive policy
DROP POLICY IF EXISTS "Users can view other users for chat" ON users;

-- Create restricted policy for viewing limited user data
CREATE POLICY "Users can view limited profile data for chat"
ON users FOR SELECT
USING (
  id = auth.uid() OR -- Users can see their own full data
  id IN ( -- Or limited data of users they have conversations with
    SELECT user1_id FROM conversations WHERE user2_id = auth.uid()
    UNION
    SELECT user2_id FROM conversations WHERE user1_id = auth.uid()
  )
);

-- Fix 4: Add admin policies to users table
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Fix 5: Add admin policies to withdrawals table for proper access
DROP POLICY IF EXISTS "Admins can view all withdrawals" ON withdrawals;
DROP POLICY IF EXISTS "Admins can manage withdrawals" ON withdrawals;

CREATE POLICY "Admins can view all withdrawals"
ON withdrawals FOR SELECT
USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can update withdrawals"
ON withdrawals FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Fix 6: Add admin policies to reports table (already exists but verify)
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update all reports" ON reports;

CREATE POLICY "Admins can view all reports"
ON reports FOR SELECT
USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can update all reports"
ON reports FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Fix 7: Create secure admin functions for user management
CREATE OR REPLACE FUNCTION public.admin_ban_user(target_user_id UUID, should_ban BOOLEAN)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side admin check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Prevent self-ban
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot ban yourself';
  END IF;
  
  UPDATE users 
  SET banned = should_ban
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_spin_limit(target_user_id UUID, new_limit INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side admin check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Validate limit
  IF new_limit < 0 OR new_limit > 1000 THEN
    RAISE EXCEPTION 'Invalid spin limit';
  END IF;
  
  UPDATE users 
  SET daily_spin_limit = new_limit
  WHERE id = target_user_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_report_status(
  report_id UUID,
  new_status TEXT,
  admin_response_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side admin check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('pending', 'in_progress', 'resolved', 'closed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  UPDATE reports
  SET 
    status = new_status,
    admin_response = COALESCE(admin_response_text, admin_response),
    resolved_at = CASE WHEN new_status = 'resolved' THEN now() ELSE resolved_at END,
    updated_at = now()
  WHERE id = report_id;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_withdrawal_status(
  withdrawal_id UUID,
  new_status TEXT,
  admin_notes_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Server-side admin check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('pending', 'approved', 'completed', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  UPDATE withdrawals
  SET 
    status = new_status,
    admin_notes = COALESCE(admin_notes_text, admin_notes),
    processed_at = CASE WHEN new_status IN ('completed', 'rejected') THEN now() ELSE processed_at END
  WHERE id = withdrawal_id;
  
  RETURN TRUE;
END;
$$;

-- Fix 8: Update spin_management admin function to require admin role
DROP FUNCTION IF EXISTS public.update_spin_status(uuid, text, text);

CREATE OR REPLACE FUNCTION public.admin_update_spin_status(
  spin_management_id UUID, 
  new_status TEXT, 
  admin_notes_text TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_val UUID;
BEGIN
  -- Server-side admin check
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  
  -- Get user_id from the spin management record
  SELECT user_id INTO user_id_val
  FROM spin_management
  WHERE id = spin_management_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Spin request not found';
  END IF;
  
  -- Update the spin management record
  UPDATE spin_management
  SET 
    status = new_status,
    admin_notes = COALESCE(admin_notes_text, admin_notes),
    processed_by = auth.uid(),
    processed_at = now()
  WHERE id = spin_management_id;
  
  RETURN TRUE;
END;
$$;

-- Add RLS policy for spin_management admin access
CREATE POLICY "Admins can view all spin requests"
ON spin_management FOR SELECT
USING (has_role(auth.uid(), 'admin') OR auth.uid() = user_id);

CREATE POLICY "Admins can update spin requests"
ON spin_management FOR UPDATE
USING (has_role(auth.uid(), 'admin'));