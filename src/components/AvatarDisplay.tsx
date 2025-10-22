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
      <div className={`${sizeClasses[size]} relative`}>
        {/* Rainbow border decoration */}
        {equippedDecoration?.item_data?.effect === 'rainbow_border' && <div className={`${sizeClasses[size]} absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 animate-spin`} style={{
        animation: 'spin 3s linear infinite'
      }} />}
        
        {/* Avatar image */}
        
        
        {/* Sparkle decoration overlay */}
        {equippedDecoration?.item_data?.effect === 'sparkle' && <div className={`${sizeClasses[size]} absolute inset-0 rounded-full`}>
            <Sparkles className={`${decorationSize[size]} absolute top-0 left-0 text-yellow-400 animate-ping`} style={{
          animationDelay: '0s'
        }} />
            <Sparkles className={`${decorationSize[size]} absolute top-1 right-0 text-blue-400 animate-ping`} style={{
          animationDelay: '0.5s'
        }} />
            <Sparkles className={`${decorationSize[size]} absolute bottom-0 left-1 text-pink-400 animate-ping`} style={{
          animationDelay: '1s'
        }} />
          </div>}
        
        {/* Avatar decoration */}
        {getAvatarDecoration()}
      </div>
    </div>;
};