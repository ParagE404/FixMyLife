export function CalendarHeatmap({ data }) {
  // Better null/undefined checks
  if (!data || !data.data || !Array.isArray(data.data)) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No calendar data available</p>
        </div>
      </div>
    );
  }

  if (!data.startDate || !data.endDate) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>Invalid date range</p>
        </div>
      </div>
    );
  }

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

  // Create a map for quick lookup
  const dataMap = new Map();
  data.data.forEach(item => {
    if (item && item.date) {
      // Normalize date to YYYY-MM-DD format
      let dateStr;
      if (typeof item.date === 'string') {
        dateStr = item.date.includes('T') ? item.date.split('T')[0] : item.date;
      } else if (item.date instanceof Date) {
        dateStr = item.date.toISOString().split('T')[0];
      } else {
        console.warn('Unexpected date format:', item.date);
        return;
      }
      dataMap.set(dateStr, item);
    }
  });

  // Generate weeks array
  const weeks = [];
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>Invalid date range</p>
        </div>
      </div>
    );
  }

  let currentWeek = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    currentWeek.push(new Date(currentDate));
    
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Add remaining days and pad with nulls
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
    const dateStr = dateObj.toISOString().split('T')[0];
    const dayData = dataMap.get(dateStr);
    return dayData ? dayData.intensity : 'none';
  };

  const getDayData = (dateObj) => {
    if (!dateObj) return null;
    const dateStr = dateObj.toISOString().split('T')[0];
    return dataMap.get(dateStr);
  };

  return (
    <div className="bg-surface rounded-lg p-4 border border-border overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Activity Heatmap</h3>

      <div className="inline-block">
        <div className="flex gap-1 mb-2">
          <div className="w-8"></div>
          {dayLabels.map((label) => (
            <div key={label} className="w-8 h-6 flex items-center justify-center text-xs font-semibold">
              {label}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex gap-1 mb-1">
            <div className="w-8 text-xs text-text-secondary flex items-center justify-center">
              W{weekIdx + 1}
            </div>
            {week.map((date, dayIdx) => {
              if (!date) {
                return <div key={dayIdx} className="w-8 h-8"></div>;
              }
              const intensity = getIntensity(date);
              const dayData = getDayData(date);

              return (
                <div
                  key={dayIdx}
                  className={`w-8 h-8 rounded ${getIntensityColor(intensity)} cursor-help border border-gray-200 hover:border-gray-400 transition-colors`}
                  title={`${date.toLocaleDateString()}: ${dayData?.hours?.toFixed(1) || 0}h`}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 items-center flex-wrap">
        <span className="text-xs text-text-secondary">Less</span>
        {['none', 'low', 'medium', 'high', 'very-high'].map((intensity) => (
          <div key={intensity} className={`w-4 h-4 rounded ${getIntensityColor(intensity)} border border-gray-200`}></div>
        ))}
        <span className="text-xs text-text-secondary">More</span>
      </div>
    </div>
  );
}
