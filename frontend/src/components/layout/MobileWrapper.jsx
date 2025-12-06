import { useEffect, useState } from 'react';

export function MobileWrapper({ children }) {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile === null) return null;

  if (!isMobile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">📱 Mobile Only</h1>
          <p className="text-text-secondary mb-4">
            This app is optimized for mobile devices. Please open on your phone.
          </p>
          <p className="text-sm text-text-secondary/70">
            You can open your browser's developer tools and enable mobile view to test.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
