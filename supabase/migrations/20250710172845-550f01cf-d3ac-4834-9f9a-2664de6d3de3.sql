
-- Drop existing foreign key constraints and recreate them with CASCADE DELETE
-- This will allow user deletion to work properly

-- Fix tasks table foreign key
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix spins table foreign key
ALTER TABLE public.spins DROP CONSTRAINT IF EXISTS spins_user_id_fkey;
ALTER TABLE public.spins ADD CONSTRAINT spins_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix withdrawals table foreign key
ALTER TABLE public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_user_id_fkey;
ALTER TABLE public.withdrawals ADD CONSTRAINT withdrawals_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix game_scores table foreign key
ALTER TABLE public.game_scores DROP CONSTRAINT IF EXISTS game_scores_user_id_fkey;
ALTER TABLE public.game_scores ADD CONSTRAINT game_scores_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix video_watches table foreign key
ALTER TABLE public.video_watches DROP CONSTRAINT IF EXISTS video_watches_user_id_fkey;
ALTER TABLE public.video_watches ADD CONSTRAINT video_watches_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix user_benefits table foreign key
ALTER TABLE public.user_benefits DROP CONSTRAINT IF EXISTS user_benefits_user_id_fkey;
ALTER TABLE public.user_benefits ADD CONSTRAINT user_benefits_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix referrals table foreign keys
ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referrer_id_fkey 
  FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.referrals DROP CONSTRAINT IF EXISTS referrals_referred_user_id_fkey;
ALTER TABLE public.referrals ADD CONSTRAINT referrals_referred_user_id_fkey 
  FOREIGN KEY (referred_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Fix spin_management table foreign keys
ALTER TABLE public.spin_management DROP CONSTRAINT IF EXISTS spin_management_user_id_fkey;
ALTER TABLE public.spin_management ADD CONSTRAINT spin_management_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.spin_management DROP CONSTRAINT IF EXISTS spin_management_processed_by_fkey;
ALTER TABLE public.spin_management ADD CONSTRAINT spin_management_processed_by_fkey 
  FOREIGN KEY (processed_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- Fix admin_messages table foreign key (user_id should cascade, admin_id should set null)
ALTER TABLE public.admin_messages DROP CONSTRAINT IF EXISTS admin_messages_user_id_fkey;
ALTER TABLE public.admin_messages ADD CONSTRAINT admin_messages_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
