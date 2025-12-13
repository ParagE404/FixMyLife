import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Smartphone className="w-16 h-16 text-primary" />
                <div className="absolute -top-2 -right-2">
                  <Badge variant="default" className="text-xs">
                    Mobile Only
                  </Badge>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl">Mobile Experience Required</CardTitle>
            <CardDescription>
              This app is optimized for mobile devices and touch interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please access this app on your mobile device for the best experience.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Monitor className="w-4 h-4" />
                <span>Desktop not supported</span>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>For testing:</strong> Open browser developer tools and enable mobile device simulation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
