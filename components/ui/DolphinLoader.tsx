'use client';

interface DolphinLoaderProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function DolphinLoader({ fullScreen = false, size = 'medium' }: DolphinLoaderProps) {
  const sizeClasses = {
    small: 'h-32 w-48',
    medium: 'h-64 w-full max-w-md',
    large: 'h-96 w-full max-w-2xl',
  };

  const dolphinSizes = {
    small: { width: 50, height: 40 },
    medium: { width: 80, height: 60 },
    large: { width: 120, height: 90 },
  };

  const dolphinSize = dolphinSizes[size];

  const containerClass = fullScreen
    ? 'flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Olas de fondo */}
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
          <svg
            className="absolute bottom-0 h-full w-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 Q300,40 600,60 T1200,60 L1200,120 L0,120 Z"
              fill="rgba(59, 130, 246, 0.3)"
              className="animate-wave"
            />
            <path
              d="M0,80 Q300,60 600,80 T1200,80 L1200,120 L0,120 Z"
              fill="rgba(59, 130, 246, 0.2)"
              className="animate-wave-delayed"
            />
          </svg>
        </div>

        {/* Delfín 1 (más pequeño, como en el logo) */}
        <div className="absolute left-[15%] top-1/2 -translate-y-1/2">
          <svg
            width={dolphinSize.width * 0.7}
            height={dolphinSize.height * 0.7}
            viewBox="0 0 120 80"
            className="animate-dolphin-jump-1"
          >
            {/* Delfín estilizado saltando hacia la derecha - estilo logo */}
            <path
              d="M20,50 Q25,35 35,40 Q50,35 65,40 Q80,35 95,40 Q105,35 110,40 Q115,45 110,50 Q105,55 95,50 Q80,55 65,50 Q50,55 35,50 Q25,55 20,50 Z"
              fill="white"
              className="dark:fill-blue-400"
            />
            {/* Aleta dorsal */}
            <path
              d="M60,35 Q65,20 70,35"
              fill="white"
              stroke="none"
              className="dark:fill-blue-400"
            />
            {/* Cola */}
            <path
              d="M100,45 Q110,40 115,45 Q110,50 100,45"
              fill="white"
              className="dark:fill-blue-400"
            />
          </svg>
        </div>

        {/* Delfín 2 (más grande, como en el logo) */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2">
          <svg
            width={dolphinSize.width}
            height={dolphinSize.height}
            viewBox="0 0 120 80"
            className="animate-dolphin-jump-2"
          >
            {/* Delfín estilizado saltando hacia la derecha - estilo logo (más grande) */}
            <path
              d="M15,50 Q20,30 30,40 Q50,30 70,40 Q90,30 105,40 Q115,30 120,40 Q125,50 120,55 Q115,60 105,55 Q90,60 70,50 Q50,60 30,50 Q20,60 15,50 Z"
              fill="white"
              className="dark:fill-blue-400"
            />
            {/* Aleta dorsal */}
            <path
              d="M65,30 Q70,15 75,30"
              fill="white"
              stroke="none"
              className="dark:fill-blue-400"
            />
            {/* Cola */}
            <path
              d="M105,45 Q115,35 120,45 Q115,55 105,45"
              fill="white"
              className="dark:fill-blue-400"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
