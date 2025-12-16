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
  MoreHorizontal,
  X
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
    { path: '/patterns', label: 'Patterns', icon: Brain },
    { path: '/alerts', label: 'Alerts', icon: Bell },
  ];

  const isActive = (path) => location.pathname === path;
  const isMoreActive = moreNavItems.some(item => isActive(item.path));

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setShowMoreMenu(false)}>
          <Card className="fixed bottom-20 left-4 right-4 border-0 shadow-xl glass card-elevated">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">More Options</h3>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moreNavItems.map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setShowMoreMenu(false);
                      }}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'text-gray-700 hover:text-green-600 hover:bg-green-50 border border-gray-200'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
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
            className={`flex flex-col items-center gap-1 py-3 px-1 rounded-lg transition-all duration-200 ${
              isMoreActive
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'scale-110' : ''} transition-transform`} />
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
