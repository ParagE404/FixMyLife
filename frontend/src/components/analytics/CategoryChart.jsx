import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = [
  'var(--color-primary)',
  'var(--color-warning)',
  'var(--color-info)',
  'var(--color-success)',
  'var(--color-error)',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
];

export function CategoryChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((item) => ({
    name: item.name,
    value: parseFloat(item.hours.toFixed(1)),
  }));

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
            label={({ name, value }) => `${name}: ${value}h`}
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
