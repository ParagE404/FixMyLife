export function HabitStrengthCard({ data }) {
  // Better null/undefined checks
  if (!data) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Habit Strength</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No habit data available</p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'No Activity':
        return 'bg-gray-100 text-gray-700';
      case 'Just Started':
        return 'bg-blue-100 text-blue-700';
      case 'Building':
        return 'bg-yellow-100 text-yellow-700';
      case 'Established':
        return 'bg-green-100 text-green-700';
      case 'Mastered':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Provide defaults for missing data
  const consistencyScore = data.consistencyScore || 0;
  const level = data.level || 'No Activity';
  const daysWithActivity = data.daysWithActivity || 0;
  const avgHoursPerDay = data.avgHoursPerDay || 0;
  const avgActivitiesPerDay = data.avgActivitiesPerDay || 0;

  return (
    <div className="bg-surface rounded-lg p-4 border border-border">
      <h3 className="text-lg font-semibold mb-4">Habit Strength</h3>

      <div className="space-y-4">
        {/* Score Circle */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{consistencyScore}%</p>
              <p className="text-xs text-gray-600">Consistency</p>
            </div>
          </div>
        </div>

        {/* Level Badge */}
        <div className="flex justify-center">
          <span className={`px-4 py-2 rounded-full font-semibold text-sm ${getLevelColor(level)}`}>
            {level}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{daysWithActivity}</p>
            <p className="text-xs text-text-secondary">Days Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{avgHoursPerDay}</p>
            <p className="text-xs text-text-secondary">Avg Hours/Day</p>
          </div>
          <div className="text-center col-span-2">
            <p className="text-2xl font-bold text-blue-600">{avgActivitiesPerDay}</p>
            <p className="text-xs text-text-secondary">Avg Activities/Day</p>
          </div>
        </div>
      </div>
    </div>
  );
}
