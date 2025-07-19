import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDiamonds, DiamondPackage } from '@/hooks/useDiamonds';
import { useUserData } from '@/hooks/useUserData';
import { 
  Diamond, 
  Coins, 
  CreditCard, 
  Star, 
  Gift,
  History,
  TrendingUp,
  Zap,
  Crown
} from 'lucide-react';

const DiamondShop: React.FC = () => {
  const { userData } = useUserData();
  const {
    packages,
    purchaseHistory,
    loading,
    purchasing,
    createPurchase,
    convertDiamondsToCoins
  } = useDiamonds();

  const [showHistory, setShowHistory] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [convertAmount, setConvertAmount] = useState('');

  const handlePurchase = async (packageId: string) => {
    const purchase = await createPurchase(packageId);
    if (purchase) {
      // Here you would integrate with eSewa payment gateway
      // For now, we'll show a placeholder
      console.log('Redirect to eSewa payment for purchase:', purchase);
    }
  };

  const handleConvert = async () => {
    const amount = parseInt(convertAmount);
    if (amount > 0) {
      const success = await convertDiamondsToCoins(amount);
      if (success) {
        setConvertAmount('');
        setShowConverter(false);
      }
    }
  };

  const getPackageIcon = (pack: DiamondPackage) => {
    if (pack.bonus_percentage >= 20) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (pack.bonus_percentage >= 15) return <Star className="h-6 w-6 text-purple-500" />;
    if (pack.bonus_percentage >= 10) return <Zap className="h-6 w-6 text-blue-500" />;
    return <Gift className="h-6 w-6 text-green-500" />;
  };

  const getPackageGradient = (pack: DiamondPackage) => {
    if (pack.bonus_percentage >= 20) return 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500';
    if (pack.bonus_percentage >= 15) return 'bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500';
    if (pack.bonus_percentage >= 10) return 'bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500';
    return 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Diamond className="h-6 w-6 text-blue-400" />
            Diamond Shop
          </h2>
          <p className="text-muted-foreground">
            Buy diamonds with real money and convert to coins! 1 Diamond = 1000 Coins = ₹20
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
            <Diamond className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">{userData?.diamonds || 0}</span>
          </div>
          
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{userData?.coins?.toLocaleString() || 0}</span>
          </div>
          
          <Button variant="outline" onClick={() => setShowConverter(true)}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Convert to Coins
          </Button>
          
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Diamond Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pack) => (
          <Card 
            key={pack.id} 
            className={`relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              pack.is_popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className={`absolute inset-0 opacity-10 ${getPackageGradient(pack)}`} />
            
            {pack.is_popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  {getPackageIcon(pack)}
                  {pack.name}
                </CardTitle>
                {pack.bonus_percentage > 0 && (
                  <Badge className="bg-green-500 text-white">
                    +{pack.bonus_percentage}% Bonus
                  </Badge>
                )}
              </div>
              <CardDescription>{pack.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="relative space-y-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Diamond className="h-6 w-6 text-blue-400" />
                  <span className="text-3xl font-bold">{pack.diamonds.toLocaleString()}</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  = {pack.coin_equivalent.toLocaleString()} coins
                </div>
                
                <div className="text-2xl font-bold text-green-600">
                  ₹{pack.price_rs}
                </div>
              </div>
              
              <Button
                onClick={() => handlePurchase(pack.id)}
                disabled={purchasing === pack.id}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {purchasing === pack.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <img src="/lovable-uploads/2f720cd6-93b4-4e37-80d4-151d44c27d9f.png" alt="eSewa" className="h-5 w-5 rounded" />
                    Pay with eSewa
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Convert Dialog */}
      <Dialog open={showConverter} onOpenChange={setShowConverter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Convert Diamonds to Coins
            </DialogTitle>
            <DialogDescription>
              Convert your diamonds to coins at 1:1000 ratio
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <Diamond className="h-5 w-5 text-blue-400" />
              <span>Available Diamonds: {userData?.diamonds || 0}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="convert-amount">Amount to Convert</Label>
              <Input
                id="convert-amount"
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="Enter diamond amount"
                min="1"
                max={userData?.diamonds || 0}
              />
            </div>
            
            {convertAmount && parseInt(convertAmount) > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm">
                  You will receive: <strong>{(parseInt(convertAmount) * 1000).toLocaleString()} coins</strong>
                </p>
              </div>
            )}
            
            <Button
              onClick={handleConvert}
              disabled={!convertAmount || parseInt(convertAmount) <= 0 || parseInt(convertAmount) > (userData?.diamonds || 0)}
              className="w-full"
            >
              Convert to Coins
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Diamond Purchase History
            </DialogTitle>
            <DialogDescription>
              View your diamond purchase history and payment status
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {purchaseHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No purchases yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchaseHistory.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            <Diamond className="h-4 w-4 text-blue-400" />
                            {purchase.diamond_packages?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {purchase.diamonds_purchased} diamonds • ₹{purchase.price_paid_rs}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString()} • {purchase.payment_method}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            purchase.payment_status === 'completed' ? 'default' :
                            purchase.payment_status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {purchase.payment_status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiamondShop;