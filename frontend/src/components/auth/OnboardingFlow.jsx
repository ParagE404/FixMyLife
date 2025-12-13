import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/user.service';

const DEFAULT_CATEGORIES = [
  'Physical Health',
  'Career & Finances',
  'Relationships',
  'Emotional & Mental Health',
  'Personal Growth',
];

export function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, setUser } = useAuthStore();

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGoalChange = (category, value) => {
    setGoals((prev) => ({ ...prev, [category]: value }));
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      setError('');
      
      const updatedUser = await userService.completeOnboarding(selectedCategories, goals, token);
      setUser(updatedUser);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-surface rounded-lg shadow-md">
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold mb-2">Select Your Focus Areas</h2>
            <p className="text-text-secondary text-sm mb-6">
              Choose the areas of your life you want to track
            </p>

            <div className="space-y-3">
              {DEFAULT_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="w-5 h-5"
                  />
                  <span className="ml-3 font-medium">{category}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                if (selectedCategories.length > 0) setStep(2);
              }}
              disabled={selectedCategories.length === 0}
              className="w-full mt-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Set Your Initial Goals</h2>
            <p className="text-text-secondary text-sm mb-6">
              Define how often you want to engage in each area (optional)
            </p>

            <div className="space-y-4">
              {selectedCategories.map((category) => (
                <div key={category}>
                  <label className="block text-sm font-medium mb-2">{category}</label>
                  <input
                    type="text"
                    placeholder="e.g., 4x per week, 10 hours per week"
                    value={goals[category] || ''}
                    onChange={(e) => handleGoalChange(category, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-blue-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Start Tracking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
