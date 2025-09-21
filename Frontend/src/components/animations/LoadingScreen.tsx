import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, duration = 2500 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [onComplete, duration]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center z-50 animate-fadeOut">
        <div className="text-center">
          {/* Removed spinning circle */}
          <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Logo" className="mx-auto mb-6 animate-slideUp" style={{ height: 180 }} />
          <div className="w-48 mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8 relative">
            <div className="animate-loadingbar h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
          </div>
          <p className="text-gray-600 dark:text-blue-100 animate-slideUp animation-delay-200">Loading your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center z-50">
      <div className="text-center">
  {/* Removed spinning circle */}
        <img src={process.env.PUBLIC_URL + '/logo192.png'} alt="Logo" className="mx-auto mb-6 animate-slideUp" style={{ height: 180 }} />
        <div className="w-48 mx-auto h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8 relative">
          <div className="animate-loadingbar h-full bg-primary rounded-full" style={{ width: '40%' }}></div>
        </div>
        <p className="text-gray-600 dark:text-blue-100 animate-slideUp animation-delay-200">Loading your experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;