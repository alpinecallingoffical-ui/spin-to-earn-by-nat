
import React, { createContext, useContext } from "react";
import { useUnreadAdminMessages } from "./useUnreadAdminMessages";

const UnreadAdminMessagesContext = createContext<ReturnType<typeof useUnreadAdminMessages> | null>(null);

export const UnreadAdminMessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const unread = useUnreadAdminMessages();
  return (
    <UnreadAdminMessagesContext.Provider value={unread}>
      {children}
    </UnreadAdminMessagesContext.Provider>
  );
};

export const useUnreadAdminMessagesContext = () => {
  const context = useContext(UnreadAdminMessagesContext);
  if (!context) throw new Error("useUnreadAdminMessagesContext must be used inside UnreadAdminMessagesProvider");
  return context;
};
