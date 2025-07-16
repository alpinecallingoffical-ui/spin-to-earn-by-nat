import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEquippedItems } from '@/hooks/useEquippedItems';
import { useShop } from '@/hooks/useShop';
import { useToast } from '@/hooks/use-toast';
import { Zap, Clock, X } from 'lucide-react';

export const PowerUpManager: React.FC = () => {
  const { activePowerUps, removePowerUp, addPowerUp } = useEquippedItems();
  const { userInventory } = useShop();
  const { toast } = useToast();

  // Get available power-ups from inventory
  const availablePowerUps = userInventory.filter(
    item => item.shop_items.item_type === 'powerup' && item.quantity > 0
  );

  const usePowerUp = async (inventoryItem: any) => {
    const powerUp = inventoryItem.shop_items;
    const effect = powerUp.item_data?.effect;

    // Check if power-up is already active
    if (activePowerUps.some(p => p.item_data?.effect === effect)) {
      toast({
        title: "Power-up Already Active",
        description: "This power-up is already in use",
        variant: "destructive",
      });
      return;
    }

    // Add power-up to active list
    addPowerUp(powerUp);

    // Handle specific power-up effects
    switch (effect) {
      case 'extra_spins':
        // This will be handled in the spin component
        toast({
          title: "Extra Spins Activated! ⚡",
          description: `You got ${powerUp.item_data?.amount || 5} additional spins for today!`,
        });
        break;
      case 'double_coins':
        toast({
          title: "Double Coins Activated! 💰",
          description: `All coin rewards will be doubled for ${Math.floor((powerUp.item_data?.duration || 3600) / 60)} minutes!`,
        });
        break;
      case 'lucky_multiplier':
        toast({
          title: "Lucky Multiplier Activated! 🍀",
          description: `10x chance for rare rewards for ${Math.floor((powerUp.item_data?.duration || 1800) / 60)} minutes!`,
        });
        break;
    }
  };

  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Active Power-ups */}
      {activePowerUps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Active Power-ups
          </h3>
          <div className="grid gap-2">
            {activePowerUps.map((powerUp) => (
              <Card key={powerUp.id} className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold">{powerUp.name}</span>
                      {powerUp.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeRemaining(powerUp.expiresAt)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePowerUp(powerUp.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Power-ups */}
      {availablePowerUps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Available Power-ups
          </h3>
          <div className="grid gap-2">
            {availablePowerUps.map((inventoryItem) => {
              const powerUp = inventoryItem.shop_items;
              const isActive = activePowerUps.some(p => p.item_data?.effect === powerUp.item_data?.effect);
              
              return (
                <Card key={inventoryItem.id} className={isActive ? 'opacity-50' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{powerUp.name}</span>
                          <Badge variant="outline">x{inventoryItem.quantity}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                      </div>
                      <Button
                        onClick={() => usePowerUp(inventoryItem)}
                        disabled={isActive}
                        size="sm"
                      >
                        {isActive ? 'Active' : 'Use'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {availablePowerUps.length === 0 && activePowerUps.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No power-ups available</p>
            <p className="text-sm text-muted-foreground">Purchase power-ups from the shop to boost your earnings!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};