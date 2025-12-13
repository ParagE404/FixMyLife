import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TrendsChart({ data }) {
  // Better null/undefined checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">4-Week Trends</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  // Ensure data is properly formatted
  const chartData = data
    .filter(week => week && week.week)
    .map((week) => {
      const weekDate = new Date(week.week);
      return {
        week: isNaN(weekDate.getTime()) 
          ? 'Invalid Date' 
          : weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        hours: parseFloat((week.totalHours || 0).toFixed(1)),
        activities: week.activityCount || 0,
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">4-Week Trends</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No valid trend data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg p-4 border border-border">
      <h3 className="text-lg font-semibold mb-4">4-Week Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="week" stroke="#666" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="left" stroke="#666" style={{ fontSize: '12px' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#666" style={{ fontSize: '12px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Legend />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="hours" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Hours" 
            dot={{ fill: '#2563eb', r: 4 }}
          />
          <Line 
            yAxisId="right" 
            type="monotone" 
            dataKey="activities" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Activities" 
            dot={{ fill: '#f59e0b', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
