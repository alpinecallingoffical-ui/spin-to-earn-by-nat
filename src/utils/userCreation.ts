
import { supabase } from '@/integrations/supabase/client';

export const createUserProfile = async (userId: string, userData: {
  name: string;
  email?: string;
  phone?: string;
  referredBy?: string;
}) => {
  try {
    // Generate a unique referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let referralCode = generateReferralCode();
    
    // Ensure referral code is unique
    let isUnique = false;
    while (!isUnique) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .single();
      
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
      }
    }

    // Insert user profile
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        referral_code: referralCode,
        referred_by: userData.referredBy,
        coins: userData.referredBy ? 50 : 0, // Welcome bonus if referred
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Handle referral bonus
    if (userData.referredBy) {
      const { data: referrer } = await supabase
        .from('users')
        .select('id, coins')
        .eq('referral_code', userData.referredBy)
        .single();

      if (referrer) {
        // Give bonus to referrer - update coins by adding 100
        await supabase
          .from('users')
          .update({ coins: referrer.coins + 100 })
          .eq('id', referrer.id);

        // Record the referral
        await supabase
          .from('referrals')
          .insert({
            referrer_id: referrer.id,
            referred_user_id: userId,
            bonus_given: 100,
          });
      }
    }

    return newUser;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
