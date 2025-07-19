import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Diamond, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/hooks/useUserData';
import { useDiamonds } from '@/hooks/useDiamonds';

const DiamondSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch: refetchUserData } = useUserData();
  const { refetchData: refetchDiamondData } = useDiamonds();
  const [processing, setProcessing] = useState(true);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  useEffect(() => {
    const handleSuccess = async () => {
      let purchaseId = searchParams.get('purchase_id');
      
      // Clean the purchase_id if it has additional query parameters
      if (purchaseId && purchaseId.includes('?')) {
        purchaseId = purchaseId.split('?')[0];
      }
      
      if (!purchaseId) {
        toast({
          title: "Error",
          description: "Invalid purchase reference",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      try {
        // Get purchase details
        const { data: purchase, error: purchaseError } = await supabase
          .from('diamond_purchases')
          .select(`
            *,
            diamond_packages (*)
          `)
          .eq('id', purchaseId)
          .single();

        if (purchaseError) throw purchaseError;

        // Update purchase status to completed
        const { error: updateError } = await supabase
          .from('diamond_purchases')
          .update({
            payment_status: 'completed',
            completed_at: new Date().toISOString(),
            esewa_payment_id: searchParams.get('oid') || searchParams.get('refId')
          })
          .eq('id', purchaseId);

        if (updateError) throw updateError;

        // Add diamonds to user account (increment existing diamonds)
        const { data: userData, error: getUserError } = await supabase
          .from('users')
          .select('diamonds')
          .eq('id', purchase.user_id)
          .single();

        if (getUserError) throw getUserError;

        const { error: userUpdateError } = await supabase
          .from('users')
          .update({
            diamonds: (userData.diamonds || 0) + purchase.diamonds_purchased
          })
          .eq('id', purchase.user_id);

        if (userUpdateError) throw userUpdateError;

        // Send notification to user
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: purchase.user_id,
            title: '💎 Diamond Purchase Successful!',
            message: `Congratulations! You have successfully purchased ${purchase.diamonds_purchased} diamonds for Rs. ${purchase.price_paid_rs}. Your diamonds have been added to your account.`,
            type: 'success'
          });

        if (notificationError) throw notificationError;

        setPurchaseDetails(purchase);
        
        // Refresh both user data and diamond data to show updated diamonds
        await Promise.all([
          refetchUserData(),
          refetchDiamondData()
        ]);
        
        toast({
          title: "Purchase Complete!",
          description: "Payment completed successfully! Diamonds added to your account."
        });
        
      } catch (error) {
        console.error('Error processing success:', error);
        toast({
          title: "Error",
          description: "Error processing payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setProcessing(false);
      }
    };

    handleSuccess();
  }, [searchParams, navigate]);

  const handleContinue = () => {
    navigate('/', { state: { activeTab: 'mores' } });
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Processing your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {purchaseDetails && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Diamond className="h-6 w-6 text-blue-400" />
                <div>
                  <h3 className="font-semibold">{purchaseDetails.diamond_packages?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {purchaseDetails.diamonds_purchased} diamonds purchased
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">Rs. {purchaseDetails.price_paid_rs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diamonds Received:</span>
                  <span className="font-semibold">{purchaseDetails.diamonds_purchased}</span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Gift className="h-5 w-5" />
              <span className="text-sm">Diamonds added to your account!</span>
            </div>
            
            <Button onClick={handleContinue} className="w-full">
              Continue to Shop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiamondSuccess;