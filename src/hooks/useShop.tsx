import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  item_type: string;
  item_data: any;
  image_url?: string;
  is_active: boolean;
  is_limited: boolean;
  limited_quantity?: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export interface ItemCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  display_order: number;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  purchased_at: string;
  is_equipped: boolean;
  shop_items: ShopItem;
}

export interface PurchaseHistoryItem {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  total_price: number;
  purchased_at: string;
  shop_items: ShopItem;
}

export const useShop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [userInventory, setUserInventory] = useState<UserInventoryItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('item_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load shop categories",
        variant: "destructive",
      });
    }
  };

  // Fetch shop items
  const fetchShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShopItems(data || []);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      toast({
        title: "Error",
        description: "Failed to load shop items",
        variant: "destructive",
      });
    }
  };

  // Fetch user inventory
  const fetchUserInventory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          shop_items (*)
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      setUserInventory(data || []);
    } catch (error) {
      console.error('Error fetching user inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load your inventory",
        variant: "destructive",
      });
    }
  };

  // Fetch purchase history
  const fetchPurchaseHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select(`
          *,
          shop_items (*)
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPurchaseHistory(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase history",
        variant: "destructive",
      });
    }
  };

  // Purchase item
  const purchaseItem = async (itemId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase items",
        variant: "destructive",
      });
      return false;
    }

    setPurchasing(itemId);
    try {
      const { data, error } = await supabase.rpc('purchase_item', {
        item_uuid: itemId,
        purchase_quantity: quantity
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Purchase Successful! 🎉",
          description: "Item has been added to your inventory",
        });
        
        // Refresh data
        await Promise.all([
          fetchUserInventory(),
          fetchPurchaseHistory(),
          fetchShopItems() // Refresh to update sold count
        ]);
        
        return true;
      } else {
        toast({
          title: "Purchase Failed",
          description: "Insufficient coins or item unavailable",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred during purchase",
        variant: "destructive",
      });
      return false;
    } finally {
      setPurchasing(null);
    }
  };

  // Equip/unequip item
  const toggleEquipItem = async (itemId: string, shouldEquip: boolean) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('equip_item', {
        item_uuid: itemId,
        should_equip: shouldEquip
      });

      if (error) throw error;

      if (data) {
        toast({
          title: shouldEquip ? "Item Equipped" : "Item Unequipped",
          description: shouldEquip ? "Item is now active" : "Item has been unequipped",
        });
        
        await fetchUserInventory();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling item:', error);
      toast({
        title: "Error",
        description: "Failed to update item status",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get items by category
  const getItemsByCategory = (categoryId: string) => {
    return shopItems.filter(item => item.category_id === categoryId);
  };

  // Check if user owns item
  const userOwnsItem = (itemId: string) => {
    return userInventory.some(item => item.item_id === itemId);
  };

  // Get equipped items by type
  const getEquippedItems = () => {
    return userInventory.filter(item => item.is_equipped);
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchShopItems(),
        fetchUserInventory(),
        fetchPurchaseHistory()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const inventorySubscription = supabase
      .channel('user_inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_inventory',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchUserInventory();
        }
      )
      .subscribe();

    const shopItemsSubscription = supabase
      .channel('shop_items_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shop_items'
        },
        () => {
          fetchShopItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(inventorySubscription);
      supabase.removeChannel(shopItemsSubscription);
    };
  }, [user]);

  return {
    categories,
    shopItems,
    userInventory,
    purchaseHistory,
    loading,
    purchasing,
    purchaseItem,
    toggleEquipItem,
    getItemsByCategory,
    userOwnsItem,
    getEquippedItems,
    fetchUserInventory,
    fetchShopItems,
    fetchPurchaseHistory
  };
};