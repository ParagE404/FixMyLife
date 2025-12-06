import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function WeeklyChart({ data }) {
  if (!data) {
    return <div className="bg-surface rounded-lg p-4 border border-border">No data</div>;
  }

  if (!data.chartData || data.chartData.length === 0) {
    return <div className="bg-surface rounded-lg p-4 border border-border">No activities this week</div>;
  }

  // Debug: Log the data
  console.log('Weekly Chart Data:', data.chartData);

  return (
    <div className="bg-surface rounded-lg p-4 border border-border w-full">
      <h3 className="text-lg font-semibold mb-4">Weekly Activity Hours</h3>
      <div style={{ width: '100%', height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
            <XAxis dataKey="day" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => `${parseFloat(value).toFixed(1)}h`}
            />
            <Bar dataKey="hours" fill="#2180a0" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-text-secondary mt-4">
        Total: {data.totalHours.toFixed(1)} hours across {data.activityCount} activities
      </p>
    </div>
  );
}
