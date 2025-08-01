-- Add missing fields to withdrawals table for better bill tracking
ALTER TABLE public.withdrawals 
ADD COLUMN IF NOT EXISTS transaction_id TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processing_fee INTEGER DEFAULT 0;

-- Create function to generate transaction IDs
CREATE OR REPLACE FUNCTION public.generate_transaction_id(prefix TEXT DEFAULT 'TXN')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  timestamp_part TEXT;
  random_part TEXT;
BEGIN
  -- Get timestamp in YYYYMMDDHHMMSS format
  timestamp_part := to_char(now(), 'YYYYMMDDHH24MISS');
  
  -- Generate 4 random characters
  random_part := upper(substring(md5(random()::text) from 1 for 4));
  
  RETURN prefix || '-' || timestamp_part || '-' || random_part;
END;
$$;

-- Create trigger to auto-generate transaction IDs for withdrawals
CREATE OR REPLACE FUNCTION public.set_withdrawal_transaction_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.transaction_id IS NULL THEN
    NEW.transaction_id := generate_transaction_id('WDL');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_withdrawal_transaction_id
  BEFORE INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.set_withdrawal_transaction_id();

-- Create trigger to auto-generate transaction IDs for diamond purchases if not set
CREATE OR REPLACE FUNCTION public.set_diamond_transaction_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.transaction_id IS NULL THEN
    NEW.transaction_id := generate_transaction_id('DMD');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_diamond_transaction_id
  BEFORE INSERT ON public.diamond_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_diamond_transaction_id();