import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  Calendar, 
  Tag, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  MoreHorizontal
} from 'lucide-react';
import { activityService } from '../../services/activity.service';
import { useAuthStore } from '../../stores/authStore';

export function ActivityCard({ activity, onUpdate, onDelete }) {
  const { token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    description: activity.description,
    category: activity.category?.name || '',
    startTime: activity.startTime ? activity.startTime.substring(11, 16) : '',
    endTime: activity.endTime ? activity.endTime.substring(11, 16) : '',
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      await activityService.updateActivity(activity.id, {
        description: editData.description,
        category: editData.category,
        startTime: editData.startTime,
        endTime: editData.endTime,
      }, token);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Failed to update activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this activity?')) return;
    try {
      setLoading(true);
      await activityService.deleteActivity(activity.id, token);
      onDelete();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateDuration = () => {
    if (!activity.startTime || !activity.endTime) return null;
    const start = new Date(activity.startTime);
    const end = new Date(activity.endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours.toFixed(1);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
              />
            ) : (
              <CardTitle className="text-lg">{activity.description}</CardTitle>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Category */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-gray-500" />
          {isEditing ? (
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="flex-1 text-sm bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
              placeholder="Category"
            />
          ) : (
            <Badge variant="outline" className="text-xs">
              {activity.category?.name || 'Uncategorized'}
            </Badge>
          )}
        </div>

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {formatDate(activity.startTime || activity.createdAt)}
          </span>
        </div>

        {/* Time and Duration */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={editData.startTime}
                  onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                  className="text-sm bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
                />
                <span>-</span>
                <input
                  type="time"
                  value={editData.endTime}
                  onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                  className="text-sm bg-transparent border-b border-gray-300 focus:border-green-500 outline-none"
                />
              </div>
            ) : (
              <>
                <span>{formatTime(activity.startTime)}</span>
                {activity.endTime && (
                  <>
                    <span>-</span>
                    <span>{formatTime(activity.endTime)}</span>
                  </>
                )}
                {calculateDuration() && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {calculateDuration()}h
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        {/* Confidence Score */}
        {activity.confidenceScore && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(activity.confidenceScore * 100)}% confidence
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}