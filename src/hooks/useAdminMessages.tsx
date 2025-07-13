
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  message_type: 'info' | 'success' | 'warning' | 'error';
  sent_at: string | null;
  created_at: string | null;
  user_id: string;
  admin_id: string;
  user_name: string | null;
  user_email: string | null;
  read?: boolean;
}

export const useAdminMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const markAsRead = async (messageId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('admin_messages')
        .update({ read: true })
        .eq('id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetch = async () => {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching admin messages:', error);
        setMessages([]);
      } else {
        setMessages(data as AdminMessage[]);
      }
      setLoading(false);
    };

    fetch();

    // Real-time subscription for new messages
    const channel = supabase
      .channel('admin-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { messages, loading, markAsRead };
};

// Function to send update messages to all users
export const sendUpdateMessage = async (title: string, message: string) => {
  try {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email');

    if (usersError) throw usersError;

    const messagesToInsert = users.map(user => ({
      user_id: user.id,
      user_name: user.name,
      user_email: user.email,
      title,
      message,
      message_type: 'info' as const,
      sent_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('admin_messages')
      .insert(messagesToInsert);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error sending update message:', error);
    return false;
  }
};
