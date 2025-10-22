import React from 'react';
import { useEquippedItems } from '@/hooks/useEquippedItems';
import { Crown, Sparkles } from 'lucide-react';
interface AvatarDisplayProps {
  profilePictureUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  profilePictureUrl,
  size = 'md',
  className = ''
}) => {
  const {
    equippedAvatar,
    equippedDecoration
  } = useEquippedItems();
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };
  const decorationSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };
  const getAvatarDecoration = () => {
    if (!equippedAvatar?.item_data?.decoration) return null;
    const decoration = equippedAvatar.item_data.decoration;
    const iconClass = `${decorationSize[size]} absolute -top-1 -right-1`;
    switch (decoration) {
      case 'crown':
        return <Crown className={`${iconClass} text-yellow-500`} />;
      case 'sunglasses':
        return <span className={`${iconClass} text-xl`}>🕶️</span>;
      case 'halo':
        return <span className={`${iconClass} text-xl`}>😇</span>;
      default:
        return null;
    }
  };
  const getDecorationEffect = () => {
    if (!equippedDecoration?.item_data?.effect) return '';
    const effect = equippedDecoration.item_data.effect;
    switch (effect) {
      case 'sparkle':
        return 'animate-pulse';
      case 'rainbow_border':
        return 'border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 bg-clip-border animate-spin';
      default:
        return '';
    }
  };
  return <div className={`relative ${className}`}>
      
    </div>;
};