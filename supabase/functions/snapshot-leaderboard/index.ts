
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Check to avoid duplicate snapshots for today
  const { data: alreadySnapshotted } = await supabase
    .from("daily_leaderboard")
    .select("id")
    .eq("leaderboard_date", today)
    .limit(1);

  if (alreadySnapshotted && alreadySnapshotted.length > 0) {
    return new Response(
      JSON.stringify({ message: "Today's leaderboard snapshot already created." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get top 20 users by coins
  const { data: topUsers, error } = await supabase
    .from("users")
    .select("id, name, profile_picture_url, coins")
    .order("coins", { ascending: false })
    .limit(20);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Build leaderboard snapshot records
  const snapshotRows = (topUsers || []).map((user, idx) => ({
    leaderboard_date: today,
    user_id: user.id,
    name: user.name,
    profile_picture_url: user.profile_picture_url,
    coins: user.coins,
    rank: idx + 1
  }));

  // Bulk insert
  if (snapshotRows.length > 0) {
    const { error: insertError } = await supabase
      .from("daily_leaderboard")
      .insert(snapshotRows);

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: true, count: snapshotRows.length }), 
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
