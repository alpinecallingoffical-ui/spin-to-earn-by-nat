
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UsersList } from './UsersList';

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

  const handleSendToAll = async (e: React.FormEvent) => {
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
      const { data: { user: adminUser }, error: adminUserError } = await supabase.auth.getUser();
      if (adminUserError || !adminUser) {
        throw new Error('Could not identify admin user. Please log in.');
      }

      // Fetch user ids, names, and emails
      const { data: users, error: usersError } = await supabase.from('users').select('id, name, email');
      if (usersError) throw usersError;
      if (!users || users.length === 0) {
        toast({ title: 'No users to send message to.', variant: 'default' });
        setLoading(false);
        return;
      }

      // Insert into admin_messages
      const adminMessagesToInsert = users.map(u => ({
        admin_id: adminUser.id,
        user_id: u.id,
        user_name: u.name || null,
        user_email: u.email || null,
        title: title.trim(),
        message: message.trim(),
        message_type: messageType,
      }));
      const { error: adminMessageError } = await supabase.from('admin_messages').insert(adminMessagesToInsert);
      if (adminMessageError) throw adminMessageError;

      // Insert into notifications, supply id for each (required in types)
      const notificationsToInsert = users.map(u => ({
        id: crypto.randomUUID(),
        user_id: u.id,
        admin_id: adminUser.id,
        title: title.trim(),
        message: message.trim(),
        type: messageType,
        is_admin_message: true,
      }));
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (notificationError) throw notificationError;

      toast({
        title: '✅ Message Sent!',
        description: `Your message "${title}" has been sent to all ${users.length} users`,
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

  const handleSendToSelected = async (userIds: string[]) => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and message',
        variant: 'destructive',
      });
      return;
    }

    if (userIds.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user: adminUser }, error: adminUserError } = await supabase.auth.getUser();
      if (adminUserError || !adminUser) {
        throw new Error('Could not identify admin user. Please log in.');
      }

      // Fetch name/email for selected users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', userIds);
      if (usersError) throw usersError;

      // Insert into admin_messages
      const adminMessagesToInsert = users.map(u => ({
        admin_id: adminUser.id,
        user_id: u.id,
        user_name: u.name || null,
        user_email: u.email || null,
        title: title.trim(),
        message: message.trim(),
        message_type: messageType,
      }));
      const { error: adminMessageError } = await supabase.from('admin_messages').insert(adminMessagesToInsert);
      if (adminMessageError) throw adminMessageError;

      // Insert into notifications, supply id for each (required in types)
      const notificationsToInsert = users.map(u => ({
        id: crypto.randomUUID(),
        user_id: u.id,
        admin_id: adminUser.id,
        title: title.trim(),
        message: message.trim(),
        type: messageType,
        is_admin_message: true,
      }));
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationsToInsert);

      if (notificationError) throw notificationError;

      toast({
        title: '✅ Message Sent!',
        description: `Your message "${title}" has been sent to ${userIds.length} selected users`,
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
      <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">📢 Admin Message Center</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all-users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/20">
            <TabsTrigger value="all-users" className="text-white data-[state=active]:bg-white/30">
              All Users
            </TabsTrigger>
            <TabsTrigger value="selected-users" className="text-white data-[state=active]:bg-white/30">
              Select Users
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {/* Common form fields */}
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

            {/* Preview */}
            <div className="bg-white/20 p-3 rounded-lg">
              <p className="text-sm mb-2">📋 <strong>Preview:</strong></p>
              <div className="bg-white/10 p-2 rounded">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={getTypeColor(messageType)}>{getTypeIcon(messageType)}</span>
                  <span className="font-semibold">{title || 'Your Title Here'}</span>
                </div>
                <p className="text-sm text-white/80">{message || 'Your message content will appear here...'}</p>
                {/* User Details Preview */}
                <p className="text-xs text-white/60 mt-2">
                  Example Recipient: <span className="font-semibold">[User Name]</span> (<span className="font-mono">user@gmail.com</span>)
                  <span className="ml-2 text-white/40">(Each user will see their own details)</span>
                </p>
              </div>
            </div>
          </div>

          <TabsContent value="all-users" className="space-y-4">
            <Button
              onClick={handleSendToAll}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
            >
              {loading ? '📤 Sending...' : '📢 Send to All Users'}
            </Button>
          </TabsContent>

          <TabsContent value="selected-users" className="space-y-4">
            <UsersList onSendMessage={handleSendToSelected} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
