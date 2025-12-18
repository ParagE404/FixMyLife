import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { NotificationsModal } from '../components/profile/NotificationsModal';
import { PrivacyModal } from '../components/profile/PrivacyModal';
import { 
  User, 
  Mail, 
  Settings, 
  Lock, 
  Bell, 
  Info, 
  LogOut,
  ChevronRight,
  Loader2,
  Shield,
  Smartphone
} from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login');
  };

  const settingsItems = [
    { icon: User, label: 'Edit Profile', description: 'Update your personal information', modal: 'editProfile' },
    { icon: Lock, label: 'Change Password', description: 'Update your account security', modal: 'changePassword' },
    { icon: Bell, label: 'Notifications', description: 'Manage your notification preferences', modal: 'notifications' },
    { icon: Shield, label: 'Privacy', description: 'Control your data and privacy settings', modal: 'privacy' },
  ];

  const openModal = (modalType) => {
    setActiveModal(modalType);
  };

  const handleItemClick = (item) => {
    if (item.action === 'navigate') {
      navigate(item.path);
    } else if (item.modal) {
      openModal(item.modal);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-30">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="glass card-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent/20">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              Profile
            </CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Profile Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{user?.name || 'User'}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email || 'No email provided'}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Mobile
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Manage your account preferences and security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {settingsItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                    <div className="text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              About
            </CardTitle>
            <CardDescription>
              Application information and version details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Version</p>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">App Name</p>
                <Badge variant="outline">Fix My Life</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-center text-sm text-muted-foreground">
              Built with ❤️ for better habit tracking
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <EditProfileModal 
        isOpen={activeModal === 'editProfile'} 
        onClose={closeModal} 
      />
      <ChangePasswordModal 
        isOpen={activeModal === 'changePassword'} 
        onClose={closeModal} 
      />
      <NotificationsModal 
        isOpen={activeModal === 'notifications'} 
        onClose={closeModal} 
      />
      <PrivacyModal 
        isOpen={activeModal === 'privacy'} 
        onClose={closeModal} 
      />
    </div>
  );
}
