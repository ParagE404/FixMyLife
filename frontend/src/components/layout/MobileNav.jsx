import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  BarChart3, 
  PenTool, 
  Target, 
  User,
  Home,
  History
} from 'lucide-react';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/activities', label: 'Log', icon: PenTool },
    { path: '/history', label: 'History', icon: History },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Card className="fixed bottom-4 left-4 right-4 md:hidden border-0 shadow-xl glass card-elevated">
      <div className="grid grid-cols-5 gap-1 p-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${active ? 'scale-110' : ''} transition-transform`} />
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="w-1 h-1 bg-primary-foreground rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
