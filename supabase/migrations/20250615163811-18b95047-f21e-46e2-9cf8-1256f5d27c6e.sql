
-- Add user_name and user_email columns to admin_messages table for easier access/display
ALTER TABLE public.admin_messages
ADD COLUMN user_name text,
ADD COLUMN user_email text;

-- (Optional but recommended) For future admin messages, the backend/app must populate these fields during insertion.
-- Existing rows will have these fields as NULL unless updated.
