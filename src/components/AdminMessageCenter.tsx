
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminMessageCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMessageCenter: React.FC<AdminMessageCenterProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and message',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('send_message_to_all_users', {
        message_title: title.trim(),
        message_content: message.trim(),
        message_type: messageType
      });

      if (error) throw error;

      toast({
        title: '✅ Message Sent!',
        description: `Your message "${title}" has been sent to all users`,
      });

      // Reset form
      setTitle('');
      setMessage('');
      setMessageType('info');
      onClose();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">📢 Send Message to All Users</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Message Title</label>
            <Input
              type="text"
              placeholder="Enter message title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message Type</label>
            <Select value={messageType} onValueChange={(value: 'info' | 'success' | 'warning' | 'error') => setMessageType(value)}>
              <SelectTrigger className="bg-white/20 border-white/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center space-x-2">
                    <span>📢</span>
                    <span>Info</span>
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center space-x-2">
                    <span>✅</span>
                    <span>Success</span>
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center space-x-2">
                    <span>⚠️</span>
                    <span>Warning</span>
                  </div>
                </SelectItem>
                <SelectItem value="error">
                  <div className="flex items-center space-x-2">
                    <span>❌</span>
                    <span>Error</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message Content</label>
            <Textarea
              placeholder="Enter your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="bg-white/20 border-white/30 text-white placeholder-white/70"
            />
          </div>

          <div className="bg-white/20 p-3 rounded-lg">
            <p className="text-sm mb-2">📋 <strong>Preview:</strong></p>
            <div className="bg-white/10 p-2 rounded">
              <div className="flex items-center space-x-2 mb-1">
                <span className={getTypeColor(messageType)}>{getTypeIcon(messageType)}</span>
                <span className="font-semibold">{title || 'Your Title Here'}</span>
              </div>
              <p className="text-sm text-white/80">{message || 'Your message content will appear here...'}</p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
          >
            {loading ? '📤 Sending...' : '📢 Send to All Users'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
