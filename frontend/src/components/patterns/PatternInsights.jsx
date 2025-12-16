import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Calendar, Link, BarChart3, AlertCircle } from 'lucide-react';
import patternsService from '../../services/patterns.service.js';

const PatternInsights = () => {
  const [insights, setInsights] = useState([]);
  const [patternStrength, setPatternStrength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPatternData();
  }, []);

  const loadPatternData = async () => {
    try {
      setLoading(true);
      const [insightsResponse, strengthResponse] = await Promise.all([
        patternsService.getPatternInsights(),
        patternsService.getPatternStrength(),
      ]);
      
      setInsights(insightsResponse || []);
      setPatternStrength(strengthResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to load pattern data:', err);
      setError('Failed to load pattern insights');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'consistent_habits':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'peak_times':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'activity_sequences':
        return <Link className="w-5 h-5 text-purple-600" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-blue-600';
    if (strength >= 40) return 'text-yellow-600';
    if (strength >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStrengthBgColor = (strength) => {
    if (strength >= 80) return 'bg-green-100';
    if (strength >= 60) return 'bg-blue-100';
    if (strength >= 40) return 'bg-yellow-100';
    if (strength >= 20) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
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
            onClick={loadPatternData}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Pattern Insights
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Your behavioral patterns and habits
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Pattern Strength Score */}
        {patternStrength && (
          <div className={`rounded-lg p-4 ${getStrengthBgColor(patternStrength.overallStrength)}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Pattern Strength</h4>
              <span className={`text-2xl font-bold ${getStrengthColor(patternStrength.overallStrength)}`}>
                {patternStrength.overallStrength}%
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              {patternsService.getPatternStrengthDescription(patternStrength.overallStrength)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Patterns:</span>
                <span className="ml-2 font-medium">{patternStrength.totalPatterns}</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Confidence:</span>
                <span className="ml-2 font-medium">{patternStrength.avgConfidence}%</span>
              </div>
            </div>

            {patternStrength.patternBreakdown && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{patternStrength.patternBreakdown.daily}</div>
                    <div className="text-gray-600">Daily</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{patternStrength.patternBreakdown.weekly}</div>
                    <div className="text-gray-600">Weekly</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{patternStrength.patternBreakdown.temporal}</div>
                    <div className="text-gray-600">Sequences</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{patternStrength.patternBreakdown.category}</div>
                    <div className="text-gray-600">Categories</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Individual Insights */}
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {insight.title}
                  </h4>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {insight.message}
                  </p>

                  {/* Render insight data based on type */}
                  {insight.type === 'consistent_habits' && insight.data && (
                    <div className="space-y-2">
                      {insight.data.slice(0, 3).map((habit, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{habit.category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              {patternsService.formatPatternTime(habit.hour)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${patternsService.getConfidenceColor(habit.confidence)} bg-gray-100`}>
                              {Math.round(habit.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {insight.type === 'peak_times' && insight.data && (
                    <div className="grid grid-cols-3 gap-2">
                      {insight.data.map((time, idx) => (
                        <div key={idx} className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-medium text-sm">
                            {patternsService.formatPatternTime(time.hour)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {time.count} activities
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {insight.type === 'activity_sequences' && insight.data && (
                    <div className="space-y-2">
                      {insight.data.slice(0, 3).map((sequence, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <span className="text-gray-700">{sequence.from}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="text-gray-700">{sequence.to}</span>
                          <span className="ml-auto text-xs text-gray-500">
                            {sequence.count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No patterns detected yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Log more activities to see your behavioral patterns
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <button
          onClick={loadPatternData}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh insights
        </button>
      </div>
    </div>
  );
};

export default PatternInsights;