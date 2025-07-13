import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { X, Send, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  otherUserId,
  otherUserName,
  otherUserAvatar,
  onClose
}) => {
  const { user } = useAuth();
  const { messages, sendMessage, fetchMessages, markMessagesAsRead, refetchConversations } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages(otherUserId);
    markMessagesAsRead(otherUserId);
  }, [otherUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(otherUserId, newMessage);
    if (success) {
      setNewMessage('');
      // Refresh both messages and conversations
      await Promise.all([
        fetchMessages(otherUserId),
        refetchConversations()
      ]);
    }
    setSending(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            {otherUserAvatar ? (
              <img
                src={otherUserAvatar}
                alt={otherUserName}
                className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                👤
              </div>
            )}
            <div>
              <h3 className="font-semibold">{otherUserName}</h3>
              <p className="text-xs opacity-80">Online</p>
            </div>
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

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[80%]">
                    {!isOwn && (
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        {otherUserAvatar ? (
                          <img
                            src={otherUserAvatar}
                            alt={otherUserName}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">👤</span>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-lg max-w-xs ${
                        isOwn
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};