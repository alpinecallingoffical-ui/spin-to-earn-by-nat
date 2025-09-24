import React, { useState, useRef, useEffect } from 'react';

interface SwipeableContentProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableContent: React.FC<SwipeableContentProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = ''
}) => {
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwipeActive) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = Math.abs(currentY - startY);

    // Only allow horizontal swipes (not vertical scrolling)
    if (diffY < 50) {
      setDeltaX(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipeActive) return;

    const threshold = 100; // Minimum swipe distance
    
    if (Math.abs(deltaX) > threshold) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }

      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setDeltaX(0);
    setIsSwipeActive(false);
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startX, startY, deltaX, isSwipeActive]);

  return (
    <div
      ref={elementRef}
      className={`relative transition-transform duration-200 ${className}`}
      style={{
        transform: isSwipeActive ? `translateX(${deltaX * 0.3}px)` : 'translateX(0)',
      }}
    >
      {/* Swipe indicators */}
      {isSwipeActive && Math.abs(deltaX) > 50 && (
        <>
          {deltaX > 0 && onSwipeRight && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 text-2xl animate-bounce z-10">
              ➡️
            </div>
          )}
          {deltaX < 0 && onSwipeLeft && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 text-2xl animate-bounce z-10">
              ⬅️
            </div>
          )}
        </>
      )}
      
      {children}
    </div>
  );
};