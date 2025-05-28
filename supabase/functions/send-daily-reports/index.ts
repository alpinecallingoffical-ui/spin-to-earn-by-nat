
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserStats {
  id: string;
  name: string;
  email: string;
  total_coins: number;
  daily_spin_limit: number;
  today_spins: number;
  today_coins: number;
  pending_requests: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Fetch all user statistics
    const { data: userStats, error: statsError } = await supabaseClient
      .from('user_daily_stats')
      .select('*')
      .not('email', 'is', null);

    if (statsError) {
      console.error('Error fetching user stats:', statsError);
      throw statsError;
    }

    console.log(`Found ${userStats?.length || 0} users to send reports to`);

    // Send email to each user
    for (const user of userStats as UserStats[]) {
      try {
        await sendUserReport(user);
        console.log(`Email sent successfully to ${user.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Daily reports sent to ${userStats?.length || 0} users` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-daily-reports function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function sendUserReport(user: UserStats) {
  const emailHtml = generateEmailHTML(user);
  
  // You can replace this with your preferred email service
  // For now, using a simple fetch to a hypothetical email service
  const emailData = {
    to: user.email,
    subject: '🎰 Your Daily Spin to Earn Report',
    html: emailHtml,
  };

  // Example: Send via your email service API
  // Replace this with your actual email service integration
  console.log('Email would be sent to:', user.email);
  console.log('Email content:', emailHtml);
  
  // Simulate successful email sending
  return Promise.resolve();
}

function generateEmailHTML(user: UserStats): string {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .stat-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 14px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎰 Daily Report</h1>
                <p>Hi ${user.name}! Here's your Spin to Earn summary for ${today}</p>
            </div>
            
            <div class="content">
                <div class="stat-card">
                    <div class="stat-value">${user.total_coins}</div>
                    <div class="stat-label">Total Coins in Your Account</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${user.today_coins}</div>
                    <div class="stat-label">Coins Earned Today</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${user.today_spins} / ${user.daily_spin_limit}</div>
                    <div class="stat-label">Spins Used Today</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${user.pending_requests}</div>
                    <div class="stat-label">Pending Spin Requests</div>
                </div>
                
                ${user.today_spins < user.daily_spin_limit ? `
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #2d7d2d; margin: 0;">🎯 You still have ${user.daily_spin_limit - user.today_spins} spins left today!</h3>
                    <p style="margin: 10px 0 0 0; color: #555;">Don't miss out on earning more coins!</p>
                </div>
                ` : `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h3 style="color: #856404; margin: 0;">🎉 You've used all your spins for today!</h3>
                    <p style="margin: 10px 0 0 0; color: #555;">Come back tomorrow for more earning opportunities!</p>
                </div>
                `}
            </div>
            
            <div class="footer">
                <p>This is an automated daily report from Spin to Earn</p>
                <p>Keep spinning, keep earning! 🚀</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
