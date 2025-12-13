import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analytics.service';
import { useAuthStore } from '../stores/authStore';
import { WeeklyChart } from '../components/analytics/WeeklyChart';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { TrendsChart } from '../components/analytics/TrendsChart';
import { HabitStrengthCard } from '../components/analytics/HabitStrengthCard';
import { CalendarHeatmap } from '../components/analytics/CalendarHeatmap';

export function DashboardPage() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [weeklyData, setWeeklyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [habitStrength, setHabitStrength] = useState(null);
  const [calendarData, setCalendarData] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [weekly, categories, trends, habits, calendar] = await Promise.all([
        analyticsService.getWeeklySummary(token),
        analyticsService.getCategoryBreakdown(7, token),
        analyticsService.getFourWeekTrends(token),
        analyticsService.getHabitStrength(token),
        analyticsService.getCalendarHeatmap(token),
      ]);

      setWeeklyData(weekly);
      setCategoryData(categories);
      setTrendsData(trends);
      setHabitStrength(habits);
      setCalendarData(calendar);
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
        <p className="text-text-secondary">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-text-secondary">Your activity insights and trends</p>
        </div>

        {error && (
          <div className="p-4 bg-error/10 text-error rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Top Row: Weekly + Habit Strength */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <WeeklyChart data={weeklyData} />
          </div>
          <div>
            <HabitStrengthCard data={habitStrength} />
          </div>
        </div>

        {/* Middle Row: Categories + Trends */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <CategoryChart data={categoryData} />
          <TrendsChart data={trendsData} />
        </div>

        {/* Bottom Row: Calendar */}
        <div className="mb-6">
          <CalendarHeatmap data={calendarData} />
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
