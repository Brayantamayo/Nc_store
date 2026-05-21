//El icono de moñito
import React from 'react';

interface BowProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export const Bow: React.FC<BowProps> = ({ className, size = 24, color = 'currentColor', opacity }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={opacity !== undefined ? { opacity } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 12c-4-5-9-4-9 0 0 4 5 5 9 0Z" />
      <path d="M12 12c4-5 9-4 9 0 0 4 -5 5 -9 0Z" />
      <path d="M12 11.5c-0.5 0-1 0.5-1 1s0.5 1 1 1 1-0.5 1-1-0.5-1-1-1z" fill={color} />
      <path d="M11.5 12.5c-1 3-3 5-6 6" />
      <path d="M12.5 12.5c1 3 3 5 6 6" />
    </svg>
  );
};

export const CoquetteUserIcon: React.FC<BowProps> = ({ className, size = 24, color = 'currentColor', opacity }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      style={opacity !== undefined ? { opacity } : undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cuerpo / Hombros */}
      <path 
        d="M4 20c0-3.5 2.5-6 6-6.5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      <path 
        d="M20 20c0-3.5-2.5-6-6-6.5" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
      />
      {/* Cabeza */}
      <circle 
        cx="12" 
        cy="8" 
        r="3.5" 
        stroke={color} 
        strokeWidth="1.5" 
      />
      {/* Chonguito / Moño de cabello arriba a la derecha */}
      <circle 
        cx="15" 
        cy="5" 
        r="1.8" 
        stroke={color} 
        strokeWidth="1.2" 
        fill="none"
      />
      {/* Detalle flequillo / peinado */}
      <path 
        d="M9.5 6.8c1-1 2.5-1 3.5 0" 
        stroke={color} 
        strokeWidth="1" 
        strokeLinecap="round" 
      />
      {/* Corazón en el pecho */}
      <path 
        d="M12 18.2c-.2 0-.3-.1-.4-.2-1-1-2.2-2.3-2.2-3.3 0-.8.6-1.5 1.4-1.5.5 0 .9.3 1.2.7.3-.4.7-.7 1.2-.7.8 0 1.4.7 1.4 1.5 0 1-1.2 2.3-2.2 3.3-.1.1-.2.2-.4.2z" 
        fill="none" 
        stroke="var(--color-primary, #c2185b)" 
        strokeWidth="1.3" 
        strokeLinecap="round"
        strokeLinejoin="round" 
      />
    </svg>
  );
};

