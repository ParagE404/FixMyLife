import { useState, useEffect } from 'react';
import { goalsService } from '../services/goals.service';
import { useAuthStore } from '../stores/authStore';
import { GoalCard } from '../components/goals/GoalCard';
import { RecommendationsPanel } from '../components/goals/RecommendationsPanel';

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

  useEffect(() => {
    loadGoals();
  }, [token]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getGoals('active', token);
      setGoals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-text-secondary">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Goals</h1>
          <p className="text-text-secondary">Set and track your activity goals</p>
        </div>

        {error && (
          <div className="p-4 bg-error/10 text-error rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* New Goal Form */}
        {showForm && (
          <div className="bg-surface rounded-lg p-6 border border-border mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Goal Title</label>
                <input
                  type="text"
                  placeholder="E.g., Exercise Daily"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  placeholder="What's this goal about?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  rows="2"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Hours/Week</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.targetHours}
                    onChange={(e) => setFormData({ ...formData, targetHours: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-text rounded-lg hover:bg-secondary-hover font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Goals */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Active Goals</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
              >
                + New Goal
              </button>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-12 bg-surface rounded-lg border border-border">
                <p className="text-text-secondary mb-4">No goals yet. Create your first one!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
                >
                  Create Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
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
          <div className="bg-surface rounded-lg p-6 border border-border h-fit">
            <RecommendationsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
