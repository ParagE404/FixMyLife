import React, { useState, useEffect } from 'react';
import { Bell, Clock, TrendingUp, X, Check, AlertCircle } from 'lucide-react';
import patternsService from '../../services/patterns.service.js';

const PatternSuggestions = ({ onSuggestionAction }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    loadSuggestions();
    
    // Refresh suggestions every 30 minutes
    const interval = setInterval(loadSuggestions, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await patternsService.getPatternSuggestions();
      console.log('Pattern suggestions response:', response);
      setSuggestions(response?.suggestions || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load pattern suggestions:', err);
      setError('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleActOnSuggestion = async (suggestionId, suggestion) => {
    try {
      setActioningId(suggestionId);
      console.log('Acting on suggestion:', suggestionId, suggestion);
      
      const result = await patternsService.actOnSuggestion(suggestionId);
      console.log('Act on suggestion result:', result);
      
      // Remove from local state
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      // Show success message if activity was logged
      if (result && result.activityLogged) {
        console.log('Activity was logged successfully!');
        // You could add a toast notification here
        alert('Activity logged successfully!');
      }
      
      // Notify parent component
      if (onSuggestionAction) {
        onSuggestionAction('acted', suggestion);
      }
    } catch (err) {
      console.error('Failed to act on suggestion:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDismissSuggestion = async (suggestionId, suggestion) => {
    try {
      setActioningId(suggestionId);
      console.log('Dismissing suggestion:', suggestionId, suggestion);
      
      const result = await patternsService.dismissSuggestion(suggestionId);
      console.log('Dismiss suggestion result:', result);
      
      // Remove from local state
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
      
      // Notify parent component
      if (onSuggestionAction) {
        onSuggestionAction('dismissed', suggestion);
      }
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err);
    } finally {
      setActioningId(null);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'habit_resumption':
        return <TrendingUp className="w-5 h-5" />;
      case 'upcoming_habit':
        return <Clock className="w-5 h-5" />;
      case 'sequence_suggestion':
        return <Bell className="w-5 h-5" />;
      case 'weekly_habit':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 border-red-200';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 border-blue-200';
      default:
        return 'border-l-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getActionButtonText = (actionType) => {
    switch (actionType) {
      case 'log_activity':
        return 'Log Activity';
      case 'prepare_activity':
        return 'Prepare';
      case 'reminder':
        return 'Set Reminder';
      default:
        return 'Take Action';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>{error}</p>
          <button
            onClick={loadSuggestions}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No pattern suggestions right now</p>
          <p className="text-xs text-gray-400 mt-1">
            Keep logging activities to build patterns
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="w-5 h-5 mr-2 text-blue-600" />
          Smart Suggestions
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Based on your activity patterns
        </p>
      </div>

      <div className="p-4 space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`border-l-4 rounded-lg p-4 ${getPriorityStyles(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {suggestion.title}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-white border">
                      {patternsService.formatSuggestionTiming(suggestion.timing)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    {suggestion.message}
                  </p>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>Category: {suggestion.category}</span>
                    <span>•</span>
                    <span>
                      Confidence: {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleActOnSuggestion(suggestion.id, suggestion)}
                  disabled={actioningId === suggestion.id}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actioningId === suggestion.id ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                  ) : (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {getActionButtonText(suggestion.actionType)}
                </button>
                
                <button
                  onClick={() => handleDismissSuggestion(suggestion.id, suggestion)}
                  disabled={actioningId === suggestion.id}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <button
          onClick={loadSuggestions}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh suggestions
        </button>
      </div>
    </div>
  );
};

export default PatternSuggestions;