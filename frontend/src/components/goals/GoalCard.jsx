import { useState } from 'react';
import { goalsService } from '../../services/goals.service';
import { useAuthStore } from '../../stores/authStore';

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

  const statusColor = {
    active: 'border-blue-500 bg-blue-50',
    completed: 'border-green-500 bg-green-50',
    abandoned: 'border-gray-500 bg-gray-50',
  };

  return (
    <div className={`border-l-4 rounded-lg p-6 bg-white ${statusColor[goal.status]}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          goal.isOnTrack 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {goal.isOnTrack ? '✓ On Track' : '⚠ Behind'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {goal.totalLogged.toFixed(1)}h / {goal.expectedHours.toFixed(1)}h
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-1">{goal.progressPercent}% complete</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{goal.targetHours}h</p>
          <p className="text-xs text-gray-600">Target/Week</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">{goal.weeksSinceStart}</p>
          <p className="text-xs text-gray-600">Weeks</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700">{goal.category?.name || 'Any'}</p>
          <p className="text-xs text-gray-600">Category</p>
        </div>
      </div>

      {/* Log Progress */}
      {showProgress && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="Hours"
              value={hoursInput}
              onChange={(e) => setHoursInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
            />
            <button
              onClick={handleLogProgress}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              Log
            </button>
            <button
              onClick={() => setShowProgress(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {goal.status === 'active' && (
          <>
            <button
              onClick={() => setShowProgress(!showProgress)}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
            >
              + Log Hours
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 disabled:opacity-50"
            >
              Complete
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
