-- Create reports/tickets table for user problem reporting
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ticket_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  image_urls TEXT[],
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can create their own reports
CREATE POLICY "Users can create their own reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can update their own reports (only before resolved)
CREATE POLICY "Users can update their own reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status != 'resolved' AND status != 'closed');

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all reports
CREATE POLICY "Admins can update all reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Function to generate ticket ID
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'TKT-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Trigger to set ticket_id on insert
CREATE OR REPLACE FUNCTION set_ticket_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ticket_id IS NULL OR NEW.ticket_id = '' THEN
    LOOP
      NEW.ticket_id := generate_ticket_id();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reports WHERE ticket_id = NEW.ticket_id);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_report_ticket_id
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION set_ticket_id();

-- Trigger to update updated_at
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert admin role for kateljayaram@gmail.com
-- First, we need to find the user_id from auth.users
-- This will be done manually after user signs up, or via a secure function

-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report images
CREATE POLICY "Users can upload report images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own report images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all report images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'report-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Report images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-images');