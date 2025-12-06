import { useState, useEffect } from 'react';
import { goalsService } from '../../services/goals.service';
import { useAuthStore } from '../../stores/authStore';

export function RecommendationsPanel() {
  const { token } = useAuthStore();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecommendations();
  }, [token]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getRecommendations(token);
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  if (loading) return <div className="text-center text-gray-600">Loading insights...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">AI Insights & Recommendations</h2>
        <button
          onClick={loadRecommendations}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No insights yet. Keep logging activities!
        </div>
      ) : (
        recommendations.map((rec, idx) => (
          <div
            key={idx}
            className={`border-l-4 rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
          >
            <h3 className="font-semibold text-gray-900">{rec.title}</h3>
            <p className="text-sm text-gray-700 mt-1">{rec.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
