import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useShop } from '@/hooks/useShop';
import { useUserData } from '@/hooks/useUserData';
import LotterySection from '@/components/LotterySection';
import DiamondShop from '@/components/DiamondShop';
import { 
  ShoppingCart, 
  Coins, 
  Crown, 
  Sparkles, 
  Palette, 
  Zap, 
  Users,
  Package,
  History,
  Star,
  Check,
  Ticket
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const ShopSection: React.FC = () => {
  const { userData } = useUserData();
  const {
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
    getEquippedItems
  } = useShop();

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'themes': return <Palette className="h-5 w-5" />;
      case 'power-ups': return <Zap className="h-5 w-5" />;
      case 'avatars': return <Users className="h-5 w-5" />;
      case 'decorations': return <Sparkles className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const ItemCard = ({ item }: { item: any }) => {
    const owned = userOwnsItem(item.id);
    const canAfford = userData?.coins >= item.price;
    const isLimitedAndSoldOut = item.is_limited && item.sold_count >= item.limited_quantity;
    const rarity = item.item_data?.rarity || 'common';

    return (
      <Card className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        owned ? 'ring-2 ring-green-500' : ''
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {item.name}
              {owned && <Check className="h-4 w-4 text-green-500" />}
            </CardTitle>
            <Badge className={getRarityColor(rarity)}>
              {rarity}
            </Badge>
          </div>
          <CardDescription className="text-sm">{item.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{item.price.toLocaleString()}</span>
              </div>
              
              {item.is_limited && (
                <Badge variant="outline">
                  {item.limited_quantity - item.sold_count} left
                </Badge>
              )}
            </div>

            {item.item_type === 'powerup' && item.item_data?.duration && (
              <Badge variant="secondary">
                Duration: {Math.floor(item.item_data.duration / 60)}m
              </Badge>
            )}

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedItem(item)}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {item.name}
                      <Badge className={getRarityColor(rarity)}>{rarity}</Badge>
                    </DialogTitle>
                    <DialogDescription>{item.description}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-semibold">{item.price.toLocaleString()} coins</span>
                    </div>

                    {item.item_data && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">Item Properties:</h4>
                        <pre className="bg-muted p-2 rounded text-sm">
                          {JSON.stringify(item.item_data, null, 2)}
                        </pre>
                      </div>
                    )}

                    {owned ? (
                      <Badge className="w-full justify-center" variant="default">
                        <Check className="h-4 w-4 mr-2" />
                        Owned
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => purchaseItem(item.id)}
                        disabled={!canAfford || isLimitedAndSoldOut || purchasing === item.id}
                        className="w-full"
                      >
                        {purchasing === item.id ? 'Purchasing...' : 
                         !canAfford ? 'Insufficient Coins' :
                         isLimitedAndSoldOut ? 'Sold Out' : 'Purchase'}
                      </Button>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              {!owned && (
                <Button
                  onClick={() => purchaseItem(item.id)}
                  disabled={!canAfford || isLimitedAndSoldOut || purchasing === item.id}
                  size="sm"
                  className="flex-1"
                >
                  {purchasing === item.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Buying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      Buy
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const InventoryItem = ({ inventoryItem }: { inventoryItem: any }) => {
    const item = inventoryItem.shop_items;
    const canEquip = ['theme', 'avatar', 'decoration'].includes(item.item_type);

    return (
      <Card className={inventoryItem.is_equipped ? 'ring-2 ring-blue-500' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            {item.name}
            {inventoryItem.is_equipped && (
              <Badge variant="default">Equipped</Badge>
            )}
          </CardTitle>
          <CardDescription>{item.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Quantity: {inventoryItem.quantity}</span>
              <Badge className={getRarityColor(item.item_data?.rarity)}>
                {item.item_data?.rarity || 'common'}
              </Badge>
            </div>
            
            {canEquip && (
              <Button
                onClick={() => toggleEquipItem(item.id, !inventoryItem.is_equipped)}
                variant={inventoryItem.is_equipped ? "outline" : "default"}
                size="sm"
                className="w-full"
              >
                {inventoryItem.is_equipped ? 'Unequip' : 'Equip'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
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
            <ShoppingCart className="h-6 w-6" />
            Item Shop
          </h2>
          <p className="text-muted-foreground">
            Spend your coins on amazing items and power-ups!
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{userData?.coins.toLocaleString() || 0}</span>
          </div>
          
          <Button variant="outline" onClick={() => setShowInventory(true)}>
            <Package className="h-4 w-4 mr-2" />
            Inventory ({userInventory.length})
          </Button>
          
          <Button variant="outline" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Shop Items */}
      <Tabs defaultValue="diamonds" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="diamonds" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Buy Diamonds
          </TabsTrigger>
          <TabsTrigger value="lottery" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Lottery
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {getCategoryIcon(category.name)}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="diamonds" className="space-y-4">
          <DiamondShop />
        </TabsContent>

        <TabsContent value="lottery" className="space-y-4">
          <LotterySection />
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="flex items-center gap-2">
              {getCategoryIcon(category.name)}
              <h3 className="text-xl font-semibold">{category.name}</h3>
              <Badge variant="outline">
                {getItemsByCategory(category.id).length} items
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getItemsByCategory(category.id).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Inventory Dialog */}
      <Dialog open={showInventory} onOpenChange={setShowInventory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Inventory
            </DialogTitle>
            <DialogDescription>
              Manage your purchased items and equipment
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh]">
            {userInventory.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your inventory is empty</p>
                <p className="text-sm text-muted-foreground">Purchase items from the shop to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInventory.map((inventoryItem) => (
                  <InventoryItem key={inventoryItem.id} inventoryItem={inventoryItem} />
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Purchase History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Purchase History
            </DialogTitle>
            <DialogDescription>
              View your recent purchases
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
                          <h4 className="font-semibold">{purchase.shop_items.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {purchase.quantity} • Total: {purchase.total_price.toLocaleString()} coins
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(purchase.purchased_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getRarityColor(purchase.shop_items.item_data?.rarity)}>
                          {purchase.shop_items.item_data?.rarity || 'common'}
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

export default ShopSection;