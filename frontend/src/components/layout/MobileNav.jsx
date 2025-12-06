import { useLocation, useNavigate } from 'react-router-dom';

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/activities', label: 'Activities', icon: '📝' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 md:hidden">
      <div className="grid grid-cols-3 gap-0">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
