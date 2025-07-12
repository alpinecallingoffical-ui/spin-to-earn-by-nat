import { useEffect } from 'react';

export const AdBanner = () => {
  useEffect(() => {
    // Create and append the script
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = '//pl26764757.profitableratecpm.com/4d9960b6efb23f4e467d89dff8789907/invoke.js';
    
    // Append to head
    document.head.appendChild(script);
    
    // Cleanup function
    return () => {
      // Remove script when component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto my-6">
      <div 
        id="container-4d9960b6efb23f4e467d89dff8789907"
        className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
      />
    </div>
  );
};