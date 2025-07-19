-- Create diamond packages table
CREATE TABLE public.diamond_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  diamonds INTEGER NOT NULL,
  price_rs INTEGER NOT NULL, -- Price in rupees
  coin_equivalent INTEGER NOT NULL, -- How many coins this equals
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  bonus_percentage INTEGER DEFAULT 0, -- Bonus diamonds percentage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create diamond purchases table
CREATE TABLE public.diamond_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id UUID REFERENCES public.diamond_packages(id),
  diamonds_purchased INTEGER NOT NULL,
  price_paid_rs INTEGER NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'esewa',
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, cancelled
  transaction_id TEXT,
  esewa_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.diamond_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diamond_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for diamond_packages
CREATE POLICY "Anyone can view active diamond packages"
ON public.diamond_packages
FOR SELECT
USING (is_active = true);

-- Policies for diamond_purchases
CREATE POLICY "Users can create their own diamond purchases"
ON public.diamond_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diamond purchases"
ON public.diamond_purchases
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own diamond purchases"
ON public.diamond_purchases
FOR UPDATE
USING (auth.uid() = user_id);

-- Add diamonds column to users table
ALTER TABLE public.users ADD COLUMN diamonds INTEGER DEFAULT 0;

-- Insert some default diamond packages
INSERT INTO public.diamond_packages (name, description, diamonds, price_rs, coin_equivalent, is_popular, bonus_percentage) VALUES
('Starter Pack', 'Perfect for beginners', 1, 20, 1000, false, 0),
('Basic Pack', 'Great value for casual players', 5, 90, 5000, false, 10),
('Popular Pack', 'Most popular choice', 10, 180, 10000, true, 12),
('Premium Pack', 'Best value for serious players', 25, 450, 25000, false, 15),
('Mega Pack', 'Maximum value bundle', 50, 850, 50000, false, 20),
('Ultimate Pack', 'For the ultimate experience', 100, 1600, 100000, false, 25);

-- Create trigger for updated_at
CREATE TRIGGER update_diamond_packages_updated_at
  BEFORE UPDATE ON public.diamond_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to convert diamonds to coins
CREATE OR REPLACE FUNCTION public.convert_diamonds_to_coins(diamond_amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
  user_diamonds INTEGER;
  coin_equivalent INTEGER;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user's current diamonds
  SELECT diamonds INTO user_diamonds
  FROM public.users
  WHERE id = current_user_id;
  
  -- Check if user has enough diamonds
  IF user_diamonds < diamond_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate coin equivalent (1 diamond = 1000 coins)
  coin_equivalent := diamond_amount * 1000;
  
  -- Deduct diamonds and add coins
  UPDATE public.users
  SET 
    diamonds = diamonds - diamond_amount,
    coins = coins + coin_equivalent
  WHERE id = current_user_id;
  
  RETURN TRUE;
END;
$function$;