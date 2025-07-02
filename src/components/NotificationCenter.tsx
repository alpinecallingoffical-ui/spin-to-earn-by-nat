
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminMessages } from '@/hooks/useAdminMessages';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadAdminMessages } from '@/hooks/useUnreadAdminMessages';
import { supabase } from '@/integrations/supabase/client';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { messages, loading } = useAdminMessages();
  const { user } = useAuth();
  const { unreadCount, refreshUnreadCount } = useUnreadAdminMessages();
  const [selected, setSelected] = useState<null | (typeof messages)[number]>(null);

  // Call this to mark a message as read and refresh unread count
  const markAsRead = async (msg: { id: string; read?: boolean }) => {
    if (!user || !msg || msg.read) return;
    await supabase
      .from('admin_messages')
      .update({ read: true })
      .eq('id', msg.id)
      .eq('user_id', user.id);
    refreshUnreadCount();
  };

  // When opening a message, mark it as read
  const openMessage = (msg: typeof selected) => {
    setSelected(msg);
    if (msg && !msg.read) {
      markAsRead(msg);
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-400/30';
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/30';
      case 'error': return 'bg-red-500/20 border-red-400/30';
      default: return 'bg-blue-500/20 border-blue-400/30';
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span>📨 Admin Messages</span>
              {/* Notification Dot */}
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8 text-white/60">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-lg">📢</p>
                <p className="text-white/60">No admin messages yet!</p>
                <p className="text-white/40 text-sm">You'll see important announcements here.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => openMessage(msg)}
                  className={`w-full text-left rounded-xl p-4 border ${getTypeBg(msg.message_type)} ring-2 ring-white/10 transition hover:ring-white/30 hover:bg-white/10 focus:outline-none relative`}
                  style={{ cursor: 'pointer' }}
                  tabIndex={0}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getTypeIcon(msg.message_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-white font-semibold">{msg.title}</h4>
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ADMIN
                        </span>
                        {!msg.read && (
                          <span className="ml-2 bg-red-500 text-white rounded-full w-2 h-2 inline-block shrink-0" aria-label="Unread" />
                        )}
                      </div>
                      <p className="text-white/80 text-sm mb-2 mt-1 line-clamp-2">
                        {msg.message}
                      </p>
                      <p className="text-white/60 text-xs">
                        {formatDate(msg.sent_at || msg.created_at || '')}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Detail Dialog for selected message */}
      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-xl">
                <span>{getTypeIcon(selected.message_type)}</span>
                <span>{selected.title}</span>
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2">ADMIN</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <p className="text-white/90 text-base whitespace-pre-line">{selected.message}</p>
              <p className="mt-3 text-white/60 text-sm">
                {formatDate(selected.sent_at || selected.created_at || '')}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
