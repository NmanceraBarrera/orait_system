'use client';

import Image from 'next/image';
import logoImage from '@/app/assets/logo.png';

interface OraitLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function OraitLogo({ className = '', size = 'medium' }: OraitLogoProps) {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <Image
        src={logoImage}
        alt="ORAIT APP Logo"
        width={200}
        height={80}
        className="h-full w-auto object-contain invert dark:invert-0"
        priority
      />
    </div>
  );
}
