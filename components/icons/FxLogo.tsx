import type { FC } from 'react';

interface FxLogoProps {
  size?: number;
}

export const FxLogo: FC<FxLogoProps> = ({ size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={(size * 200) / 300} 
      viewBox="0 0 300 200" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="300" height="200" fill="transparent"/>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <path d="M 100,70 L 150,70 M 100,70 L 100,150 M 100,110 L 140,110" />
        <path d="M 180,70 L 230,150 M 180,150 L 230,70" />
      </g>
    </svg>
  );
}; 