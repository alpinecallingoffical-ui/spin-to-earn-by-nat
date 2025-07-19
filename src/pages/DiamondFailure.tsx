import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const DiamondFailure: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const handleFailure = async () => {
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
        // Update purchase status to failed
        const { error: updateError } = await supabase
          .from('diamond_purchases')
          .update({
            payment_status: 'failed'
          })
          .eq('id', purchaseId);

        if (updateError) throw updateError;

        toast({
          title: "Payment Cancelled",
          description: "Payment was cancelled or failed. No charges were made.",
          variant: "destructive"
        });
        
      } catch (error) {
        console.error('Error processing failure:', error);
        toast({
          title: "Error",
          description: "Error processing payment status.",
          variant: "destructive"
        });
      } finally {
        setProcessing(false);
      }
    };

    handleFailure();
  }, [searchParams, navigate]);

  const handleRetryPurchase = () => {
    navigate('/', { state: { activeTab: 'mores' } });
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Processing payment status...</p>
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
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-red-800">Payment was not completed</h3>
              <p className="text-sm text-red-600">
                Your payment was cancelled or failed to process. No charges have been made to your account.
              </p>
            </div>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              You can try purchasing again or contact our support team if you need assistance.
            </p>
            
            <div className="space-y-2">
              <Button onClick={handleRetryPurchase} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button variant="outline" onClick={handleGoHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go to Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiamondFailure;