import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card } from '../ui/card';
import { 
  BarChart3, 
  PenTool, 
  Target, 
  User,
  Brain,
  Bell,
  Settings,
  MoreHorizontal,
  X,
  Sparkles,
  ChevronUp
} from 'lucide-react';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainNavItems = [
    { path: '/dashboard', label: 'Home', icon: BarChart3 },
    { path: '/activities', label: 'Log', icon: PenTool },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const moreNavItems = [
    { 
      path: '/patterns', 
      label: 'Patterns', 
      icon: Brain,
      description: 'Discover your habits'
    },
    { 
      path: '/alerts', 
      label: 'Alerts', 
      icon: Bell,
      description: 'Habit risk predictions'
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'App preferences & account'
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isMoreActive = moreNavItems.some(item => isActive(item.path));

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden animate-in fade-in duration-200" 
          onClick={() => setShowMoreMenu(false)}
        >
          <div className="fixed bottom-20 left-4 right-4 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/95 overflow-hidden">
              {/* Header */}
              <div className="bg-green-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">More Features</h3>
                      <p className="text-xs text-green-100">Advanced insights & alerts</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-3">
                {moreNavItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setShowMoreMenu(false);
                      }}
                      className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                        active
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md text-gray-700'
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      <div className="flex items-center p-4">
                        {/* Icon Container */}
                        <div className={`relative p-3 rounded-xl mr-4 transition-all duration-300 ${
                          active 
                            ? 'bg-white/20 backdrop-blur-sm text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                        }`}>
                          <IconComponent className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-left">
                          <h4 className={`font-semibold text-base ${
                            active ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.label}
                          </h4>
                          <p className={`text-sm ${
                            active ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            {item.description}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className={`transition-transform duration-300 group-hover:translate-x-1 ${
                          active ? 'text-white' : 'text-gray-400'
                        }`}>
                          <ChevronUp className="w-5 h-5 rotate-90" />
                        </div>
                      </div>

                      {/* Active indicator */}
                      {active && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-white rounded-r-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <div className="text-center">
                  <button
                    onClick={() => setShowMoreMenu(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Tap outside to close
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <Card className="fixed bottom-4 left-4 right-4 md:hidden border-0 shadow-xl glass card-elevated">
        <div className="grid grid-cols-5 gap-1 p-2">
          {mainNavItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-xs font-medium ${active ? 'font-semibold' : ''} text-center leading-tight`}>
                  {item.label}
                </span>
                {active && (
                  <div className="w-1 h-1 bg-primary-foreground rounded-full mt-0.5" />
                )}
              </button>
            );
          })}
          
          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`relative flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all duration-200 ${
              isMoreActive
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <div className="relative">
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'scale-110' : ''} transition-transform`} />
              {/* Notification dot for active state */}
              {isMoreActive && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
            <span className={`text-xs font-medium ${isMoreActive ? 'font-semibold' : ''} text-center leading-tight`}>
              More
            </span>
            {isMoreActive && (
              <div className="w-1 h-1 bg-primary-foreground rounded-full mt-0.5" />
            )}
          </button>
        </div>
      </Card>
    </>
  );
}
