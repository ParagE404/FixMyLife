import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  '#2563eb', // blue
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function CategoryChart({ data }) {
  // Better null/undefined checks
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No category data available</p>
        </div>
      </div>
    );
  }

  // Ensure data is properly formatted
  const chartData = data
    .filter(item => item && typeof item.hours === 'number' && item.hours > 0)
    .map((item) => ({
      name: item.name || 'Unknown',
      value: parseFloat(item.hours.toFixed(1)),
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-surface rounded-lg p-4 border border-border">
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-text-secondary">
          <p>No activities with recorded time</p>
        </div>
      </div>
    );
  }

  const renderLabel = ({ name, value, percent }) => {
    return `${name}: ${value}h (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div className="bg-surface rounded-lg p-4 border border-border">
      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value.toFixed(1)}h`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
