import React from 'react';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 600, 
  direction = 'up',
  className = '' 
}) => {
  const getAnimationClass = () => {
    switch (direction) {
      case 'up':
        return 'animate-slideUpFade';
      case 'down':
        return 'animate-slideDownFade';
      case 'left':
        return 'animate-slideLeftFade';
      case 'right':
        return 'animate-slideRightFade';
      default:
        return 'animate-fadeIn';
    }
  };

  return (
    <div 
      className={`${getAnimationClass()} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;