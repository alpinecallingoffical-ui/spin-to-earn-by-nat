
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📢';
    }
  };

  const getNotificationBg = (type: string, isAdminMessage: boolean) => {
    if (isAdminMessage) {
      return 'bg-orange-500/20 border-orange-400/30 ring-2 ring-orange-400/20';
    }
    
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-400/30';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-400/30';
      case 'error':
        return 'bg-red-500/20 border-red-400/30';
      default:
        return 'bg-blue-500/20 border-blue-400/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            🔔 Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Button
                onClick={markAllAsRead}
                className="bg-white/20 hover:bg-white/30 text-white text-sm px-3 py-1"
              >
                Mark All Read
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60 text-lg">🔔</p>
              <p className="text-white/60">No notifications yet!</p>
              <p className="text-white/40 text-sm">We'll notify you about important updates</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl p-4 border ${getNotificationBg(notification.type, notification.is_admin_message || false)} ${
                  !notification.read ? 'ring-2 ring-white/30' : ''
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {notification.is_admin_message ? '📢' : getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-semibold">
                        {notification.title}
                      </h4>
                      {notification.is_admin_message && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          ADMIN
                        </span>
                      )}
                      {!notification.read && (
                        <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm mb-2 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-white/60 text-xs">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
