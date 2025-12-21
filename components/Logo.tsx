
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M50 0L100 25V75L50 100L0 75V25L50 0Z" fill="currentColor" className="text-brand-gold opacity-30"/>
      <path d="M50 15L85 32.5V67.5L50 85L15 67.5V32.5L50 15Z" stroke="currentColor" className="text-brand-gold" strokeWidth="5"/>
      <circle cx="50" cy="50" r="10" fill="currentColor" className="text-brand-gold"/>
    </svg>
  );
};

export default Logo;
