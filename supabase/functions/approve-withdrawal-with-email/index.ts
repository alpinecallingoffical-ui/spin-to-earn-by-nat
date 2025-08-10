
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");

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

    // Build and send email using Resend with your HTML template
    const { data: updatedWithdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    const txId = updatedWithdrawal?.transaction_id ?? withdrawal.transaction_id ?? 'N/A';
    const processedAt = updatedWithdrawal?.processed_at ?? new Date().toISOString();
    const formattedDate = new Date(processedAt).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Withdrawal Successful</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f3f6f9; padding: 40px; display: flex; justify-content: center; align-items: center; }
    .success-card { background-color: #ffffff; padding: 30px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 500px; width: 100%; }
    .success-card h2 { color: #28a745; }
    .details { margin-top: 20px; line-height: 1.8; }
    .details span { font-weight: bold; }
  </style>
</head>
<body>
  <div class="success-card">
    <h2>✅ Withdrawal Successful</h2>
    <p>Your withdrawal request has been processed successfully.</p>
    <div class="details">
      <p><span>Name:</span> ${user.name ?? 'User'}</p>
      <p><span>eSewa ID:</span> ${withdrawal.esewa_number}</p>
      <p><span>Amount:</span> Rs. ${rupeeAmount}</p>
      <p><span>Transaction ID:</span> ${txId}</p>
      <p><span>Status:</span> Completed</p>
      <p><span>Date:</span> ${formattedDate}</p>
    </div>
    <p style="margin-top:16px;color:#6c757d;">You will receive your money within 24-48 hours.</p>
  </div>
</body>
</html>`;

    let emailResponse: any = null;
    try {
      emailResponse = await resend.emails.send({
        from: 'SpinWin <onboarding@resend.dev>',
        to: [user.email],
        subject: 'Withdrawal Successful',
        html,
      });
      console.log('Email sent successfully:', emailResponse);
    } catch (e) {
      console.error('Error sending email via Resend:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Withdrawal approved, notification created, email sent',
      email: emailResponse,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
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
