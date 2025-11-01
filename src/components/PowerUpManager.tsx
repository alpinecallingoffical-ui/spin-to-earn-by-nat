import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';

interface PowerUp {
  id: string;
  type: 'double_coins' | 'extra_spin' | 'lucky_boost';
  name: string;
  description: string;
  duration: number;
  cost: number;
  icon: React.ReactNode;
}

interface ActivePowerUp {
  type: string;
  expires_at: string;
}

const POWER_UPS: PowerUp[] = [
  {
    id: 'double_coins',
    type: 'double_coins',
    name: '2x Coins Boost',
    description: 'Double all coin rewards for 30 minutes',
    duration: 30,
    cost: 100,
    icon: <TrendingUp className="w-6 h-6" />
  },
  {
    id: 'extra_spin',
    type: 'extra_spin',
    name: 'Extra Spin',
    description: 'Get 3 extra spins instantly',
    duration: 0,
    cost: 150,
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'lucky_boost',
    type: 'lucky_boost',
    name: 'Lucky Boost',
    description: 'Increased chance of higher rewards for 1 hour',
    duration: 60,
    cost: 200,
    icon: <Star className="w-6 h-6" />
  }
];

export const PowerUpManager = () => {
  const { user } = useAuth();
  const [activePowerUps, setActivePowerUps] = useState<ActivePowerUp[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchActivePowerUps();
    fetchUserCoins();
  }, [user]);

  const fetchUserCoins = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single();
    
    if (data) setUserCoins(data.coins);
  };

  const fetchActivePowerUps = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_benefits')
      .select('*')
      .eq('user_id', user.id)
      .in('benefit_type', ['double_coins', 'lucky_boost'])
      .gte('benefit_data->expires_at', new Date().toISOString());

    if (data) {
      setActivePowerUps(data.map(d => ({
        type: d.benefit_type,
        expires_at: (d.benefit_data as any).expires_at
      })));
    }
  };

  const activatePowerUp = async (powerUp: PowerUp) => {
    if (!user) return;
    if (userCoins < powerUp.cost) {
      toast.error('Not enough coins!');
      return;
    }

    setLoading(powerUp.id);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ coins: userCoins - powerUp.cost })
        .eq('id', user.id);

      if (updateError) throw updateError;

      if (powerUp.type === 'extra_spin') {
        const { error: spinError } = await supabase.rpc('exec_sql', {
          sql: `UPDATE users SET daily_spin_limit = daily_spin_limit + 3 WHERE id = '${user.id}'`
        });

        if (spinError) throw spinError;
        toast.success('🎰 3 extra spins added!');
      } else {
        const expiresAt = new Date(Date.now() + powerUp.duration * 60 * 1000).toISOString();
        const { error: insertError } = await supabase
          .from('user_benefits')
          .insert({
            user_id: user.id,
            benefit_type: powerUp.type,
            benefit_data: { expires_at: expiresAt, cost: powerUp.cost }
          });

        if (insertError) throw insertError;
        toast.success(`✨ ${powerUp.name} activated!`);
        fetchActivePowerUps();
      }

      fetchUserCoins();
    } catch (error) {
      console.error('Error activating power-up:', error);
      toast.error('Failed to activate power-up');
    } finally {
      setLoading(null);
    }
  };

  const isActive = (type: string) => {
    return activePowerUps.some(p => p.type === type);
  };

  const getTimeRemaining = (type: string) => {
    const powerUp = activePowerUps.find(p => p.type === type);
    if (!powerUp) return null;

    const remaining = new Date(powerUp.expires_at).getTime() - Date.now();
    const minutes = Math.floor(remaining / 60000);
    return minutes > 0 ? `${minutes}m remaining` : 'Expired';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Power-Ups & Boosts
        </CardTitle>
        <CardDescription>Enhance your earning potential with power-ups</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {POWER_UPS.map((powerUp) => {
            const active = isActive(powerUp.type);
            return (
              <Card key={powerUp.id} className={active ? 'border-2 border-primary' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        {powerUp.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{powerUp.name}</h3>
                          {active && (
                            <Badge variant="secondary" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {getTimeRemaining(powerUp.type)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{powerUp.cost} coins</Badge>
                          {powerUp.duration > 0 && (
                            <Badge variant="outline">{powerUp.duration} min</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => activatePowerUp(powerUp)}
                      disabled={active || loading === powerUp.id || userCoins < powerUp.cost}
                    >
                      {active ? 'Active' : 'Activate'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};