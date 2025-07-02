
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAdminMessages } from '@/hooks/useAdminMessages';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadAdminMessagesContext } from "@/hooks/UnreadAdminMessagesContext";
import { supabase } from '@/integrations/supabase/client';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// Level mapping by coin (could adjust to exact cutoffs as needed)
const levels = [
  { min: 0, name: "Ace" },
  { min: 300, name: "Conqueror" },
  { min: 600, name: "Warrior" },
  { min: 1000, name: "Elite" },
  { min: 1300, name: "Master" },
  { min: 1700, name: "Grandmaster" },
  { min: 2000, name: "Epic" },
  { min: 2500, name: "Legend" },
  { min: 2800, name: "Mythic" },
  { min: 3000, name: "Mythical Glory" },
];

function getUserLevelName(coins: number | undefined | null): string {
  if (typeof coins !== "number") return levels[0].name;
  let result = levels[0].name;
  for (const l of levels) if (coins >= l.min) result = l.name;
  return result;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { messages, loading } = useAdminMessages();
  const { user } = useAuth();
  const { unreadCount, refreshUnreadCount } = useUnreadAdminMessagesContext();
  const [selected, setSelected] = useState<null | (typeof messages)[number]>(null);

  const markAsRead = async (msg: { id: string; read?: boolean }) => {
    if (!user || !msg || msg.read) return;
    await supabase
      .from('admin_messages')
      .update({ read: true })
      .eq('id', msg.id)
      .eq('user_id', user.id);
    await refreshUnreadCount();
  };

  const openMessage = (msg: typeof selected) => {
    setSelected(msg);
    if (msg && !msg.read) {
      markAsRead(msg);
    }
  };

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

  // Helper: extract coin amount from a message (for admin award messages)
  const extractCoins = (msg: string): number | null => {
    // look for "x coins" or "x Crown(s)" or similar
    const regexes = [
      /(\d+)\s*coins?/i,
      /(\d+)\s*Crown/i,
    ];
    for (const regex of regexes) {
      const match = msg.match(regex);
      if (match) return Number(match[1]);
    }
    return null;
  };

  // Responsive: cap width and ensure scroll for overflow. Always wrap long text.
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-none max-w-2xl max-h-[80vh] p-0 flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center justify-between">
              <span>📨 Admin Messages</span>
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full text-xs font-bold px-2 py-0.5">
                  {unreadCount}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div
            className="flex-1 overflow-y-auto space-y-3 px-4 pb-6 pt-2"
            style={{ maxHeight: '60vh', minHeight: '120px' }}
          >
            {loading ? (
              <div className="text-center py-8 text-white/60">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-lg">📢</p>
                <p className="text-white/60">No admin messages yet!</p>
                <p className="text-white/40 text-sm">You'll see important announcements here.</p>
              </div>
            ) : (
              messages.map((msg) => {
                // For each message, if coin/Crown is present, extract coin and get level
                const coins = extractCoins(msg.message);
                const levelName = coins !== null ? getUserLevelName(coins) : null;
                return (
                  <button
                    key={msg.id}
                    type="button"
                    onClick={() => openMessage(msg)}
                    className={`w-full text-left rounded-xl p-4 border ${getTypeBg(msg.message_type)} ring-2 ring-white/10 transition hover:ring-white/30 hover:bg-white/10 focus:outline-none relative`}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">
                        {getTypeIcon(msg.message_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap mb-2">
                          <h4 className="text-white font-semibold break-words max-w-full">{msg.title}</h4>
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            ADMIN
                          </span>
                          {!msg.read && (
                            <span className="ml-2 bg-red-500 text-white rounded-full w-2 h-2 inline-block shrink-0" aria-label="Unread" />
                          )}
                        </div>
                        <div className="text-white/80 text-sm mb-2 mt-1 break-words whitespace-pre-wrap max-w-full overflow-hidden">
                          <p className="line-clamp-3 leading-relaxed">{msg.message}</p>
                        </div>
                        {/* Show level name if coins found */}
                        {levelName && (
                          <div className="flex items-center text-xs mt-1">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full mr-2">{levelName}</span>
                            {coins !== null && (
                              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full"> {coins} Coins </span>
                            )}
                          </div>
                        )}
                        <p className="text-white/60 text-xs mt-1">
                          {formatDate(msg.sent_at || msg.created_at || '')}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
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
                <span className="break-words">{selected.title}</span>
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2">ADMIN</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-w-full">
              <div className="text-white/90 text-base whitespace-pre-wrap break-words overflow-wrap-anywhere leading-relaxed">
                {selected.message}
              </div>
              {/* Show level name in detail if coins present */}
              {(() => {
                const coins = extractCoins(selected.message);
                const levelName = coins !== null ? getUserLevelName(coins) : null;
                return levelName ? (
                  <div className="flex items-center text-xs mt-3">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full mr-2">{levelName}</span>
                    {coins !== null && (
                      <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full">{coins} Coins</span>
                    )}
                  </div>
                ) : null;
              })()}
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

