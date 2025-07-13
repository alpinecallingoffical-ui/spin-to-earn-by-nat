import { useEffect, useRef } from 'react';

interface AdsterraAdProps {
  onAdClick?: () => void;
  className?: string;
}

export const AdsterraAd = ({ onAdClick, className }: AdsterraAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl26764830.profitableratecpm.com/62/0e/07/620e07d0ee0422f2a09925177a190c4b.js';
    script.async = true;
    
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onClick={onAdClick}
      className={`min-h-[120px] bg-white/5 rounded-lg p-2 cursor-pointer hover:bg-white/10 transition-colors ${className || ''}`}
    >
      <div className="text-center text-white/60 text-sm">
        Loading advertisement...
      </div>
    </div>
  );
};