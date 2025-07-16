-- Create item categories table
CREATE TABLE public.item_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shop items table
CREATE TABLE public.shop_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category_id UUID REFERENCES public.item_categories(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'theme', 'powerup', 'avatar', 'decoration', etc.
  item_data JSONB DEFAULT '{}', -- stores item-specific properties
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_limited BOOLEAN DEFAULT false,
  limited_quantity INTEGER,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user inventory table
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false, -- for themes, avatars, etc.
  UNIQUE(user_id, item_id)
);

-- Create purchase history table
CREATE TABLE public.purchase_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  total_price INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for item_categories (public read)
CREATE POLICY "Anyone can view item categories" 
ON public.item_categories 
FOR SELECT 
USING (true);

-- RLS Policies for shop_items (public read)
CREATE POLICY "Anyone can view active shop items" 
ON public.shop_items 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for user_inventory
CREATE POLICY "Users can view their own inventory" 
ON public.user_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own inventory" 
ON public.user_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory" 
ON public.user_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for purchase_history
CREATE POLICY "Users can view their own purchase history" 
ON public.purchase_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
ON public.purchase_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to handle item purchases
CREATE OR REPLACE FUNCTION public.purchase_item(
  item_uuid UUID,
  purchase_quantity INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  item_price INTEGER;
  total_cost INTEGER;
  user_coins INTEGER;
  user_banned BOOLEAN;
  item_record RECORD;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user's current coins and banned status
  SELECT coins, banned INTO user_coins, user_banned
  FROM public.users
  WHERE id = current_user_id;
  
  -- Check if user is banned
  IF user_banned = true THEN
    RETURN FALSE;
  END IF;
  
  -- Get item details
  SELECT * INTO item_record
  FROM public.shop_items
  WHERE id = item_uuid AND is_active = true;
  
  IF item_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate total cost
  total_cost := item_record.price * purchase_quantity;
  
  -- Check if user has enough coins
  IF user_coins < total_cost THEN
    RETURN FALSE;
  END IF;
  
  -- Check limited quantity
  IF item_record.is_limited = true AND 
     (item_record.sold_count + purchase_quantity) > item_record.limited_quantity THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct coins from user
  UPDATE public.users
  SET coins = coins - total_cost
  WHERE id = current_user_id;
  
  -- Add to user inventory or update quantity
  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (current_user_id, item_uuid, purchase_quantity)
  ON CONFLICT (user_id, item_id)
  DO UPDATE SET quantity = user_inventory.quantity + purchase_quantity;
  
  -- Update sold count
  UPDATE public.shop_items
  SET sold_count = sold_count + purchase_quantity
  WHERE id = item_uuid;
  
  -- Record purchase history
  INSERT INTO public.purchase_history (user_id, item_id, quantity, total_price)
  VALUES (current_user_id, item_uuid, purchase_quantity, total_cost);
  
  RETURN TRUE;
END;
$$;

-- Create function to equip/unequip items
CREATE OR REPLACE FUNCTION public.equip_item(
  item_uuid UUID,
  should_equip BOOLEAN DEFAULT true
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  item_type_val TEXT;
BEGIN
  current_user_id := auth.uid();
  
  -- Get item type
  SELECT si.item_type INTO item_type_val
  FROM public.user_inventory ui
  JOIN public.shop_items si ON ui.item_id = si.id
  WHERE ui.user_id = current_user_id AND ui.item_id = item_uuid;
  
  IF item_type_val IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If equipping, unequip other items of same type first
  IF should_equip = true THEN
    UPDATE public.user_inventory
    SET is_equipped = false
    WHERE user_id = current_user_id 
    AND item_id IN (
      SELECT si.id 
      FROM public.shop_items si 
      WHERE si.item_type = item_type_val
    );
  END IF;
  
  -- Equip/unequip the item
  UPDATE public.user_inventory
  SET is_equipped = should_equip
  WHERE user_id = current_user_id AND item_id = item_uuid;
  
  RETURN TRUE;
END;
$$;

-- Insert sample categories
INSERT INTO public.item_categories (name, description, icon, display_order) VALUES
('Themes', 'Customize your app appearance', '🎨', 1),
('Power-ups', 'Boost your earning potential', '⚡', 2),
('Avatars', 'Profile picture decorations', '👤', 3),
('Decorations', 'Special visual effects', '✨', 4);

-- Insert sample shop items
INSERT INTO public.shop_items (name, description, price, category_id, item_type, item_data, image_url) VALUES
-- Themes
('Golden Theme', 'Luxurious golden interface theme', 500, (SELECT id FROM public.item_categories WHERE name = 'Themes'), 'theme', '{"colors": {"primary": "#FFD700", "secondary": "#FFA500"}}', null),
('Ocean Theme', 'Calm blue ocean theme', 300, (SELECT id FROM public.item_categories WHERE name = 'Themes'), 'theme', '{"colors": {"primary": "#0066CC", "secondary": "#00AAFF"}}', null),
('Neon Theme', 'Vibrant neon cyberpunk theme', 800, (SELECT id FROM public.item_categories WHERE name = 'Themes'), 'theme', '{"colors": {"primary": "#FF00FF", "secondary": "#00FFFF"}}', null),

-- Power-ups
('Double Coins', 'Double your coin rewards for 1 hour', 200, (SELECT id FROM public.item_categories WHERE name = 'Power-ups'), 'powerup', '{"effect": "double_coins", "duration": 3600}', null),
('Extra Spin', 'Get 5 additional spins for today', 150, (SELECT id FROM public.item_categories WHERE name = 'Power-ups'), 'powerup', '{"effect": "extra_spins", "amount": 5}', null),
('Lucky Multiplier', '10x chance for rare rewards for 30 minutes', 500, (SELECT id FROM public.item_categories WHERE name = 'Power-ups'), 'powerup', '{"effect": "lucky_multiplier", "duration": 1800}', null),

-- Avatars
('Crown Avatar', 'Royal crown decoration', 400, (SELECT id FROM public.item_categories WHERE name = 'Avatars'), 'avatar', '{"decoration": "crown", "rarity": "epic"}', null),
('Sunglasses Avatar', 'Cool sunglasses decoration', 250, (SELECT id FROM public.item_categories WHERE name = 'Avatars'), 'avatar', '{"decoration": "sunglasses", "rarity": "rare"}', null),
('Halo Avatar', 'Angelic halo decoration', 600, (SELECT id FROM public.item_categories WHERE name = 'Avatars'), 'avatar', '{"decoration": "halo", "rarity": "legendary"}', null),

-- Decorations
('Sparkle Effect', 'Sparkling animation around your profile', 300, (SELECT id FROM public.item_categories WHERE name = 'Decorations'), 'decoration', '{"effect": "sparkle", "animation": "floating"}', null),
('Rainbow Border', 'Colorful rainbow border effect', 450, (SELECT id FROM public.item_categories WHERE name = 'Decorations'), 'decoration', '{"effect": "rainbow_border", "animation": "rotating"}', null);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shop_items_updated_at
BEFORE UPDATE ON public.shop_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();