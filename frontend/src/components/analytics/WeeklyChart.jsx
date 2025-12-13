import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function WeeklyChart({ data }) {
  // Better null/undefined checks
  if (!data) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Weekly Activity Hours</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  if (!data.chartData || !Array.isArray(data.chartData) || data.chartData.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Weekly Activity Hours</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No activities recorded this week</p>
        </div>
      </div>
    );
  }

  // Ensure data is properly formatted
  const chartData = data.chartData.map(item => ({
    day: item.day || 'Unknown',
    hours: parseFloat(item.hours) || 0
  }));

  const totalHours = data.totalHours || 0;
  const activityCount = data.activityCount || 0;

  return (
    <div className="bg-surface rounded-lg p-4 border border-border w-full">
      <h3 className="text-lg font-semibold mb-4">Weekly Activity Hours</h3>
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="day" stroke="#666" style={{ fontSize: '12px' }} />
            <YAxis stroke="#666" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
              formatter={(value) => `${parseFloat(value).toFixed(1)}h`}
            />
            <Legend />
            <Bar dataKey="hours" fill="#2563eb" name="Hours" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-text-secondary mt-4">
        Total: {totalHours.toFixed(1)} hours across {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
      </p>
    </div>
  );
}
