import { useState } from "react";
import { activityService } from "../../services/activity.service";
import { useAuthStore } from "../../stores/authStore";

export function TextActivityInput({ onActivitiesCreated }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [parsedActivities, setParsedActivities] = useState([]);
  const { token } = useAuthStore();

  const handleParse = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await activityService.parseActivities(input, token);
      console.log("Parsed Activities:", result.activities);
      setParsedActivities(result.activities || []);
    } catch (err) {
      setError(err.message);
      setParsedActivities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (onActivitiesCreated) {
      onActivitiesCreated(parsedActivities);
    }
    setInput("");
    setParsedActivities([]);
  };

  const handleEdit = (index, field, value) => {
    const updated = [...parsedActivities];
    updated[index] = { ...updated[index], [field]: value };
    setParsedActivities(updated);
  };

  return (
    <div className="space-y-4">
      {/* Input Form */}
      <form onSubmit={handleParse} className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your day: 'Worked 9-5, lunch at noon, gym at 6'"
          className="w-full px-4 py-3 border rounded-lg resize-none h-24"
        />

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Parsing..." : "Parse Activities"}
        </button>
      </form>

      {/* Parsed Activities Preview */}
      {parsedActivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Confirm Activities:</h3>

          {parsedActivities.map((activity, idx) => (
            <div key={idx} className="p-3 border rounded-lg space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={activity.description}
                  onChange={(e) =>
                    handleEdit(idx, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={activity.category.name}
                  onChange={(e) => handleEdit(idx, "category", e.target.value)}
                  className="w-full px-3 py-2 border rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={
                      activity.startTime
                        ? activity.startTime.substring(11, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleEdit(idx, "startTime", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input
                    type="time"
                    value={   activity.endTime
                        ? activity.endTime.substring(11, 16)
                        : ""}
                    onChange={(e) => handleEdit(idx, "endTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Confidence: {(activity.confidenceScore * 100).toFixed(0)}%
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={handleConfirm}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Confirm & Save Activities
          </button>
        </div>
      )}
    </div>
  );
}
