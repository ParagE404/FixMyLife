import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { activityService } from '../../services/activity.service';
import { ActivityTemplates } from './ActivityTemplates';
import { toast } from '../ui/toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Clock, 
  Coffee, 
  Dumbbell, 
  Briefcase, 
  Book, 
  Utensils,
  Car,
  Gamepad2,
  Heart,
  Plus,
  Zap,
  CheckCircle
} from 'lucide-react';

const quickActivities = [
  { icon: Coffee, label: 'Morning Coffee', category: 'Personal Care', duration: 15 },
  { icon: Briefcase, label: 'Work Session', category: 'Career & Finances', duration: 120 },
  { icon: Dumbbell, label: 'Workout', category: 'Physical Health', duration: 60 },
  { icon: Utensils, label: 'Meal', category: 'Physical Health', duration: 30 },
  { icon: Book, label: 'Reading', category: 'Personal Growth', duration: 45 },
  { icon: Car, label: 'Commute', category: 'Transportation', duration: 30 },
  { icon: Gamepad2, label: 'Entertainment', category: 'Personal Growth', duration: 60 },
  { icon: Heart, label: 'Family Time', category: 'Relationships', duration: 90 },
];

export function QuickActivityEntry({ onActivityCreated }) {
  const [customActivity, setCustomActivity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const { token } = useAuthStore();

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      const response = await activityService.getActivities({ 
        limit: 5, 
        orderBy: 'createdAt',
        order: 'desc' 
      }, token);
      setRecentActivities(response.activities || []);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
    }
  };

  const handleQuickActivity = async (activity) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (activity.duration * 60000));
      
      // Create a natural language description for the API
      const description = `${activity.label} from ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      
      const result = await activityService.parseActivities(description, token);
      
      if (onActivityCreated && result.activities) {
        onActivityCreated(result.activities);
      }
      
      // Reload recent activities to include the new one
      loadRecentActivities();
      toast.success(`Added ${activity.label}!`);
    } catch (error) {
      console.error('Failed to create quick activity:', error);
      toast.error('Failed to add activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomActivity = async (e) => {
    e.preventDefault();
    if (!customActivity.trim()) return;

    setIsLoading(true);
    try {
      const result = await activityService.parseActivities(customActivity, token);
      
      if (onActivityCreated) {
        onActivityCreated(result.activities || []);
      }
      setCustomActivity('');
      toast.success('Activity added successfully!');
    } catch (error) {
      console.error('Failed to create custom activity:', error);
      toast.error('Failed to add activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentActivity = async (activity) => {
    setIsLoading(true);
    try {
      const now = new Date();
      const duration = activity.duration || 30;
      const startTime = new Date(now.getTime() - (duration * 60000));
      
      // Create a natural language description for the API
      const description = `${activity.description} from ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      
      const result = await activityService.parseActivities(description, token);
      
      if (onActivityCreated && result.activities) {
        onActivityCreated(result.activities);
      }
      
      // Reload recent activities
      loadRecentActivities();
      toast.success(`Repeated ${activity.description}!`);
    } catch (error) {
      console.error('Failed to repeat activity:', error);
      toast.error('Failed to repeat activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Templates */}
      <ActivityTemplates onTemplateSelected={onActivityCreated} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Entry
          </CardTitle>
          <CardDescription>
            Tap to instantly log common activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActivities.map((activity, index) => {
              const IconComponent = activity.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5"
                  onClick={() => handleQuickActivity(activity)}
                  disabled={isLoading}
                >
                  <IconComponent className="w-6 h-6 text-primary" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{activity.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.duration}min
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Quickly repeat recent activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivities.slice(0, 3).map((activity, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleRecentActivity(activity)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {activity.category?.name || activity.category}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Repeat
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Quick Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Custom Entry
          </CardTitle>
          <CardDescription>
            Quickly describe what you just did
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCustomActivity} className="space-y-3">
            <Input
              value={customActivity}
              onChange={(e) => setCustomActivity(e.target.value)}
              placeholder="e.g., 'Just finished a 30min workout' or 'Had lunch for 20 minutes'"
              className="w-full"
            />
            <Button
              type="submit"
              disabled={isLoading || !customActivity.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}