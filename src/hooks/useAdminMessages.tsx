
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

  // We'll use the notifications "reading" system for the read/unread state (optional)
  // Or you can extend admin_messages to add a read flag in the future

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

    // Optionally listen to inserts/changes (real-time)
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

  return { messages, loading };
};
