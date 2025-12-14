import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/user.service';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2, Bell, CheckCircle } from 'lucide-react';

export function NotificationsModal({ isOpen, onClose }) {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    notificationsEnabled: true,
    rememberMeEnabled: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen]);

  const loadPreferences = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const userPrefs = await userService.getUserPreferences(token);
      setPreferences({
        notificationsEnabled: userPrefs.notificationsEnabled ?? true,
        rememberMeEnabled: userPrefs.rememberMeEnabled ?? false,
      });
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      await userService.updateUserPreferences(preferences, token);
      setSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    if (error) setError('');
  };

  const handleClose = () => {
    if (!isSaving) {
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Manage your notification preferences and account settings.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <h3 className="font-medium text-green-700">Settings Saved!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your preferences have been updated successfully.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading preferences...</span>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your goals and activities
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={preferences.notificationsEnabled}
                      onCheckedChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="remember-me">Remember Me</Label>
                      <p className="text-sm text-muted-foreground">
                        Stay logged in for longer periods
                      </p>
                    </div>
                    <Switch
                      id="remember-me"
                      checked={preferences.rememberMeEnabled}
                      onCheckedChange={(checked) => handlePreferenceChange('rememberMeEnabled', checked)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}