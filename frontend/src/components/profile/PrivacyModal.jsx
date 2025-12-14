import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Shield, Eye, Database, Trash2, Download, AlertTriangle } from 'lucide-react';
import { Separator } from '../ui/separator';

export function PrivacyModal({ isOpen, onClose }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExportData = () => {
    // This would typically trigger a data export
    alert('Data export functionality would be implemented here. This would generate a downloadable file with all your data.');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    // This would typically trigger account deletion
    alert('Account deletion functionality would be implemented here. This would permanently delete your account and all associated data.');
    setShowDeleteConfirm(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto modal-content">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data
          </DialogTitle>
          <DialogDescription>
            Control your data and privacy settings. Learn how we protect your information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5" />
                Data We Collect
              </CardTitle>
              <CardDescription>
                Information we store to provide you with the best experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Account Information</h4>
                <p className="text-sm text-muted-foreground">
                  Your name, email address, and account preferences
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Activity Data</h4>
                <p className="text-sm text-muted-foreground">
                  Your goals, activities, progress tracking, and habit data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Usage Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  App usage patterns to improve our service (anonymized)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="w-5 h-5" />
                How We Use Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium">Personalization</h4>
                <p className="text-sm text-muted-foreground">
                  To provide personalized recommendations and insights
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Progress Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  To track your goals and show your progress over time
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Service Improvement</h4>
                <p className="text-sm text-muted-foreground">
                  To improve our app features and user experience
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Data Rights</CardTitle>
              <CardDescription>
                You have full control over your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in a portable format
                  </p>
                </div>
                <Button onClick={handleExportData} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-destructive">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button onClick={handleDeleteAccount} variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Encryption</h4>
                  <p className="text-sm text-muted-foreground">
                    All data is encrypted in transit and at rest
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Secure Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    Data is stored on secure, monitored servers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Access Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Strict access controls and regular security audits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and all associated data.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteAccount}
                  className="flex-1"
                >
                  Delete Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}