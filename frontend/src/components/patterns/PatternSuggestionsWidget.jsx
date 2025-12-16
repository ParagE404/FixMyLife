import React, { useState, useEffect } from 'react';
import { Brain, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import patternsService from '../../services/patterns.service.js';

const PatternSuggestionsWidget = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await patternsService.getPatternSuggestions();
      // Show only top 2 suggestions in widget
      setSuggestions((response.suggestions || []).slice(0, 2));
    } catch (error) {
      console.error('Failed to load pattern suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (suggestionId) => {
    try {
      await patternsService.actOnSuggestion(suggestionId);
      // Remove from local state
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Failed to act on suggestion:', error);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'habit_resumption':
        return <TrendingUp className="w-4 h-4" />;
      case 'upcoming_habit':
        return <Clock className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-blue-600" />
            Smart Suggestions
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          <Brain className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No suggestions right now</p>
          <p className="text-xs text-gray-400">Keep logging to build patterns</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Brain className="w-4 h-4 mr-2 text-blue-600" />
          Smart Suggestions
        </h3>
        <button
          onClick={() => navigate('/patterns')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          View all
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      <div className="space-y-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`border rounded-lg p-3 ${getPriorityColor(suggestion.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium mb-1">
                    {suggestion.title}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {suggestion.message}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 bg-white rounded border">
                      {suggestion.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleQuickAction(suggestion.id)}
                className="ml-2 text-xs px-2 py-1 bg-white border rounded hover:bg-gray-50 transition-colors"
              >
                Act
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t">
        <button
          onClick={() => navigate('/patterns')}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View Pattern Dashboard →
        </button>
      </div>
    </div>
  );
};

export default PatternSuggestionsWidget;