import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface DiamondPackage {
  id: string;
  name: string;
  description: string;
  diamonds: number;
  price_rs: number;
  coin_equivalent: number;
  is_active: boolean;
  is_popular: boolean;
  bonus_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface DiamondPurchase {
  id: string;
  user_id: string;
  package_id: string;
  diamonds_purchased: number;
  price_paid_rs: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  esewa_payment_id?: string;
  created_at: string;
  completed_at?: string;
  diamond_packages?: DiamondPackage;
}

export const useDiamonds = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<DiamondPackage[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<DiamondPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch diamond packages
  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('diamond_packages')
        .select('*')
        .eq('is_active', true)
        .order('price_rs', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching diamond packages:', error);
      toast({
        title: "Error",
        description: "Failed to load diamond packages",
        variant: "destructive",
      });
    }
  };

  // Fetch purchase history
  const fetchPurchaseHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('diamond_purchases')
        .select(`
          *,
          diamond_packages (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseHistory(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  // Create a diamond purchase (pending payment)
  const createPurchase = async (packageId: string) => {
    if (!user) return null;
    
    try {
      setPurchasing(packageId);
      
      const selectedPackage = packages.find(p => p.id === packageId);
      if (!selectedPackage) {
        throw new Error('Package not found');
      }

      const { data, error } = await supabase
        .from('diamond_purchases')
        .insert({
          user_id: user.id,
          package_id: packageId,
          diamonds_purchased: selectedPackage.diamonds,
          price_paid_rs: selectedPackage.price_rs,
          payment_method: 'esewa',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Purchase Created",
        description: "Please complete the payment process",
        variant: "default",
      });

      await fetchPurchaseHistory();
      return data;
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase",
        variant: "destructive",
      });
      return null;
    } finally {
      setPurchasing(null);
    }
  };

  // Convert diamonds to coins
  const convertDiamondsToCoins = async (diamondAmount: number) => {
    try {
      const { data, error } = await supabase.rpc('convert_diamonds_to_coins', {
        diamond_amount: diamondAmount
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Conversion Successful",
          description: `Converted ${diamondAmount} diamonds to ${diamondAmount * 1000} coins`,
          variant: "default",
        });
        return true;
      } else {
        toast({
          title: "Insufficient Diamonds",
          description: "You don't have enough diamonds for this conversion",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('Error converting diamonds:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert diamonds",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPackages(),
        fetchPurchaseHistory()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Set up real-time subscriptions for purchase updates
  useEffect(() => {
    const channel = supabase
      .channel('diamond_purchases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diamond_purchases'
        },
        () => {
          fetchPurchaseHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    packages,
    purchaseHistory,
    loading,
    purchasing,
    createPurchase,
    convertDiamondsToCoins,
    fetchPackages,
    fetchPurchaseHistory
  };
};