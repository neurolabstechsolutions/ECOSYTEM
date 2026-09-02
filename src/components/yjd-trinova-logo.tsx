import React from 'react';

export function YjdTrinovaLogo({
  variant = 'full',
  size = 'md',
  className = ''
}: {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const GoldEmblem = () => (
    <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#996515" />
            <stop offset="35%" stopColor="#C5A059" />
            <stop offset="70%" stopColor="#E5C158" />
            <stop offset="100%" stopColor="#F9E498" />
          </linearGradient>
          <linearGradient id="goldGradDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#805510" />
            <stop offset="100%" stopColor="#B38728" />
          </linearGradient>
        </defs>
        {/* Outer Triangle Outline */}
        <polygon 
          points="50,6 94,84 6,84" 
          stroke="url(#goldGrad)" 
          strokeWidth="6" 
          strokeLinejoin="round" 
          fill="none" 
        />
        {/* Inner Geometric Shapes */}
        <path 
          d="M50 22 L76 72 H24 Z" 
          fill="url(#goldGradDark)" 
          opacity="0.15" 
        />
        <path 
          d="M50 26 L70 68 H58 L50 48 L42 68 H30 Z" 
          fill="url(#goldGrad)" 
        />
        <line x1="38" y1="58" x2="62" y2="58" stroke="#18181b" strokeWidth="2.5" />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return <GoldEmblem />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <GoldEmblem />
      <div className="flex flex-col">
        <div className="flex items-center gap-1 leading-none">
          <span className="font-extrabold tracking-tight text-zinc-900 text-sm font-sans">
            YJ<span className="text-amber-700">D</span>
          </span>
          <span className="font-serif font-black tracking-widest text-amber-700 text-sm">
            TRINOVA
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-medium tracking-wider">
          <span className="h-[0.5px] w-2 bg-amber-500/50"></span>
          <span className="text-zinc-600 font-semibold">S.A.S</span>
          <span className="h-[0.5px] w-2 bg-amber-500/50"></span>
          <span className="text-zinc-400 font-mono text-[8.5px]">NIT 902095222</span>
        </div>
      </div>
    </div>
  );
}
