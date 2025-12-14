import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { activityService } from '../../services/activity.service';
import { toast } from '../ui/toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  Sparkles
} from 'lucide-react';

export function SmartSuggestions({ onActivitySelected }) {
  const [suggestions, setSuggestions] = useState([]);
  const [timeBasedSuggestions, setTimeBasedSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      // Get time-based suggestions
      const currentHour = new Date().getHours();
      const timeBasedActivities = getTimeBasedSuggestions(currentHour);
      setTimeBasedSuggestions(timeBasedActivities);

      // Get personalized suggestions (this would come from backend analysis)
      // For now, we'll use mock data
      const personalizedSuggestions = [
        {
          activity: 'Review daily goals',
          reason: 'You usually do this around this time',
          category: 'Personal Growth',
          confidence: 0.8,
          duration: 15
        },
        {
          activity: 'Take a short walk',
          reason: 'Good for productivity boost',
          category: 'Physical Health',
          confidence: 0.7,
          duration: 20
        },
        {
          activity: 'Check emails',
          reason: 'Part of your morning routine',
          category: 'Career & Finances',
          confidence: 0.9,
          duration: 30
        }
      ];
      
      setSuggestions(personalizedSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeBasedSuggestions = (hour) => {
    if (hour >= 6 && hour < 9) {
      return [
        { activity: 'Morning routine', category: 'Personal Care', duration: 30 },
        { activity: 'Breakfast', category: 'Physical Health', duration: 20 },
        { activity: 'Exercise', category: 'Physical Health', duration: 45 }
      ];
    } else if (hour >= 9 && hour < 12) {
      return [
        { activity: 'Deep work session', category: 'Career & Finances', duration: 90 },
        { activity: 'Team meeting', category: 'Career & Finances', duration: 60 },
        { activity: 'Email check', category: 'Career & Finances', duration: 15 }
      ];
    } else if (hour >= 12 && hour < 14) {
      return [
        { activity: 'Lunch break', category: 'Physical Health', duration: 45 },
        { activity: 'Short walk', category: 'Physical Health', duration: 15 },
        { activity: 'Social time', category: 'Relationships', duration: 30 }
      ];
    } else if (hour >= 14 && hour < 17) {
      return [
        { activity: 'Focused work', category: 'Career & Finances', duration: 120 },
        { activity: 'Learning session', category: 'Personal Growth', duration: 60 },
        { activity: 'Project work', category: 'Career & Finances', duration: 90 }
      ];
    } else if (hour >= 17 && hour < 20) {
      return [
        { activity: 'Workout', category: 'Physical Health', duration: 60 },
        { activity: 'Commute home', category: 'Transportation', duration: 30 },
        { activity: 'Family time', category: 'Relationships', duration: 90 }
      ];
    } else {
      return [
        { activity: 'Dinner', category: 'Physical Health', duration: 45 },
        { activity: 'Relaxation', category: 'Personal Growth', duration: 60 },
        { activity: 'Reading', category: 'Personal Growth', duration: 30 }
      ];
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setButtonLoading(true);
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - (suggestion.duration * 60000));
      
      // Create a natural language description for the API
      const description = `${suggestion.activity} from ${startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      
      const result = await activityService.parseActivities(description, token);
      
      if (onActivitySelected && result.activities) {
        onActivitySelected(result.activities);
      }
      toast.success(`Added ${suggestion.activity}!`);
    } catch (error) {
      console.error('Failed to create suggested activity:', error);
      toast.error('Failed to add suggested activity. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  const getCurrentTimeContext = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return { period: 'Morning', icon: '🌅' };
    if (hour >= 12 && hour < 17) return { period: 'Afternoon', icon: '☀️' };
    if (hour >= 17 && hour < 21) return { period: 'Evening', icon: '🌆' };
    return { period: 'Night', icon: '🌙' };
  };

  const timeContext = getCurrentTimeContext();

  return (
    <div className="space-y-4">
      {/* Time-based suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {timeContext.icon} {timeContext.period} Activities
          </CardTitle>
          <CardDescription>
            Common activities for this time of day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {timeBasedSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto p-3"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={buttonLoading}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{suggestion.activity}</div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.category} • {suggestion.duration}min
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            Based on your patterns and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3 border border-dashed border-primary/30 hover:border-primary/50"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={buttonLoading}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{suggestion.activity}</div>
                    <div className="text-xs text-muted-foreground">
                      {suggestion.reason}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                    >
                      {Math.round(suggestion.confidence * 100)}% match
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.duration}min
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}