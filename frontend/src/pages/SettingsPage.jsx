import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusAreasSettings } from '../components/settings/FocusAreasSettings';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/user.service';
import { ArrowLeft, Target, Bell, Palette, Shield, Info } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('focus-areas');
  const navigate = useNavigate();

  const tabs = [
    { id: 'focus-areas', label: 'Focus Areas', icon: Target, description: 'Manage your tracking categories' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Control your alerts and reminders' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Customize your app theme' },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield, description: 'Manage your data and privacy' },
    { id: 'about', label: 'About', icon: Info, description: 'App information and support' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'focus-areas':
        return <FocusAreasSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'about':
        return <AboutSettings />;
      default:
        return <FocusAreasSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-30">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button
            onClick={() => navigate(-1)}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Mobile Tab Navigation - Improved for mobile */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <div className="flex px-2 space-x-1 min-w-max">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors min-w-[80px] ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content - Better mobile spacing */}
      <div className="max-w-6xl mx-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    dailyReminders: true,
    weeklyReports: true,
    goalAchievements: true,
    streakAlerts: false,
    emailNotifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await userService.getUserPreferences(token);
      setSettings({
        notificationsEnabled: preferences.notificationsEnabled,
        dailyReminders: preferences.dailyReminders,
        weeklyReports: preferences.weeklyReports,
        goalAchievements: preferences.goalAchievements,
        streakAlerts: preferences.streakAlerts,
        emailNotifications: preferences.emailNotifications,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    try {
      setSaving(true);
      await userService.updateUserPreferences(newSettings, token);
      setSuccess('Notification preferences updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      // Revert the change on error
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    {
      key: 'notificationsEnabled',
      title: 'Enable Notifications',
      description: 'Master switch for all notifications',
      icon: '🔔'
    },
    {
      key: 'dailyReminders',
      title: 'Daily Reminders',
      description: 'Get reminded to log your activities',
      icon: '📅'
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Reports',
      description: 'Receive weekly progress summaries',
      icon: '📊'
    },
    {
      key: 'goalAchievements',
      title: 'Goal Achievements',
      description: 'Celebrate when you reach your goals',
      icon: '🎉'
    },
    {
      key: 'streakAlerts',
      title: 'Streak Alerts',
      description: 'Get notified about streak milestones',
      icon: '🔥'
    },
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: '📧'
    },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Notifications</h2>
        <p className="text-gray-600 text-sm">
          Choose what notifications you'd like to receive to stay motivated.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div key={option.key} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.icon}</span>
                <div>
                  <h3 className="font-medium">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={() => toggleSetting(option.key)}
                  disabled={saving}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 ${saving ? 'opacity-50' : ''}`}></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Appearance Settings Component
function AppearanceSettings() {
  const [theme, setTheme] = useState('system');
  const [accentColor, setAccentColor] = useState('green');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await userService.getUserPreferences(token);
      setTheme(preferences.theme || 'system');
      setAccentColor(preferences.accentColor || 'green');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateAppearance = async (newTheme, newAccentColor) => {
    try {
      setSaving(true);
      await userService.updateUserPreferences({
        theme: newTheme,
        accentColor: newAccentColor,
      }, token);
      setSuccess('Appearance updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    await updateAppearance(newTheme, accentColor);
  };

  const handleColorChange = async (newColor) => {
    setAccentColor(newColor);
    await updateAppearance(theme, newColor);
  };

  const themes = [
    { id: 'light', name: 'Light', icon: '☀️' },
    { id: 'dark', name: 'Dark', icon: '🌙' },
    { id: 'system', name: 'System', icon: '💻' },
  ];

  const colors = [
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Appearance</h2>
        <p className="text-gray-600 text-sm">
          Customize how the app looks and feels.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Theme Selection */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium mb-3">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              disabled={saving}
              className={`p-3 rounded-lg border-2 transition-colors ${
                theme === themeOption.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <div className="text-2xl mb-1">{themeOption.icon}</div>
              <div className="text-sm font-medium">{themeOption.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium mb-3">Accent Color</h3>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((colorOption) => (
            <button
              key={colorOption.id}
              onClick={() => handleColorChange(colorOption.id)}
              disabled={saving}
              className={`p-3 rounded-lg border-2 transition-colors ${
                accentColor === colorOption.id
                  ? 'border-gray-800'
                  : 'border-gray-200'
              } ${saving ? 'opacity-50' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full ${colorOption.color} mx-auto mb-1`}></div>
              <div className="text-xs font-medium">{colorOption.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleExportData = async () => {
    try {
      setLoading(true);
      const data = await userService.exportUserData(token);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      await userService.clearUserData(token);
      setSuccess('All data cleared successfully!');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.')) {
      return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmText !== 'DELETE') {
      return;
    }
    
    try {
      setLoading(true);
      await userService.deleteAccount(token);
      setSuccess('Account deleted successfully!');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Privacy & Data</h2>
        <p className="text-gray-600 text-sm">
          Manage your data and privacy preferences.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Data Export
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Download all your activity data in JSON format.
          </p>
          <button 
            onClick={handleExportData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-orange-600" />
            Clear All Data
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Permanently delete all your activities and goals. This cannot be undone.
          </p>
          <button 
            onClick={handleClearData}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Clearing...' : 'Clear Data'}
          </button>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium mb-2 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-red-600" />
            Delete Account
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Permanently delete your account and all associated data.
          </p>
          <button 
            onClick={handleDeleteAccount}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

// About Settings Component
function AboutSettings() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">About</h2>
        <p className="text-gray-600 text-sm">
          Information about the app and support resources.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold">Habit Tracker</h3>
            <p className="text-sm text-gray-600">Version 1.0.0</p>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Build</span>
              <span className="font-medium">2024.12.14</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform</span>
              <span className="font-medium">Web App</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium mb-3">Support & Feedback</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              📧 Contact Support
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              💡 Send Feedback
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              ⭐ Rate the App
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              📖 User Guide
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="font-medium mb-3">Legal</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              📄 Privacy Policy
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              📋 Terms of Service
            </button>
            <button className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm">
              🍪 Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}