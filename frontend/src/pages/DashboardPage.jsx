import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analytics.service';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Activity, TrendingUp, Target, Calendar, BarChart3, Clock } from 'lucide-react';

export function DashboardPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    weeklyData: null,
    categoryData: null,
    trendsData: null,
    habitStrength: null,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [weekly, categories, trends, habits] = await Promise.all([
        analyticsService.getWeeklySummary(token),
        analyticsService.getCategoryBreakdown(7, token),
        analyticsService.getFourWeekTrends(token),
        analyticsService.getHabitStrength(token),
      ]);

      setDashboardData({
        weeklyData: weekly,
        categoryData: categories,
        trendsData: trends,
        habitStrength: habits,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const { weeklyData, categoryData, trendsData, habitStrength } = dashboardData;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your activity insights and trends</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="This Week"
            value={weeklyData?.totalHours?.toFixed(1) || '0'}
            unit="hours"
            description={`${weeklyData?.activityCount || 0} activities logged`}
            icon={<Clock className="w-4 h-4" />}
          />
          <StatsCard
            title="Habit Strength"
            value={habitStrength?.score?.toFixed(0) || '0'}
            unit="%"
            description={habitStrength?.message || 'Keep building habits'}
            icon={<Target className="w-4 h-4" />}
          />
          <StatsCard
            title="Categories"
            value={categoryData?.categories?.length || '0'}
            unit="active"
            description="Different activity types"
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <StatsCard
            title="Trend"
            value={trendsData?.weeklyChange >= 0 ? '+' : ''}
            unit={`${trendsData?.weeklyChange?.toFixed(1) || '0'}%`}
            description="vs last week"
            icon={<TrendingUp className="w-4 h-4" />}
          />
        </div>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Activity Breakdown
            </CardTitle>
            <CardDescription>
              Your daily activity hours for this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyProgressBars data={weeklyData?.chartData || []} />
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Time spent by category this week</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryBreakdown data={categoryData?.categories || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Trends</CardTitle>
              <CardDescription>Your activity patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <TrendsSummary data={trendsData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, unit, description, icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function WeeklyProgressBars({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity data for this week
      </div>
    );
  }

  const maxHours = Math.max(...data.map(d => d.hours || 0), 1);

  return (
    <div className="space-y-3">
      {data.map((day, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-12 text-sm font-medium">{day.day}</div>
          <div className="flex-1">
            <Progress value={(day.hours / maxHours) * 100} className="h-2" />
          </div>
          <div className="w-16 text-sm text-muted-foreground text-right">
            {day.hours?.toFixed(1) || '0'}h
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No category data available
      </div>
    );
  }

  const totalHours = data.reduce((sum, cat) => sum + (cat.hours || 0), 0);

  return (
    <div className="space-y-3">
      {data.slice(0, 5).map((category, index) => {
        const percentage = totalHours > 0 ? (category.hours / totalHours) * 100 : 0;
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: category.color || '#2563eb' }}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {category.hours?.toFixed(1) || '0'}h ({percentage.toFixed(0)}%)
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TrendsSummary({ data }) {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No trend data available
      </div>
    );
  }

  const trends = [
    {
      label: 'Weekly Change',
      value: `${data.weeklyChange >= 0 ? '+' : ''}${data.weeklyChange?.toFixed(1) || '0'}%`,
      positive: data.weeklyChange >= 0,
    },
    {
      label: 'Monthly Average',
      value: `${data.monthlyAverage?.toFixed(1) || '0'}h`,
      positive: true,
    },
    {
      label: 'Best Day',
      value: data.bestDay || 'N/A',
      positive: true,
    },
    {
      label: 'Consistency',
      value: `${data.consistency?.toFixed(0) || '0'}%`,
      positive: (data.consistency || 0) >= 70,
    },
  ];

  return (
    <div className="space-y-4">
      {trends.map((trend, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{trend.label}</span>
          <span className={`text-sm font-medium ${
            trend.positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.value}
          </span>
        </div>
      ))}
    </div>
  );
}
