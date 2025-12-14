import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { activityService } from '../../services/activity.service';
import { toast } from '../ui/toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  Clock, 
  Coffee, 
  Briefcase, 
  Dumbbell, 
  Book,
  Users,
  Home,
  Car,
  Utensils,
  CheckCircle
} from 'lucide-react';

const activityTemplates = {
  'Morning Routine': {
    icon: Coffee,
    color: 'bg-orange-100 text-orange-600',
    activities: [
      { description: 'Wake up and morning hygiene', category: 'Personal Care', duration: 20 },
      { description: 'Breakfast', category: 'Physical Health', duration: 25 },
      { description: 'Coffee and news', category: 'Personal Growth', duration: 15 },
      { description: 'Plan the day', category: 'Personal Growth', duration: 10 }
    ]
  },
  'Work Day': {
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-600',
    activities: [
      { description: 'Check emails', category: 'Career & Finances', duration: 15 },
      { description: 'Team standup meeting', category: 'Career & Finances', duration: 30 },
      { description: 'Deep work session', category: 'Career & Finances', duration: 120 },
      { description: 'Lunch break', category: 'Physical Health', duration: 45 },
      { description: 'Afternoon work session', category: 'Career & Finances', duration: 90 }
    ]
  },
  'Workout Session': {
    icon: Dumbbell,
    color: 'bg-green-100 text-green-600',
    activities: [
      { description: 'Warm up', category: 'Physical Health', duration: 10 },
      { description: 'Strength training', category: 'Physical Health', duration: 45 },
      { description: 'Cool down and stretching', category: 'Physical Health', duration: 15 }
    ]
  },
  'Study Session': {
    icon: Book,
    color: 'bg-purple-100 text-purple-600',
    activities: [
      { description: 'Review notes', category: 'Personal Growth', duration: 20 },
      { description: 'Focused study', category: 'Personal Growth', duration: 90 },
      { description: 'Practice exercises', category: 'Personal Growth', duration: 30 }
    ]
  },
  'Family Time': {
    icon: Users,
    color: 'bg-pink-100 text-pink-600',
    activities: [
      { description: 'Family dinner', category: 'Relationships', duration: 60 },
      { description: 'Quality time together', category: 'Relationships', duration: 90 },
      { description: 'Bedtime routine with kids', category: 'Relationships', duration: 30 }
    ]
  },
  'Evening Routine': {
    icon: Home,
    color: 'bg-indigo-100 text-indigo-600',
    activities: [
      { description: 'Dinner preparation', category: 'Physical Health', duration: 30 },
      { description: 'Dinner', category: 'Physical Health', duration: 45 },
      { description: 'Relaxation time', category: 'Personal Growth', duration: 60 },
      { description: 'Evening hygiene', category: 'Personal Care', duration: 20 }
    ]
  }
};

export function ActivityTemplates({ onTemplateSelected }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const handleTemplateClick = async (templateName, template) => {
    setSelectedTemplate(templateName);
    setIsLoading(true);
    
    try {
      // Create activities with current time as end time and calculate start times
      const now = new Date();
      let currentTime = new Date(now);
      
      const activities = template.activities.map((activity, index) => {
        const endTime = new Date(currentTime);
        const startTime = new Date(currentTime.getTime() - (activity.duration * 60000));
        currentTime = startTime; // Next activity ends when this one starts
        
        return {
          ...activity,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        };
      }).reverse(); // Reverse to get chronological order

      // Create a natural language description for all activities
      const descriptions = activities.map(activity => 
        `${activity.description} from ${new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} to ${new Date(activity.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
      );
      
      const fullDescription = descriptions.join(', ');
      
      const result = await activityService.parseActivities(fullDescription, token);
      
      if (onTemplateSelected && result.activities) {
        onTemplateSelected(result.activities);
      }
      toast.success(`Added ${templateName} activities!`);
    } catch (error) {
      console.error('Failed to create template activities:', error);
      toast.error('Failed to add template activities. Please try again.');
    } finally {
      setIsLoading(false);
      // Reset selection after a brief moment
      setTimeout(() => setSelectedTemplate(null), 1000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Activity Templates
        </CardTitle>
        <CardDescription>
          Quick templates for common activity sequences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(activityTemplates).map(([templateName, template]) => {
            const IconComponent = template.icon;
            const isSelected = selectedTemplate === templateName;
            
            return (
              <Button
                key={templateName}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-3 hover:bg-primary/5 transition-all ${
                  isSelected ? 'bg-green-50 border-green-200' : ''
                }`}
                onClick={() => handleTemplateClick(templateName, template)}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`p-2 rounded-lg ${template.color}`}>
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <IconComponent className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{templateName}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.activities.length} activities
                    </div>
                  </div>
                </div>
                
                <div className="w-full space-y-1">
                  {template.activities.slice(0, 2).map((activity, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="truncate">{activity.description}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {activity.duration}m
                      </Badge>
                    </div>
                  ))}
                  {template.activities.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{template.activities.length - 2} more activities
                    </div>
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}