
// There is no "read" column in admin_messages; always return 0 for now.
export const useUnreadAdminMessages = () => {
  return { unreadCount: 0 };
};
