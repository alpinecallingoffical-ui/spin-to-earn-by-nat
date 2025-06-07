
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  coins: number;
  created_at: string;
}

interface UsersListProps {
  onSendMessage: (userIds: string[]) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ onSendMessage }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, coins, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return <div className="text-center text-white/60">Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Select Users ({selectedUsers.length} selected)
        </h3>
        <div className="space-x-2">
          <Button
            onClick={selectAllUsers}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Select All
          </Button>
          <Button
            onClick={clearSelection}
            variant="outline"
            size="sm"
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedUsers.includes(user.id)
                ? 'bg-blue-500/30 border-blue-400/50'
                : 'bg-white/10 border-white/20 hover:bg-white/20'
            }`}
            onClick={() => toggleUserSelection(user.id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-white/70 text-sm">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">{user.coins} coins</p>
                <p className="text-white/60 text-xs">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedUsers.length > 0 && (
        <Button
          onClick={() => onSendMessage(selectedUsers)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
        >
          Send Message to Selected Users ({selectedUsers.length})
        </Button>
      )}
    </div>
  );
};
