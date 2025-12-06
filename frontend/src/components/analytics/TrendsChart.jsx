import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TrendsChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((week) => ({
    week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hours: parseFloat(week.totalHours.toFixed(1)),
    activities: week.activityCount,
  }));

  return (
    <div className="bg-surface rounded-lg p-4 border border-border">
      <h3 className="text-lg font-semibold mb-4">4-Week Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="hours" stroke="var(--color-primary)" name="Hours" />
          <Line yAxisId="right" type="monotone" dataKey="activities" stroke="var(--color-warning)" name="Activities" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
