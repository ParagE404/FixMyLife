import { useState, useEffect, useCallback } from 'react';
import { activityService } from '../services/activity.service';
import { useAuthStore } from '../stores/authStore';
import { ActivityCard } from '../components/activity/ActivityCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { LoadingPage } from '../components/ui/loading';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock,
  RefreshCw,
  ListFilter,
  SortDesc
} from 'lucide-react';

export function ActivitiesHistoryPage() {
  const { token } = useAuthStore();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, duration

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedCategory) filters.category = selectedCategory;
      if (dateFilter !== 'all') filters.period = dateFilter;
      if (sortBy) filters.sort = sortBy;

      const activities = await activityService.getActivities(filters, token);
      setActivities(activities || []);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [token, searchTerm, selectedCategory, dateFilter, sortBy]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleActivityUpdate = () => {
    loadActivities();
  };

  const handleActivityDelete = () => {
    loadActivities();
  };

  // Get unique categories from activities
  const categories = [...new Set(activities.map(a => a.category?.name).filter(Boolean))];

  // Filter activities based on search and filters
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || 
      activity.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.startTime || activity.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});

  const formatGroupDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return <LoadingPage text="Loading your activities..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <History className="w-6 h-6 text-indigo-600" />
                  </div>
                  Activity History
                </CardTitle>
                <CardDescription>
                  View and manage all your logged activities
                </CardDescription>
              </div>
              <Button onClick={loadActivities} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-3">
                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="duration">By Duration</option>
                  </select>
                </div>
              </div>

              {/* Active Filters */}
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Category: {selectedCategory}
                    <button onClick={() => setSelectedCategory('')} className="ml-1 hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                )}
                {dateFilter !== 'all' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {dateFilter === 'today' ? 'Today' : 
                     dateFilter === 'week' ? 'This Week' : 'This Month'}
                    <button onClick={() => setDateFilter('all')} className="ml-1 hover:text-red-500">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Activities List */}
        {Object.keys(groupedActivities).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <History className="w-8 h-8 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">No activities found</h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedCategory || dateFilter !== 'all' 
                      ? 'Try adjusting your filters or search terms'
                      : 'Start logging activities to see them here'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, dayActivities]) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatGroupDate(date)}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    {dayActivities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        onUpdate={handleActivityUpdate}
                        onDelete={handleActivityDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Summary Stats */}
        {filteredActivities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredActivities.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Activities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-500">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(groupedActivities).length}
                  </div>
                  <div className="text-sm text-gray-500">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {filteredActivities
                      .filter(a => a.startTime && a.endTime)
                      .reduce((total, a) => {
                        const duration = (new Date(a.endTime) - new Date(a.startTime)) / (1000 * 60 * 60);
                        return total + duration;
                      }, 0)
                      .toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-500">Total Hours</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}