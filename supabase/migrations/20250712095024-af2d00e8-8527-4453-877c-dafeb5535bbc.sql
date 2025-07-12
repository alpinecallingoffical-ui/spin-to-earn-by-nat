-- Create messages table for user-to-user chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent self-messaging
  CHECK (sender_id != receiver_id)
);

-- Create conversations table for chat metadata
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure user1_id < user2_id to avoid duplicate conversations
  CHECK (user1_id < user2_id),
  -- Prevent self-conversations
  CHECK (user1_id != user2_id),
  -- Unique conversation
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Users can view messages they sent or received"
ON public.messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark their received messages as read"
ON public.messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view their conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Function to get or create conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  conversation_id UUID;
  user1_id UUID;
  user2_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Ensure user1_id < user2_id
  user1_id := LEAST(current_user_id, other_user_id);
  user2_id := GREATEST(current_user_id, other_user_id);
  
  -- Try to find existing conversation
  SELECT id INTO conversation_id
  FROM public.conversations
  WHERE user1_id = user1_id AND user2_id = user2_id;
  
  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (user1_id, user2_id)
    VALUES (user1_id, user2_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Function to send message
CREATE OR REPLACE FUNCTION public.send_message(receiver_id UUID, content TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  conversation_id UUID;
  message_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Get or create conversation
  conversation_id := public.get_or_create_conversation(receiver_id);
  
  -- Insert message
  INSERT INTO public.messages (sender_id, receiver_id, content)
  VALUES (current_user_id, receiver_id, content)
  RETURNING id INTO message_id;
  
  -- Update conversation last_message_at
  UPDATE public.conversations
  SET last_message_at = now()
  WHERE id = conversation_id;
  
  RETURN message_id;
END;
$$;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(sender_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.messages
  SET read = TRUE, updated_at = now()
  WHERE receiver_id = auth.uid() AND sender_id = sender_id AND read = FALSE;
  
  RETURN TRUE;
END;
$$;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;