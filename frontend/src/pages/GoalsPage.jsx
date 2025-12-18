import { useState, useEffect, useCallback } from 'react';
import { goalsService } from '../services/goals.service';
import { useAuthStore } from '../stores/authStore';
import { GoalCard } from '../components/goals/GoalCard';
import { RecommendationsPanel } from '../components/goals/RecommendationsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { LoadingPage } from '../components/ui/loading';
import { 
  Target, 
  Plus, 
  Calendar, 
  Clock, 
  FileText,
  AlertCircle,
  Sparkles,
  Trophy
} from 'lucide-react';

export function GoalsPage() {
  const { token } = useAuthStore();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetHours: '5',
    endDate: '',
  });

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await goalsService.getGoals('active', token);
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetHours) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await goalsService.createGoal({
        ...formData,
        targetHours: parseFloat(formData.targetHours),
      }, token);
      setFormData({ title: '', description: '', targetHours: '5', endDate: '' });
      setShowForm(false);
      loadGoals();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <LoadingPage text="Loading your goals..." />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-30">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <Card className="glass card-elevated">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  Goals
                </CardTitle>
                <CardDescription>
                  Set and track your activity goals to build better habits
                </CardDescription>
              </div>
              <Button onClick={() => setShowForm(!showForm)} variant="gradient" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Goal Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Create New Goal
              </CardTitle>
              <CardDescription>
                Define your target and start building a new habit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Goal Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="E.g., Exercise Daily, Read More Books"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What's this goal about? Why is it important to you?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetHours" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Target Hours/Week
                    </Label>
                    <Input
                      id="targetHours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.targetHours}
                      onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date (optional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" variant="success" className="flex-1">
                    <Trophy className="w-4 h-4 mr-2" />
                    Create Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Goals Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Target className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">No goals yet</h3>
                      <p className="text-muted-foreground">
                        Create your first goal to start tracking your progress
                      </p>
                    </div>
                    <Button onClick={() => setShowForm(true)} variant="gradient" size="lg" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Active Goals</h2>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {goals.length} active
                  </Badge>
                </div>
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdate={loadGoals}
                    onDelete={loadGoals}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions to help you succeed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecommendationsPanel />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
