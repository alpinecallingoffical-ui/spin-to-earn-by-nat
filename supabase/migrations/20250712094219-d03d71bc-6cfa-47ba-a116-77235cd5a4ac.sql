-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.friend_requests CASCADE;
DROP TABLE IF EXISTS public.friendships CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.send_friend_request(UUID);
DROP FUNCTION IF EXISTS public.accept_friend_request(UUID);
DROP FUNCTION IF EXISTS public.reject_friend_request(UUID);
DROP FUNCTION IF EXISTS public.remove_friend(UUID);

-- Create friend_requests table for managing pending friend requests
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  requested_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate requests
  UNIQUE(requester_id, requested_id),
  -- Prevent self-requests
  CHECK (requester_id != requested_id)
);

-- Create friendships table for confirmed friendships
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure user1_id < user2_id to avoid duplicate friendships
  CHECK (user1_id < user2_id),
  -- Prevent self-friendships
  CHECK (user1_id != user2_id),
  -- Unique friendship
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
CREATE POLICY "Users can view requests involving them"
ON public.friend_requests FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = requested_id);

CREATE POLICY "Users can create friend requests"
ON public.friend_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update requests they received"
ON public.friend_requests FOR UPDATE
USING (auth.uid() = requested_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to send friend request
CREATE OR REPLACE FUNCTION public.send_friend_request(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if users are already friends
  IF EXISTS (
    SELECT 1 FROM public.friendships 
    WHERE (user1_id = LEAST(current_user_id, target_user_id) 
           AND user2_id = GREATEST(current_user_id, target_user_id))
  ) THEN
    RETURN FALSE; -- Already friends
  END IF;
  
  -- Check if request already exists
  IF EXISTS (
    SELECT 1 FROM public.friend_requests 
    WHERE (requester_id = current_user_id AND requested_id = target_user_id)
       OR (requester_id = target_user_id AND requested_id = current_user_id)
  ) THEN
    RETURN FALSE; -- Request already exists
  END IF;
  
  -- Create friend request
  INSERT INTO public.friend_requests (requester_id, requested_id)
  VALUES (current_user_id, target_user_id);
  
  RETURN TRUE;
END;
$$;

-- Function to accept friend request
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  req_record RECORD;
  user1_id UUID;
  user2_id UUID;
BEGIN
  -- Get request details
  SELECT * INTO req_record
  FROM public.friend_requests
  WHERE id = request_id AND requested_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update request status
  UPDATE public.friend_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = request_id;
  
  -- Create friendship (ensure user1_id < user2_id)
  user1_id := LEAST(req_record.requester_id, req_record.requested_id);
  user2_id := GREATEST(req_record.requester_id, req_record.requested_id);
  
  INSERT INTO public.friendships (user1_id, user2_id)
  VALUES (user1_id, user2_id);
  
  RETURN TRUE;
END;
$$;

-- Function to reject friend request
CREATE OR REPLACE FUNCTION public.reject_friend_request(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.friend_requests
  SET status = 'rejected', updated_at = now()
  WHERE id = request_id AND requested_id = auth.uid() AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Function to remove friend
CREATE OR REPLACE FUNCTION public.remove_friend(friend_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Remove friendship
  DELETE FROM public.friendships
  WHERE (user1_id = LEAST(current_user_id, friend_user_id) 
         AND user2_id = GREATEST(current_user_id, friend_user_id));
  
  -- Remove any pending requests between users
  DELETE FROM public.friend_requests
  WHERE (requester_id = current_user_id AND requested_id = friend_user_id)
     OR (requester_id = friend_user_id AND requested_id = current_user_id);
  
  RETURN TRUE;
END;
$$;