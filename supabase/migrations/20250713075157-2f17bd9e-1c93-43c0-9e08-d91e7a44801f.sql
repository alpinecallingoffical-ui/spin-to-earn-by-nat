-- Fix the send_message and get_or_create_conversation functions to resolve ambiguous column references

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(other_user_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
  conversation_id UUID;
  conv_user1_id UUID;
  conv_user2_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Ensure user1_id < user2_id for consistency
  conv_user1_id := LEAST(current_user_id, other_user_id);
  conv_user2_id := GREATEST(current_user_id, other_user_id);
  
  -- Try to find existing conversation
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.user1_id = conv_user1_id AND c.user2_id = conv_user2_id;
  
  -- If not found, create new conversation
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (user1_id, user2_id)
    VALUES (conv_user1_id, conv_user2_id)
    RETURNING id INTO conversation_id;
  END IF;
  
  RETURN conversation_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_message(receiver_id uuid, content text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$;