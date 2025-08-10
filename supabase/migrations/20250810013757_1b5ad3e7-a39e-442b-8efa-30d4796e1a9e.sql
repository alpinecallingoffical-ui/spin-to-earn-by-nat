-- Ensure transaction IDs are auto-generated and timestamps are set on status changes
-- 1) Create triggers to auto-generate transaction_id on insert

-- Withdrawals: transaction_id
DROP TRIGGER IF EXISTS trg_set_withdrawal_txn ON public.withdrawals;
CREATE TRIGGER trg_set_withdrawal_txn
BEFORE INSERT ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.set_withdrawal_transaction_id();

-- Diamond purchases: transaction_id
DROP TRIGGER IF EXISTS trg_set_diamond_txn ON public.diamond_purchases;
CREATE TRIGGER trg_set_diamond_txn
BEFORE INSERT ON public.diamond_purchases
FOR EACH ROW
EXECUTE FUNCTION public.set_diamond_transaction_id();

-- 2) Set processed_at automatically when withdrawals move to completed
CREATE OR REPLACE FUNCTION public.set_processed_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.processed_at IS NULL THEN
    NEW.processed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_withdrawals_set_processed_at ON public.withdrawals;
CREATE TRIGGER trg_withdrawals_set_processed_at
BEFORE UPDATE ON public.withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.set_processed_at_on_status_change();

-- 3) Set completed_at automatically when diamond payments become completed
CREATE OR REPLACE FUNCTION public.set_completed_at_on_payment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS DISTINCT FROM 'completed') AND NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_diamond_set_completed_at ON public.diamond_purchases;
CREATE TRIGGER trg_diamond_set_completed_at
BEFORE UPDATE ON public.diamond_purchases
FOR EACH ROW
EXECUTE FUNCTION public.set_completed_at_on_payment_status_change();