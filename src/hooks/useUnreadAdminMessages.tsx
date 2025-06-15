
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Assume admin_messages table has a "read" boolean column (defaults to false)
export const useUnreadAdminMessages = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    let isMounted = true;

    const fetchUnread = async () => {
      const { count, error } = await supabase
        .from("admin_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (!error && isMounted) {
        setUnreadCount(count || 0);
      }
    };
    fetchUnread();

    // Listen to real-time admin_messages updates for this user
    const channel = supabase
      .channel("admin-messages-unread")
      .on(
        'postgres_changes',
        {
          event: "*",
          schema: "public",
          table: "admin_messages",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { unreadCount };
};
