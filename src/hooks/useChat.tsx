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
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:users!conversations_user1_id_fkey(id, name, profile_picture_url),
          user2:users!conversations_user2_id_fkey(id, name, profile_picture_url)
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      const conversationsWithUnread = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUser = conv.user1.id === user.id ? conv.user2 : conv.user1;
          
          // Get unread message count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', otherUser.id)
            .eq('receiver_id', user.id)
            .eq('read', false);

          return {
            id: conv.id,
            user1_id: conv.user1_id,
            user2_id: conv.user2_id,
            last_message_at: conv.last_message_at,
            other_user: otherUser,
            unread_count: count || 0
          };
        })
      );

      setConversations(conversationsWithUnread);
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
      const { data, error } = await supabase.rpc('send_message', {
        receiver_id: receiverId,
        content: content.trim()
      });

      if (error) throw error;
      
      // Refresh messages after sending
      setTimeout(() => {
        fetchMessages(receiverId);
        fetchConversations();
      }, 100);
      
      return true;
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
          // Refresh conversations and messages when there are changes
          fetchConversations();
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
          fetchConversations();
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