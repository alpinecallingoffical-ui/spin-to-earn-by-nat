import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, RefreshCw, Shield, Bell, DollarSign, Users } from 'lucide-react';

interface SystemSettings {
  maintenance_mode: boolean;
  min_withdrawal_coins: number;
  withdrawal_fee_percentage: number;
  max_daily_spins_default: number;
  referral_bonus_referrer: number;
  referral_bonus_referee: number;
  enable_notifications: boolean;
  max_spin_limit: number;
}

export const AdminSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    min_withdrawal_coins: 1000,
    withdrawal_fee_percentage: 0,
    max_daily_spins_default: 5,
    referral_bonus_referrer: 100,
    referral_bonus_referee: 50,
    enable_notifications: true,
    max_spin_limit: 1000,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Convert settings array to object
      const settingsObj: any = {};
      data?.forEach((setting) => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });

      setSettings({
        maintenance_mode: settingsObj.maintenance_mode || false,
        min_withdrawal_coins: settingsObj.min_withdrawal_coins || 1000,
        withdrawal_fee_percentage: settingsObj.withdrawal_fee_percentage || 0,
        max_daily_spins_default: settingsObj.max_daily_spins_default || 5,
        referral_bonus_referrer: settingsObj.referral_bonus_referrer || 100,
        referral_bonus_referee: settingsObj.referral_bonus_referee || 50,
        enable_notifications: settingsObj.enable_notifications !== false,
        max_spin_limit: settingsObj.max_spin_limit || 1000,
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save each setting individually
      const settingsEntries = Object.entries(settings);
      
      for (const [key, value] of settingsEntries) {
        await supabase
          .from('system_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            updated_by: user?.id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'setting_key',
          });
      }

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-muted-foreground">Configure application-wide settings</p>
        </div>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic application configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to prevent users from accessing the application
              </p>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Allow system to send notifications to users
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.enable_notifications}
              onCheckedChange={(checked) => updateSetting('enable_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Spin Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Spin Settings
          </CardTitle>
          <CardDescription>Configure spin limits and defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-spins">Default Daily Spin Limit</Label>
            <Input
              id="default-spins"
              type="number"
              value={settings.max_daily_spins_default}
              onChange={(e) => updateSetting('max_daily_spins_default', parseInt(e.target.value))}
              min={1}
              max={100}
            />
            <p className="text-sm text-muted-foreground">
              Default number of spins per day for new users
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-spins">Maximum Spin Limit</Label>
            <Input
              id="max-spins"
              type="number"
              value={settings.max_spin_limit}
              onChange={(e) => updateSetting('max_spin_limit', parseInt(e.target.value))}
              min={1}
              max={10000}
            />
            <p className="text-sm text-muted-foreground">
              Maximum daily spin limit that can be assigned to users
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Withdrawal Settings
          </CardTitle>
          <CardDescription>Configure withdrawal rules and fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-withdrawal">Minimum Withdrawal (Coins)</Label>
            <Input
              id="min-withdrawal"
              type="number"
              value={settings.min_withdrawal_coins}
              onChange={(e) => updateSetting('min_withdrawal_coins', parseInt(e.target.value))}
              min={100}
              max={10000}
            />
            <p className="text-sm text-muted-foreground">
              Minimum coins required to request withdrawal
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="withdrawal-fee">Withdrawal Fee (%)</Label>
            <Input
              id="withdrawal-fee"
              type="number"
              value={settings.withdrawal_fee_percentage}
              onChange={(e) => updateSetting('withdrawal_fee_percentage', parseFloat(e.target.value))}
              min={0}
              max={100}
              step={0.1}
            />
            <p className="text-sm text-muted-foreground">
              Fee percentage deducted from withdrawal amount
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Referral Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Referral Settings
          </CardTitle>
          <CardDescription>Configure referral bonuses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referrer-bonus">Referrer Bonus (Coins)</Label>
            <Input
              id="referrer-bonus"
              type="number"
              value={settings.referral_bonus_referrer}
              onChange={(e) => updateSetting('referral_bonus_referrer', parseInt(e.target.value))}
              min={0}
              max={1000}
            />
            <p className="text-sm text-muted-foreground">
              Coins awarded to the user who refers someone
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referee-bonus">Referee Bonus (Coins)</Label>
            <Input
              id="referee-bonus"
              type="number"
              value={settings.referral_bonus_referee}
              onChange={(e) => updateSetting('referral_bonus_referee', parseInt(e.target.value))}
              min={0}
              max={1000}
            />
            <p className="text-sm text-muted-foreground">
              Coins awarded to the new user who signs up with referral
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">10:1</div>
              <div className="text-xs text-muted-foreground">Coins to Rupee</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{settings.max_daily_spins_default}</div>
              <div className="text-xs text-muted-foreground">Default Spins</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{settings.min_withdrawal_coins}</div>
              <div className="text-xs text-muted-foreground">Min Withdrawal</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold">{settings.referral_bonus_referrer}</div>
              <div className="text-xs text-muted-foreground">Referral Bonus</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
