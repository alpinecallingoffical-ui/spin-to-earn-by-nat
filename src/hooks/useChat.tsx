import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: {
    name: string;
    profile_picture_url: string | null;
  };
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  other_user: {
    id: string;
    name: string;
    profile_picture_url: string | null;
  };
  unread_count: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First get conversations involving the current user
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Raw conversations data:', conversationsData);

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // Manually fetch user data for each conversation
      const conversationsWithUsers = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
          
          // Fetch other user data
          const { data: otherUserData, error: userError } = await supabase
            .from('users')
            .select('id, name, profile_picture_url')
            .eq('id', otherUserId)
            .maybeSingle();

          if (userError || !otherUserData) {
            console.error('Error fetching user data:', userError);
            return null;
          }

          // Get unread message count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUserId)
            .eq('receiver_id', user.id)
            .eq('read', false);

          // Fetch last message for preview
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('content, sender_id')
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            id: conv.id,
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            last_message_at: conv.last_message_at,
            other_user: otherUserData,
            unread_count: count || 0,
            last_message: lastMessageData || undefined
          };
        })
      );

      // Filter out null values and set conversations
      setConversations(conversationsWithUsers.filter(conv => conv !== null));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, profile_picture_url)
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return false;

    try {
      console.log('Sending message to:', receiverId, 'Content:', content);
      
      const { data, error } = await supabase.rpc('send_message', {
        receiver_id: receiverId,
        content: content.trim()
      });

      console.log('Send message response:', { data, error });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }
      
      if (data) {
        console.log('Message sent successfully, message ID:', data);
        
        // Wait a bit before refreshing to ensure the message is properly inserted
        setTimeout(async () => {
          await Promise.all([
            fetchMessages(receiverId),
            fetchConversations()
          ]);
        }, 500);
        
        return true;
      } else {
        console.error('No data returned from send_message function');
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const markMessagesAsRead = async (senderId: string) => {
    if (!user) return;

    try {
      await supabase.rpc('mark_messages_read', {
        sender_id: senderId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message event:', payload);
          // Refresh conversations when there are changes
          setTimeout(() => {
            fetchConversations();
          }, 500);
        }
      )
      .subscribe();

    const conversationsSubscription = supabase
      .channel('conversations_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          setTimeout(() => {
            fetchConversations();
          }, 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  return {
    conversations,
    messages,
    loading,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    getTotalUnreadCount,
    refetchConversations: fetchConversations
  };
};