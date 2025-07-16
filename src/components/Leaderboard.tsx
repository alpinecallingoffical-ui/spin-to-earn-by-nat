import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Crown, MessageCircle } from "lucide-react";
import { ChatWindow } from "./ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { AvatarDisplay } from "./AvatarDisplay";

interface BoardUser {
  user_id: string;
  name: string;
  profile_picture_url?: string;
  coins: number;
  rank: number;
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<BoardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [snapshotMessage, setSnapshotMessage] = useState<string>("");
  const [selectedChatUser, setSelectedChatUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);

  // Fetch leaderboard snapshot for selected date
  const fetchLeaderboard = async (targetDate?: string) => {
    setLoading(true);
    const useDate = targetDate || new Date().toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("daily_leaderboard")
      .select("user_id, name, profile_picture_url, coins, rank")
      .eq("leaderboard_date", useDate)
      .order("rank", { ascending: true });

    if (!error) {
      setUsers(data ?? []);
    }
    setLoading(false);
  };

  // For testing: Allow admin to snapshot manually on UI
  const triggerSnapshot = async () => {
    setSnapshotMessage("Taking snapshot...");
    try {
      const resp = await fetch("https://chwqwteyqzwtrcodvbdy.supabase.co/functions/v1/snapshot-leaderboard", {
        method: "POST"
      });
      const j = await resp.json();
      setSnapshotMessage(j.message ? j.message : "Snapshot done!");
      // Refresh after snapshot
      fetchLeaderboard(date);
    } catch (e) {
      setSnapshotMessage("Failed to take snapshot");
    }
  };

  const handleChatWithUser = (userId: string, userName: string, avatar?: string) => {
    if (userId === user?.id) return; // Can't chat with yourself
    setSelectedChatUser({ id: userId, name: userName, avatar });
  };

  useEffect(() => {
    fetchLeaderboard(date);
  }, [date]);

  return (
    <>
      {selectedChatUser && (
        <ChatWindow
          otherUserId={selectedChatUser.id}
          otherUserName={selectedChatUser.name}
          otherUserAvatar={selectedChatUser.avatar}
          onClose={() => setSelectedChatUser(null)}
        />
      )}
      <div className="bg-gradient-to-br from-purple-700/50 to-pink-600/40 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
          🏆 Daily Leaderboard
          {/* Crown at the top! */}
          <Crown className="inline-block text-yellow-400 w-7 h-7 drop-shadow ml-2" />
        </h2>
        <div className="flex justify-between items-center mb-4">
          <span className="text-white/70 text-sm">
            Date: <input type="date" value={date} onChange={e => { setDate(e.target.value); fetchLeaderboard(e.target.value); }} className="rounded px-2 py-1 text-black" />
          </span>
          <button onClick={triggerSnapshot} className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 text-xs">Snapshot Now</button>
        </div>
        {snapshotMessage && (
          <div className="text-xs text-white/70 mb-2">{snapshotMessage}</div>
        )}
        {loading ? (
          <div className="text-center text-white/60">Loading leaderboard snapshot...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-white/60">No leaderboard for this date yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Player</TableHead>
                <TableHead>Coins</TableHead>
                <TableHead>Chat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow key={u.user_id} className={u.rank === 1 ? "bg-yellow-400/10" : ""}>
                  <TableCell>
                    {u.rank}
                    {u.rank === 1 && (
                      <Crown className="inline-block text-yellow-400 w-5 h-5 ml-2 align-middle" />
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <AvatarDisplay 
                        profilePictureUrl={u.profile_picture_url}
                        size="sm"
                      />
                      <span className="font-bold">{u.name}</span>
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">{u.coins.toLocaleString()} 🪙</TableCell>
                  <TableCell>
                    {u.user_id !== user?.id && (
                      <button
                        onClick={() => handleChatWithUser(u.user_id, u.name, u.profile_picture_url || undefined)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                        title={`Chat with ${u.name}`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};
