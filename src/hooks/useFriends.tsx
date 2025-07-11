import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Friend {
  id: string;
  name: string;
  email: string | null;
  profile_picture_url: string | null;
  coins: number;
  created_at: string;
}

interface FriendRequest {
  id: string;
  requester_id: string;
  requested_id: string;
  status: string;
  created_at: string;
  requester: {
    name: string;
    email: string | null;
    profile_picture_url: string | null;
  };
}

export const useFriends = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      // Get friendships and join with user data
      const { data: friendshipsData, error: friendshipsError } = await supabase
        .from('friendships')
        .select(`
          *,
          user1:users!friendships_user1_id_fkey(id, name, email, profile_picture_url, coins, created_at),
          user2:users!friendships_user2_id_fkey(id, name, email, profile_picture_url, coins, created_at)
        `);

      if (friendshipsError) throw friendshipsError;

      // Extract friend data (the other user in each friendship)
      const friendsData = friendshipsData?.map(friendship => {
        return friendship.user1.id === user.id ? friendship.user2 : friendship.user1;
      }) || [];

      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friends',
        variant: 'destructive',
      });
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      // Get pending requests where current user is the recipient
      const { data: requestsData, error: requestsError } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:users!friend_requests_requester_id_fkey(name, email, profile_picture_url)
        `)
        .eq('requested_id', user.id)
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      setFriendRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('send_friend_request', {
        target_user_id: targetUserId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: '🤝 Friend Request Sent!',
          description: 'Your friend request has been sent.',
        });
        return true;
      } else {
        toast({
          title: 'Unable to Send Request',
          description: 'You might already be friends or have a pending request.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive',
      });
      return false;
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_friend_request', {
        request_id: requestId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: '🎉 Friend Request Accepted!',
          description: 'You are now friends!',
        });
        await fetchFriends();
        await fetchFriendRequests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive',
      });
      return false;
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { data, error } = await supabase.rpc('reject_friend_request', {
        request_id: requestId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Friend Request Rejected',
          description: 'The friend request has been declined.',
        });
        await fetchFriendRequests();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const { data, error } = await supabase.rpc('remove_friend', {
        friend_user_id: friendId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: 'Friend Removed',
          description: 'Friend has been removed from your friends list.',
        });
        await fetchFriends();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        variant: 'destructive',
      });
      return false;
    }
  };

  const searchUsers = async (query: string) => {
    if (!user || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, profile_picture_url, coins')
        .ilike('name', `%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchFriends(), fetchFriendRequests()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  return {
    friends,
    friendRequests,
    loading,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    searchUsers,
    refetch: () => Promise.all([fetchFriends(), fetchFriendRequests()])
  };
};