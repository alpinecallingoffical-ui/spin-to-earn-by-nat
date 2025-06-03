
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface VipBenefit {
  id: string;
  benefit_type: string;
  benefit_data: any;
  used_at: string;
}

export const useVipBenefits = () => {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<VipBenefit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBenefits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_benefits')
        .select('*')
        .eq('user_id', user.id)
        .gte('used_at', new Date().toISOString().split('T')[0])
        .order('used_at', { ascending: false });

      if (error) throw error;
      setBenefits(data || []);
    } catch (error) {
      console.error('Error fetching VIP benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysBenefits = () => {
    const today = new Date().toISOString().split('T')[0];
    return benefits.filter(benefit => 
      benefit.used_at.startsWith(today)
    );
  };

  const getBenefitsByType = (type: string) => {
    return benefits.filter(benefit => benefit.benefit_type === type);
  };

  const getTotalMultiplierSavings = () => {
    return benefits.reduce((total, benefit) => {
      if (benefit.benefit_data?.total_reward && benefit.benefit_data?.base_reward) {
        return total + (benefit.benefit_data.total_reward - benefit.benefit_data.base_reward);
      }
      return total;
    }, 0);
  };

  useEffect(() => {
    fetchBenefits();
  }, [user]);

  return {
    benefits,
    loading,
    refetch: fetchBenefits,
    getTodaysBenefits,
    getBenefitsByType,
    getTotalMultiplierSavings,
  };
};
