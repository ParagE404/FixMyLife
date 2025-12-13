import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">Profile</h1>
        </div>

        {/* Profile Info Card */}
        <div className="bg-surface rounded-xl p-6 mb-6 border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-3xl">{user?.name?.charAt(0).toUpperCase() || '👤'}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text">{user?.name || 'User'}</h2>
              <p className="text-text-secondary">{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">Account Settings</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-background transition-colors flex items-center justify-between">
              <span className="text-text">Edit Profile</span>
              <span className="text-text-secondary">→</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-background transition-colors flex items-center justify-between">
              <span className="text-text">Change Password</span>
              <span className="text-text-secondary">→</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-background transition-colors flex items-center justify-between">
              <span className="text-text">Notifications</span>
              <span className="text-text-secondary">→</span>
            </button>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border">
          <h3 className="text-lg font-semibold text-text mb-4">About</h3>
          <div className="space-y-2">
            <div className="flex justify-between p-3">
              <span className="text-text-secondary">Version</span>
              <span className="text-text">1.0.0</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="text-text-secondary">App Name</span>
              <span className="text-text">FixMyLife</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
