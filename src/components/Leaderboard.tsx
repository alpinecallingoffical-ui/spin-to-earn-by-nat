
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  id: string;
  name: string;
  profile_picture_url?: string;
  coins: number;
}

export const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch users ordered by coins DESC
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id, name, profile_picture_url, coins")
      .order("coins", { ascending: false })
      .limit(20);

    if (!error) setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    // Subscribe to real-time updates (coins change)
    const userChannel = supabase
      .channel("leaderboard-users")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
        },
        (payload) => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, []);

  return (
    <div className="bg-gradient-to-br from-purple-700/50 to-pink-600/40 p-6 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">🏆 Leaderboard</h2>
      {loading ? (
        <div className="text-center text-white/60">Loading leaderboard...</div>
      ) : (
        <table className="w-full text-white">
          <thead>
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Player</th>
              <th className="text-left p-2">Coins</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} className={`border-t border-white/10 ${idx === 0 ? 'bg-yellow-400/10' : ''}`}>
                <td className="p-2">{idx + 1}</td>
                <td className="p-2 flex items-center space-x-3">
                  {u.profile_picture_url ? (
                    <img
                      src={u.profile_picture_url}
                      alt={u.name}
                      className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xl">🎰</span>
                  )}
                  <span className="font-bold">{u.name}</span>
                </td>
                <td className="p-2 font-mono font-semibold">{u.coins.toLocaleString()} 🪙</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
