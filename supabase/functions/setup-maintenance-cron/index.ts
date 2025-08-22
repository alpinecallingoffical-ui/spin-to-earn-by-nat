import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🔧 Setting up daily maintenance cron job...');

    // First, ensure pg_cron extension is available
    const { error: extensionError } = await supabaseClient
      .rpc('create_extension_if_not_exists', { extension_name: 'pg_cron' });

    if (extensionError && !extensionError.message.includes('already exists')) {
      console.warn('Extension setup warning:', extensionError.message);
    }

    // Remove any existing maintenance cron jobs
    const { error: cleanupError } = await supabaseClient
      .from('cron.job')
      .delete()
      .like('jobname', 'daily-maintenance%');

    if (cleanupError && !cleanupError.message.includes('does not exist')) {
      console.warn('Cleanup warning:', cleanupError.message);
    }

    // Create the daily maintenance cron job
    const cronQuery = `
      SELECT cron.schedule(
        'daily-maintenance-system',
        '0 2 * * *', -- Run at 2:00 AM every day
        $$
        SELECT
          net.http_post(
            url:='${Deno.env.get('SUPABASE_URL')}/functions/v1/daily-maintenance',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
            body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
          ) as request_id;
        $$
      );
    `;

    const { data: cronData, error: cronError } = await supabaseClient
      .rpc('exec_sql', { sql: cronQuery });

    if (cronError) {
      console.error('Cron setup error:', cronError);
      throw cronError;
    }

    console.log('✅ Daily maintenance cron job created successfully');

    // Also create a manual trigger for immediate testing
    const { error: testError } = await supabaseClient.functions.invoke('daily-maintenance', {
      body: { test: true, timestamp: new Date().toISOString() }
    });

    let testResult = 'Manual test completed';
    if (testError) {
      testResult = `Manual test warning: ${testError.message}`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily maintenance cron job has been set up successfully',
        details: {
          schedule: 'Daily at 2:00 AM',
          job_name: 'daily-maintenance-system',
          test_result: testResult,
          next_run: 'Tonight at 2:00 AM',
          manual_trigger_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/daily-maintenance`
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Maintenance cron setup failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        help: 'Make sure pg_cron and pg_net extensions are enabled in your Supabase project'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});