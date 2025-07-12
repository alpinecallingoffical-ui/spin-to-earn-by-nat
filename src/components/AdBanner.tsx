import { useEffect } from 'react';

export const AdBanner = () => {
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Create and append the script
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//pl26764757.profitableratecpm.com/4d9960b6efb23f4e467d89dff8789907/invoke.js';
      
      // Append to document body instead of head for better compatibility
      document.body.appendChild(script);
      
      // Log for debugging
      console.log('Adsterra script loaded');
    }, 1000);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div className="text-center text-white/60 text-sm mb-2">Advertisement</div>
      <div 
        id="container-4d9960b6efb23f4e467d89dff8789907"
        className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 min-h-[120px] flex items-center justify-center"
        style={{ minHeight: '120px' }}
      >
        <div className="text-white/40 text-sm">Loading advertisement...</div>
      </div>
    </div>
  );
};