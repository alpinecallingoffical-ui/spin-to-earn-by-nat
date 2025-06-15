
// Since the "notifications" table does not exist or is not allowed, this hook is now stubbed.
// You may want to delete this file if it is not in use.
export const useNotifications = () => {
  return {
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    refetch: async () => {},
  };
};
