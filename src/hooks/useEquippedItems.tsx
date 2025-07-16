import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { useShop } from './useShop';
import { useAuth } from './useAuth';

interface EquippedItemsContextType {
  equippedTheme: any | null;
  equippedAvatar: any | null;
  equippedDecoration: any | null;
  activePowerUps: any[];
  applyTheme: (theme: any) => void;
  removePowerUp: (powerUpId: string) => void;
  addPowerUp: (powerUp: any) => void;
  hasActivePowerUp: (effect: string) => boolean;
  getPowerUpMultiplier: (baseValue: number, effect: string) => number;
}

const EquippedItemsContext = createContext<EquippedItemsContextType | undefined>(undefined);

export const EquippedItemsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { userInventory, loading } = useShop();
  const [equippedTheme, setEquippedTheme] = useState<any | null>(null);
  const [equippedAvatar, setEquippedAvatar] = useState<any | null>(null);
  const [equippedDecoration, setEquippedDecoration] = useState<any | null>(null);
  const [activePowerUps, setActivePowerUps] = useState<any[]>([]);

  // Update equipped items when inventory changes
  useEffect(() => {
    if (!loading && userInventory.length > 0) {
      const equippedItems = userInventory.filter(item => item.is_equipped);
      
      // Find equipped theme
      const theme = equippedItems.find(item => item.shop_items.item_type === 'theme');
      setEquippedTheme(theme?.shop_items || null);
      
      // Find equipped avatar
      const avatar = equippedItems.find(item => item.shop_items.item_type === 'avatar');
      setEquippedAvatar(avatar?.shop_items || null);
      
      // Find equipped decoration
      const decoration = equippedItems.find(item => item.shop_items.item_type === 'decoration');
      setEquippedDecoration(decoration?.shop_items || null);
    }
  }, [userInventory, loading]);

  // Apply theme colors to CSS variables
  const applyTheme = (theme: any) => {
    if (!theme || !theme.item_data?.colors) return;
    
    const { colors } = theme.item_data;
    const root = document.documentElement;
    
    // Apply primary color
    if (colors.primary) {
      const hsl = hexToHsl(colors.primary);
      root.style.setProperty('--primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty('--primary-foreground', '0 0% 98%');
    }
    
    // Apply secondary color
    if (colors.secondary) {
      const hsl = hexToHsl(colors.secondary);
      root.style.setProperty('--accent', `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty('--accent-foreground', '0 0% 98%');
    }
  };

  // Apply theme when it changes
  useEffect(() => {
    if (equippedTheme) {
      applyTheme(equippedTheme);
    } else {
      // Reset to default theme
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--accent-foreground');
    }
  }, [equippedTheme]);

  // Power-up management
  const addPowerUp = (powerUp: any) => {
    const effect = powerUp.item_data?.effect;
    const duration = powerUp.item_data?.duration;
    
    if (!effect) return;
    
    const newPowerUp = {
      ...powerUp,
      id: `${powerUp.id}_${Date.now()}`,
      activatedAt: Date.now(),
      expiresAt: duration ? Date.now() + (duration * 1000) : null
    };
    
    setActivePowerUps(prev => [...prev, newPowerUp]);
    
    // Auto-remove after duration
    if (duration) {
      setTimeout(() => {
        removePowerUp(newPowerUp.id);
      }, duration * 1000);
    }
  };

  const removePowerUp = (powerUpId: string) => {
    setActivePowerUps(prev => prev.filter(p => p.id !== powerUpId));
  };

  const hasActivePowerUp = (effect: string) => {
    return activePowerUps.some(powerUp => 
      powerUp.item_data?.effect === effect && 
      (!powerUp.expiresAt || powerUp.expiresAt > Date.now())
    );
  };

  const getPowerUpMultiplier = (baseValue: number, effect: string) => {
    if (!hasActivePowerUp(effect)) return baseValue;
    
    switch (effect) {
      case 'double_coins':
        return baseValue * 2;
      case 'lucky_multiplier':
        return baseValue * 10;
      default:
        return baseValue;
    }
  };

  // Clean up expired power-ups
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePowerUps(prev => 
        prev.filter(powerUp => !powerUp.expiresAt || powerUp.expiresAt > Date.now())
      );
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <EquippedItemsContext.Provider value={{
      equippedTheme,
      equippedAvatar,
      equippedDecoration,
      activePowerUps,
      applyTheme,
      removePowerUp,
      addPowerUp,
      hasActivePowerUp,
      getPowerUpMultiplier
    }}>
      {children}
    </EquippedItemsContext.Provider>
  );
};

export const useEquippedItems = () => {
  const context = useContext(EquippedItemsContext);
  if (context === undefined) {
    throw new Error('useEquippedItems must be used within an EquippedItemsProvider');
  }
  return context;
};

// Utility function to convert hex to HSL
const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  const l = sum / 2;

  let h = 0;
  let s = 0;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;

    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};