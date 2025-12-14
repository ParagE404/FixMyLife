import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { userService } from '../../services/user.service';

const DEFAULT_CATEGORIES = [
  'Physical Health',
  'Career & Finances',
  'Relationships',
  'Emotional & Mental Health',
  'Personal Growth',
];

export function FocusAreasSettings() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useAuthStore();

  useEffect(() => {
    loadFocusAreas();
  }, []);

  const loadFocusAreas = async () => {
    try {
      setLoading(true);
      const data = await userService.getUserFocusAreas(token);
      setSelectedCategories(data.selectedCategories || []);
      setCustomCategories(data.customCategories.map(cat => cat.name) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addCustomCategory = async () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      const categoryName = newCategoryName.trim();
      try {
        await userService.createCustomCategory(categoryName, token);
        setCustomCategories((prev) => [...prev, categoryName]);
        setSelectedCategories((prev) => [...prev, categoryName]);
        setNewCategoryName('');
        setSuccess('Custom category added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const removeCustomCategory = (category) => {
    setCustomCategories((prev) => prev.filter((c) => c !== category));
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      await userService.updateFocusAreas(selectedCategories, customCategories, token);
      setSuccess('Focus areas updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-2">Focus Areas</h2>
        <p className="text-gray-600 text-sm">
          Manage the areas of your life you want to track. You can select from default categories or create your own.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {/* Default Categories */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium mb-3">Default Categories</h3>
        <div className="space-y-3">
          {DEFAULT_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
              />
              <span className="ml-3 font-medium">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Categories */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium mb-3">Custom Categories</h3>
        
        {customCategories.length > 0 && (
          <div className="space-y-3 mb-4">
            {customCategories.map((category) => (
              <div key={category} className="flex items-center p-3 border border-green-200 bg-green-50 rounded-lg">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                />
                <span className="ml-3 font-medium flex-1">{category}</span>
                <button
                  onClick={() => removeCustomCategory(category)}
                  className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add custom focus area..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              onClick={addCustomCategory}
              disabled={!newCategoryName.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving || selectedCategories.length === 0}
          className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        
        {selectedCategories.length === 0 && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Please select at least one focus area.
          </p>
        )}
      </div>
    </div>
  );
}