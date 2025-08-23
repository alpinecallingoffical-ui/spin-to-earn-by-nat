import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceTask {
  name: string;
  description: string;
  execute: () => Promise<{ success: boolean; message: string; data?: any }>;
}

async function cleanupOldData(supabase: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Clean up old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: deletedNotifications, error: notifError } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())
      .eq('read', true);

    // Clean up old admin messages (older than 60 days and read)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const { data: deletedMessages, error: msgError } = await supabase
      .from('admin_messages')
      .delete()
      .lt('created_at', sixtyDaysAgo.toISOString())
      .eq('read', true);

    if (notifError || msgError) {
      throw new Error(`Cleanup errors: ${notifError?.message || msgError?.message}`);
    }

    return {
      success: true,
      message: 'Old data cleaned up successfully',
      data: { 
        notifications_deleted: deletedNotifications?.length || 0,
        messages_deleted: deletedMessages?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      message: `Data cleanup failed: ${error.message}`
    };
  }
}

async function optimizeDatabase(supabase: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    // Update user statistics and reset daily limits if needed
    const { error: updateError } = await supabase.rpc('refresh_daily_stats');
    
    // Recompute leaderboard rankings
    const { error: leaderboardError } = await supabase.rpc('update_leaderboard_rankings');
    
    if (updateError && !updateError.message.includes('does not exist')) {
      console.warn('Stats refresh warning:', updateError.message);
    }
    
    if (leaderboardError && !leaderboardError.message.includes('does not exist')) {
      console.warn('Leaderboard update warning:', leaderboardError.message);
    }

    return {
      success: true,
      message: 'Database optimization completed',
      data: { optimized_at: new Date().toISOString() }
    };
  } catch (error) {
    return {
      success: false,
      message: `Database optimization failed: ${error.message}`
    };
  }
}

async function applySystemUpdates(supabase: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const updates = [];
    let vipUpdatesCount = 0;

    // Check for users who need VIP benefits update
    const { data: vipUsers, error: vipError } = await supabase
      .from('users')
      .select('id, coins, daily_spin_limit')
      .gte('coins', 1000);

    if (!vipError && vipUsers) {
      for (const user of vipUsers) {
        let newLimit = 5; // Default
        let levelName = '';
        if (user.coins >= 3000) {
          newLimit = 999; // Grand Master - unlimited
          levelName = 'Grand Master';
        } else if (user.coins >= 2000) {
          newLimit = 20; // Elite Master
          levelName = 'Elite Master';
        } else if (user.coins >= 1000) {
          newLimit = 10; // VIP
          levelName = 'VIP';
        }

        if (user.daily_spin_limit !== newLimit) {
          await supabase
            .from('users')
            .update({ daily_spin_limit: newLimit })
            .eq('id', user.id);
          
          // Send personal notification about VIP upgrade
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: `🏆 ${levelName} Status Updated!`,
              message: `Congratulations! Your spin limit has been upgraded to ${newLimit === 999 ? 'unlimited' : newLimit} spins per day due to your ${levelName} status.`,
              type: 'success'
            });
          
          updates.push(`Updated spin limit for user ${user.id} to ${newLimit}`);
          vipUpdatesCount++;
        }
      }
    }

    // Auto-expire old lottery games
    const { error: lotteryError } = await supabase
      .from('lottery_games')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('draw_time', new Date().toISOString());

    if (lotteryError) {
      console.warn('Lottery expiry warning:', lotteryError.message);
    } else {
      updates.push('Expired old lottery games');
    }

    // Send general system update notification if significant changes were made
    if (vipUpdatesCount > 0) {
      await sendMaintenanceNotification(
        supabase,
        '⚙️ System Updates Applied',
        `Daily maintenance completed! ${vipUpdatesCount} users received VIP status updates. Check your profile for any changes to your benefits.`,
        'info'
      );
    }

    return {
      success: true,
      message: 'System updates applied successfully',
      data: { updates_applied: updates, vip_updates: vipUpdatesCount }
    };
  } catch (error) {
    return {
      success: false,
      message: `System updates failed: ${error.message}`
    };
  }
}

async function sendMaintenanceNotification(supabase: any, title: string, message: string, type: string = 'info'): Promise<void> {
  try {
    const { data: allUsers } = await supabase
      .from('users')
      .select('id')
      .eq('banned', false);

    if (allUsers?.length) {
      // Send as admin message for important updates
      await supabase
        .from('admin_messages')
        .insert({
          title,
          message,
          type,
          target_user: null // Broadcast to all users
        });

      console.log(`📢 Sent maintenance notification: ${title}`);
    }
  } catch (error) {
    console.error('Failed to send maintenance notification:', error);
  }
}

async function deployNewFeatures(supabase: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const features = [];

    // Check if daily bonus feature should be activated
    const today = new Date().toISOString().split('T')[0];
    const { data: existingBonus } = await supabase
      .from('admin_messages')
      .select('id')
      .eq('title', 'Daily Bonus Available!')
      .gte('created_at', today);

    if (!existingBonus?.length) {
      // Send daily bonus notification to all users
      const { data: allUsers } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('banned', false);

      if (allUsers?.length) {
        for (const user of allUsers) {
          await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: '🎁 Daily Bonus Available!',
              message: 'Your daily login bonus is ready! Spin the wheel to claim your rewards.',
              type: 'success'
            });
        }
        features.push('Daily bonus notifications sent');
      }
    }

    // Auto-create new lottery if none active
    const { data: activeLotteries } = await supabase
      .from('lottery_games')
      .select('id')
      .eq('status', 'active');

    if (!activeLotteries?.length) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0); // 8 PM tomorrow

      const { error: lotteryError } = await supabase
        .from('lottery_games')
        .insert({
          name: 'Daily Jackpot',
          description: 'Win big in our daily lottery draw!',
          ticket_price: 100,
          max_tickets_per_user: 10,
          draw_time: tomorrow.toISOString(),
          status: 'active'
        });

      if (!lotteryError) {
        features.push('Auto-created new daily lottery');
        
        // Notify users about new lottery
        await sendMaintenanceNotification(
          supabase,
          '🎰 New Lottery Available!',
          'A fresh daily lottery is now live! Get your tickets now for a chance to win big prizes.',
          'success'
        );
      }
    }

    return {
      success: true,
      message: 'New features deployed successfully',
      data: { features_deployed: features }
    };
  } catch (error) {
    return {
      success: false,
      message: `Feature deployment failed: ${error.message}`
    };
  }
}

async function performHealthCheck(supabase: any): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const healthData: any = {
      timestamp: new Date().toISOString(),
      database_status: 'healthy',
      user_stats: {},
      system_stats: {}
    };

    // Check user statistics
    const { data: userStats } = await supabase
      .from('users')
      .select('banned')
      .then((result: any) => {
        if (result.data) {
          const total = result.data.length;
          const banned = result.data.filter((u: any) => u.banned).length;
          return { total_users: total, banned_users: banned, active_users: total - banned };
        }
        return null;
      });

    if (userStats) {
      healthData.user_stats = userStats;
    }

    // Check recent activity
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: recentSpins } = await supabase
      .from('spins')
      .select('id')
      .gte('spun_at', yesterday.toISOString());

    healthData.system_stats.daily_spins = recentSpins?.length || 0;

    // Check for any critical issues
    const issues = [];
    if (healthData.system_stats.daily_spins === 0) {
      issues.push('No spins recorded in last 24 hours');
    }

    healthData.issues = issues;

    return {
      success: true,
      message: 'System health check completed',
      data: healthData
    };
  } catch (error) {
    return {
      success: false,
      message: `Health check failed: ${error.message}`
    };
  }
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

    console.log('🔧 Starting daily maintenance tasks...');

    const maintenanceTasks: MaintenanceTask[] = [
      {
        name: 'Data Cleanup',
        description: 'Remove old notifications and messages',
        execute: () => cleanupOldData(supabaseClient)
      },
      {
        name: 'Database Optimization',
        description: 'Optimize database performance and update statistics',
        execute: () => optimizeDatabase(supabaseClient)
      },
      {
        name: 'System Updates',
        description: 'Apply automatic system updates and fixes',
        execute: () => applySystemUpdates(supabaseClient)
      },
      {
        name: 'Feature Deployment',
        description: 'Deploy new features and improvements',
        execute: () => deployNewFeatures(supabaseClient)
      },
      {
        name: 'Health Check',
        description: 'Perform system health check and monitoring',
        execute: () => performHealthCheck(supabaseClient)
      }
    ];

    const results = [];
    let totalSuccess = 0;
    let totalTasks = maintenanceTasks.length;

    for (const task of maintenanceTasks) {
      console.log(`📋 Executing: ${task.name}`);
      try {
        const result = await task.execute();
        results.push({
          task: task.name,
          success: result.success,
          message: result.message,
          data: result.data
        });
        
        if (result.success) {
          totalSuccess++;
          console.log(`✅ ${task.name}: ${result.message}`);
        } else {
          console.error(`❌ ${task.name}: ${result.message}`);
        }
      } catch (error) {
        console.error(`💥 ${task.name} crashed:`, error);
        results.push({
          task: task.name,
          success: false,
          message: `Task crashed: ${error.message}`,
          data: null
        });
      }
    }

    const maintenanceReport = {
      timestamp: new Date().toISOString(),
      success_rate: `${totalSuccess}/${totalTasks}`,
      overall_status: totalSuccess === totalTasks ? 'success' : 'partial_success',
      task_results: results,
      next_maintenance: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    console.log('🎯 Daily maintenance completed:', maintenanceReport.overall_status);

    // Send final maintenance summary notification if there were issues
    if (maintenanceReport.overall_status !== 'success') {
      await sendMaintenanceNotification(
        supabaseClient,
        '🔧 Maintenance Alert',
        `Daily maintenance completed with some issues (${maintenanceReport.success_rate} tasks successful). Our team is monitoring the situation.`,
        'warning'
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Daily maintenance completed',
        report: maintenanceReport
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Daily maintenance failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});