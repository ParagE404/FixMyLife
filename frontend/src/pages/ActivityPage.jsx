import React from 'react';
import { ImprovedActivityInput } from '../components/activity/ImprovedActivityInput';
import { ActivityOnboarding } from '../components/activity/ActivityOnboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PenTool, CheckCircle, History, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ActivityPage() {
  const navigate = useNavigate();

  const handleActivitiesCreated = (activities) => {
    // Optional: Show a toast or navigate to history
    console.log('Activities created:', activities);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-30">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="glass card-elevated">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              Log Activities
            </CardTitle>
            <CardDescription>
              Multiple ways to track your activities - choose what works best for you
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              onClick={() => navigate('/history')} 
              variant="outline" 
              className="w-full"
            >
              <History className="w-4 h-4 mr-2" />
              View Activity History
            </Button>
          </CardContent>
        </Card>

        {/* Improved Activity Input */}
        <ImprovedActivityInput onActivitiesCreated={handleActivitiesCreated} />

        {/* Onboarding */}
        <ActivityOnboarding />
      </div>
    </div>
  );
}
