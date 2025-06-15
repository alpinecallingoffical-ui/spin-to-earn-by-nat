
// Fetches unread admin messages for the current user.
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Returns unreadCount and a refreshUnreadCount function
export const useUnreadAdminMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const { count, error } = await supabase
      .from('admin_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (!error && typeof count === 'number') setUnreadCount(count);
    else setUnreadCount(0);
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    // Listen for real-time inserts or updates to refresh unread count
    if (!user) return;
    const channel = supabase
      .channel('admin-messages-unread-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_messages',
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          fetchUnreadCount();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchUnreadCount]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
};
