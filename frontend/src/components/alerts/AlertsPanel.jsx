import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import HabitDegradationAlert from './HabitDegradationAlert.jsx';
import predictionService from '../../services/prediction.service.js';

const AlertsPanel = ({ className = '' }) => {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, habit_degradation
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
    loadStats();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const filters = {};
      
      if (filter === 'unread') {
        filters.read = false;
      } else if (filter === 'habit_degradation') {
        filters.type = 'habit_degradation_alert';
      }
      
      const alertsData = await predictionService.getAlerts(filters);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await predictionService.getAlertStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading alert stats:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAlerts();
    await loadStats();
    setIsRefreshing(false);
  };

  const handleAlertUpdate = () => {
    loadAlerts();
    loadStats();
  };

  const handleAlertDismiss = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    loadStats();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await predictionService.markAllAlertsAsRead();
      loadAlerts();
      loadStats();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      if (filter === 'unread') return !alert.read;
      if (filter === 'habit_degradation') return alert.type === 'habit_degradation_alert';
      return true;
    });
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Alerts & Notifications
            </h2>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.unread}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
          <span>Total: {stats.total || 0}</span>
          <span>Unread: {stats.unread || 0}</span>
          <span>Habit Alerts: {stats.habitAlerts || 0}</span>
          <span>Recent: {stats.recentAlerts || 0}</span>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mt-3">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'habit_degradation', label: 'Habit Alerts' }
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading alerts...</span>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-500 mb-1">
              No alerts
            </h3>
            <p className="text-gray-400">
              {filter === 'unread' 
                ? "You're all caught up!" 
                : filter === 'habit_degradation'
                ? "No habit alerts at the moment"
                : "No notifications to show"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              alert.type === 'habit_degradation_alert' ? (
                <HabitDegradationAlert
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleAlertDismiss}
                  onUpdate={handleAlertUpdate}
                />
              ) : (
                <GenericAlert
                  key={alert.id}
                  alert={alert}
                  onDismiss={handleAlertDismiss}
                  onUpdate={handleAlertUpdate}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Generic alert component for non-habit alerts
const GenericAlert = ({ alert, onDismiss, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    if (alert.read) return;
    
    setIsLoading(true);
    try {
      await predictionService.markAlertAsRead(alert.id);
      onUpdate?.();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = async () => {
    setIsLoading(true);
    try {
      await predictionService.deleteAlert(alert.id);
      onDismiss?.(alert.id);
    } catch (error) {
      console.error('Error dismissing alert:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`border rounded-lg p-4 ${alert.read ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900">
            {alert.title}
          </h3>
          <p className="text-sm mt-1 text-gray-700">
            {alert.message}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            {formatDate(alert.createdAt)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {!alert.read && (
            <button
              onClick={handleMarkAsRead}
              disabled={isLoading}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as read"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDismiss}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Dismiss"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertsPanel;