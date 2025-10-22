import React, { useState, useMemo, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChat } from '@/hooks/useChat';
import { MessageCircle, X, Search, UserPlus } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatListProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchUser {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

export const ChatList: React.FC<ChatListProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { conversations, loading } = useChat();
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Search all users when query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !user) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, profile_picture_url')
          .ilike('name', `%${searchQuery}%`)
          .neq('id', user.id) // Exclude current user
          .limit(10);

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user]);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.other_user.name.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Show search results or filtered conversations
  const showSearchResults = searchQuery.trim().length > 0;
  const displayResults = showSearchResults ? searchResults : [];

  if (!isOpen) return null;

  if (selectedChat) {
    return (
      <ChatWindow
        otherUserId={selectedChat.userId}
        otherUserName={selectedChat.userName}
        otherUserAvatar={selectedChat.userAvatar}
        onClose={() => setSelectedChat(null)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            <h3 className="font-semibold text-lg">Messages</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b bg-gray-50 dark:bg-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Results List */}
        <ScrollArea className="flex-1">
          {showSearchResults ? (
            // Search Results View
            searchLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                Searching users...
              </div>
            ) : displayResults.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No users found</p>
                <p className="text-sm">Try searching with a different name</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Search Results ({displayResults.length})
                </div>
                {displayResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    onClick={() => {
                      setSelectedChat({
                        userId: searchUser.id,
                        userName: searchUser.name,
                        userAvatar: searchUser.profile_picture_url || undefined
                      });
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200"
                  >
                    <div className="relative flex-shrink-0">
                      {searchUser.profile_picture_url ? (
                        <img
                          src={searchUser.profile_picture_url}
                          alt={searchUser.name}
                          className="w-14 h-14 rounded-full border-2 border-green-200 dark:border-green-700 object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                          {searchUser.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {searchUser.name}
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        Click to start chat
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Existing Conversations View
            loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No conversations yet</p>
                <p className="text-sm">Search for users to start chatting!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {conversations.map((conversation) => {
                  const lastMessage = conversation.last_message;
                  const isCurrentUserSender = lastMessage?.sender_id === user?.id;
                  const messagePreview = lastMessage 
                    ? (isCurrentUserSender ? 'You: ' : '') + lastMessage.content
                    : 'No messages yet';
                  
                  return (
                    <div
                      key={conversation.id}
                      onClick={() =>
                        setSelectedChat({
                          userId: conversation.other_user.id,
                          userName: conversation.other_user.name,
                          userAvatar: conversation.other_user.profile_picture_url || undefined
                        })
                      }
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200"
                    >
                      <div className="relative flex-shrink-0">
                        {conversation.other_user.profile_picture_url ? (
                          <img
                            src={conversation.other_user.profile_picture_url}
                            alt={conversation.other_user.name}
                            className="w-14 h-14 rounded-full border-2 border-purple-200 dark:border-purple-700 object-cover"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                            {conversation.other_user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                            {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold truncate ${
                            conversation.unread_count > 0 
                              ? 'text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {conversation.other_user.name}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          conversation.unread_count > 0 
                            ? 'text-gray-900 dark:text-gray-200 font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {messagePreview}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </ScrollArea>
      </div>
    </div>
  );
};