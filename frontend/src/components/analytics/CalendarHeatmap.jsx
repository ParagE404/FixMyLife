export function CalendarHeatmap({ data }) {
  if (!data) return null;

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'none':
        return 'bg-gray-100';
      case 'low':
        return 'bg-blue-200';
      case 'medium':
        return 'bg-blue-400';
      case 'high':
        return 'bg-blue-600';
      case 'very-high':
        return 'bg-blue-800';
      default:
        return 'bg-gray-100';
    }
  };

  // Group by weeks
  const weeks = [];
  let currentWeek = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(data.startDate);
    currentWeek.push(new Date(date.getTime() + i * 24 * 60 * 60 * 1000));
  }
  weeks.push(currentWeek);

  let currentDate = new Date(data.startDate);
  currentDate.setDate(currentDate.getDate() + 7);
  currentWeek = [];

  while (currentDate <= new Date(data.endDate)) {
    currentWeek.push(new Date(currentDate));
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Find intensity for each date
  const getIntensity = (dateObj) => {
    if (!dateObj) return 'none';
    const dateStr = dateObj.toISOString().split('T');
    const dayData = data.data.find((d) => d.date === dateStr);
    return dayData ? dayData.intensity : 'none';
  };

  return (
    <div className="bg-surface rounded-lg p-4 border border-border overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>

      <div className="inline-block">
        <div className="flex gap-1 mb-2">
          <div className="w-6"></div>
          {dayLabels.map((label) => (
            <div key={label} className="w-6 h-6 flex items-center justify-center text-xs font-semibold">
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 mb-1">
            <div className="w-6 text-xs text-text-secondary flex items-center justify-center">
              W{weekIdx + 1}
            </div>
            {week.map((date, dayIdx) => {
              if (!date) {
                return <div key={dayIdx} className="w-6 h-6"></div>;
              }
              const intensity = getIntensity(date);
              const dayData = data.data.find((d) => d.date === date.toISOString().split('T'));

              return (
                <div
                  key={dayIdx}
                  className={`w-6 h-6 rounded ${getIntensityColor(intensity)} cursor-help`}
                  title={`${date.toDateString()}: ${dayData?.hours.toFixed(1) || 0}h`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <span className="text-xs text-text-secondary">Less</span>
        {['none', 'low', 'medium', 'high', 'very-high'].map((intensity) => (
          <div key={intensity} className={`w-3 h-3 rounded ${getIntensityColor(intensity)}`}></div>
        ))}
        <span className="text-xs text-text-secondary">More</span>
      </div>
    </div>
  );
}
