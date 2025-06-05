
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalRequest {
  withdrawalId: string;
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { withdrawalId, adminNotes }: ApprovalRequest = await req.json();

    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get withdrawal details
    const { data: withdrawal, error: withdrawalError } = await supabaseAdmin
      .from('withdrawals')
      .select('*, users!inner(name, email)')
      .eq('id', withdrawalId)
      .eq('status', 'pending')
      .single();

    if (withdrawalError || !withdrawal) {
      throw new Error('Withdrawal not found or already processed');
    }

    const user = withdrawal.users;
    const rupeeAmount = (withdrawal.coin_amount / 10).toFixed(2);

    // Update withdrawal status
    const { error: updateError } = await supabaseAdmin
      .from('withdrawals')
      .update({
        status: 'completed',
        admin_notes: adminNotes || 'Withdrawal approved and processed'
      })
      .eq('id', withdrawalId);

    if (updateError) throw updateError;

    // Create notification
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: withdrawal.user_id,
        title: '💰 Withdrawal Completed!',
        message: `Your withdrawal of ${withdrawal.coin_amount.toLocaleString()} coins (Rs. ${rupeeAmount}) has been successfully processed to eSewa number ${withdrawal.esewa_number}.`,
        type: 'success'
      });

    if (notificationError) throw notificationError;

    // Send email notification using EmailJS
    const emailData = {
      to_email: user.email,
      to_name: user.name,
      withdrawal_amount: withdrawal.coin_amount.toLocaleString(),
      rupee_amount: rupeeAmount,
      esewa_number: withdrawal.esewa_number,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    // Return success with email data for frontend to handle
    return new Response(JSON.stringify({ 
      success: true, 
      emailData,
      message: 'Withdrawal approved and notification created' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in approve-withdrawal-with-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
