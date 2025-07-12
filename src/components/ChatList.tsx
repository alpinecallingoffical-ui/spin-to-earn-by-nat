import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { MessageCircle, X } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { format } from 'date-fns';

interface ChatListProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({ isOpen, onClose }) => {
  const { conversations, loading } = useChat();
  const [selectedChat, setSelectedChat] = useState<{
    userId: string;
    userName: string;
    userAvatar?: string;
  } | null>(null);

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            <h3 className="font-semibold">Messages</h3>
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

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting by visiting the leaderboard!</p>
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() =>
                    setSelectedChat({
                      userId: conversation.other_user.id,
                      userName: conversation.other_user.name,
                      userAvatar: conversation.other_user.profile_picture_url || undefined
                    })
                  }
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative">
                    {conversation.other_user.profile_picture_url ? (
                      <img
                        src={conversation.other_user.profile_picture_url}
                        alt={conversation.other_user.name}
                        className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        👤
                      </div>
                    )}
                    {conversation.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 truncate">
                        {conversation.other_user.name}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {format(new Date(conversation.last_message_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Tap to start chatting</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};