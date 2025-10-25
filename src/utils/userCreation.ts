
import { supabase } from '@/integrations/supabase/client';

export const createUserProfile = async (userId: string, userData: {
  name: string;
  email?: string;
  phone?: string;
  referredBy?: string;
}) => {
  try {
    console.log('Creating user profile for:', userId, userData);
    
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
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();
      
      if (!existing) {
        isUnique = true;
      } else {
        referralCode = generateReferralCode();
        attempts++;
      }
    }

    // Calculate initial coins (50 if referred, 0 otherwise)
    const initialCoins = userData.referredBy ? 50 : 0;

    // Generate username from name
    const username = userData.name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Insert user profile
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: userData.name,
        username: username,
        email: userData.email,
        phone: userData.phone,
        referral_code: referralCode,
        referred_by: userData.referredBy,
        coins: initialCoins,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting user:', insertError);
      throw insertError;
    }

    console.log('User profile created:', newUser);

    // Handle referral bonus
    if (userData.referredBy) {
      try {
        console.log('Processing referral bonus for code:', userData.referredBy);
        
        // Find the referrer
        const { data: referrer, error: referrerError } = await supabase
          .from('users')
          .select('id, coins')
          .eq('referral_code', userData.referredBy)
          .maybeSingle();

        if (referrerError) {
          console.error('Error finding referrer:', referrerError);
        } else if (referrer) {
          console.log('Found referrer:', referrer);
          
          // Give bonus to referrer using a direct update
          const { error: updateError } = await supabase
            .from('users')
            .update({ coins: referrer.coins + 100 })
            .eq('id', referrer.id);

          if (updateError) {
            console.error('Error updating referrer coins:', updateError);
          } else {
            console.log('Referrer bonus applied successfully');
            
            // Record the referral
            const { error: referralError } = await supabase
              .from('referrals')
              .insert({
                referrer_id: referrer.id,
                referred_user_id: userId,
                bonus_given: 100,
              });

            if (referralError) {
              console.error('Error recording referral:', referralError);
            } else {
              console.log('Referral recorded successfully');
            }
          }
        } else {
          console.log('Referrer not found for code:', userData.referredBy);
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
      }
    }

    return newUser;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
