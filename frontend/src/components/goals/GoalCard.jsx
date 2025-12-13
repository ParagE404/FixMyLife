import { useState } from 'react';
import { goalsService } from '../../services/goals.service';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Check, 
  Trash2, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export function GoalCard({ goal, onDelete, onUpdate }) {
  const { token } = useAuthStore();
  const [showProgress, setShowProgress] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!confirm('Mark this goal as completed?')) return;
    try {
      setLoading(true);
      await goalsService.completeGoal(goal.id, token);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleLogProgress = async () => {
    const hours = parseFloat(hoursInput);
    if (!hours || hours <= 0) return;
    try {
      setLoading(true);
      await goalsService.logProgress(goal.id, hours, token);
      setHoursInput('');
      setShowProgress(false);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this goal?')) return;
    try {
      setLoading(true);
      await goalsService.deleteGoal(goal.id, token);
      onDelete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{goal.title}</CardTitle>
            {goal.description && (
              <CardDescription>{goal.description}</CardDescription>
            )}
          </div>
          <Badge 
            variant={goal.isOnTrack ? "success" : "warning"}
            className="flex items-center gap-1"
          >
            {goal.isOnTrack ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            {goal.isOnTrack ? 'On Track' : 'Behind'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-4">
          {/* This Week Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Week
              </span>
              <span className="text-sm text-muted-foreground">
                {(goal.thisWeekLogged || 0).toFixed(1)}h / {goal.targetHours}h
              </span>
            </div>
            <Progress 
              value={Math.min(goal.weeklyProgressPercent || 0, 100)} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground">
              {goal.weeklyProgressPercent || 0}% of weekly target
            </p>
          </div>
          
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overall Progress
              </span>
              <span className="text-sm text-muted-foreground">
                {goal.totalLogged.toFixed(1)}h / {goal.expectedHours.toFixed(1)}h
              </span>
            </div>
            <Progress 
              value={Math.min(goal.progressPercent, 100)} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {goal.progressPercent}% complete since start
            </p>
          </div>
        </div>

        <Separator />

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Target className="w-4 h-4 text-primary mr-1" />
              <span className="text-lg font-bold">{goal.targetHours}h</span>
            </div>
            <p className="text-xs text-muted-foreground">Target/Week</p>
          </div>
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center">
              <Clock className="w-4 h-4 text-primary mr-1" />
              <span className="text-lg font-bold">{goal.weeksSinceStart}</span>
            </div>
            <p className="text-xs text-muted-foreground">Weeks</p>
          </div>
          <div className="text-center space-y-1">
            <Badge variant="outline" className="text-xs">
              {goal.category?.name || 'Any'}
            </Badge>
            <p className="text-xs text-muted-foreground">Category</p>
          </div>
        </div>

        {/* Log Progress Input */}
        {showProgress && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Hours worked"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleLogProgress}
                  disabled={loading}
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Log
                </Button>
                <Button
                  onClick={() => setShowProgress(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {goal.status === 'active' && (
            <>
              <Button
                onClick={() => setShowProgress(!showProgress)}
                variant="default"
                size="sm"
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Hours
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                variant="default"
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                Complete
              </Button>
            </>
          )}
          <Button
            onClick={handleDelete}
            disabled={loading}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
