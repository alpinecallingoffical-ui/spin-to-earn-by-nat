-- Add image_url column to admin_messages table to support images in notifications
ALTER TABLE public.admin_messages ADD COLUMN image_url TEXT;