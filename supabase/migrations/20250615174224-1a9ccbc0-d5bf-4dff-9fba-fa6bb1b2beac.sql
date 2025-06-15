
-- 1. Add a boolean "read" column with default false to admin_messages
ALTER TABLE public.admin_messages
ADD COLUMN read boolean NOT NULL DEFAULT false;

-- 2. Update row level security policies (if any are needed in your workflow)
-- If you'd like only the recipient user to be able to mark messages as read:
-- (If you already have the RLS to allow users to UPDATE their own messages, you may skip this.)

CREATE POLICY "Recipient can update read status" ON public.admin_messages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. (Optional) Set all existing messages as read = false
UPDATE public.admin_messages SET read = false WHERE read IS NULL;
