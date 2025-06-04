
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <CheckCircle 
        className={`${sizeClasses[size]} text-blue-500 animate-pulse`}
        fill="currentColor"
      />
    </div>
  );
};
