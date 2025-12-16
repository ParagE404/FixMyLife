import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Brain, AlertCircle } from 'lucide-react';
import correlationsService from '../../services/correlations.service.js';

const CorrelationInsights = () => {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCorrelationData();
  }, []);

  const loadCorrelationData = async () => {
    try {
      setLoading(true);
      const [insightsResponse, summaryResponse] = await Promise.all([
        correlationsService.getCorrelationInsights(),
        correlationsService.getCorrelationSummary(),
      ]);
      
      setInsights(insightsResponse.insights || []);
      setSummary(summaryResponse);
      setError(null);
    } catch (err) {
      console.error('Failed to load correlation data:', err);
      setError('Failed to load correlation insights');
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'strong_positive_correlations':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'strong_negative_correlations':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'health_correlations':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'productivity_correlations':
        return <Brain className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
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
            onClick={loadCorrelationData}
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
          <Brain className="w-5 h-5 mr-2 text-purple-600" />
          Cross-Correlation Insights
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Hidden relationships between your activities
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-gray-900">{summary.totalCorrelations}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{summary.strongCorrelations}</div>
              <div className="text-xs text-gray-600">Strong</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{summary.insights}</div>
              <div className="text-xs text-gray-600">Insights</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{summary.dataPoints}</div>
              <div className="text-xs text-gray-600">Data Points</div>
            </div>
          </div>
        )}

        {/* Top Correlation */}
        {summary?.topCorrelation && (
          <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center text-sm sm:text-base">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              Strongest Correlation
            </h4>
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="min-w-0">
                <p className="text-sm text-gray-700 break-words">
                  {correlationsService.getCorrelationDescription(summary.topCorrelation)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Coefficient: {correlationsService.formatCorrelationCoefficient(summary.topCorrelation.coefficient)}
                  {' • '}
                  {summary.topCorrelation.significance}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium border self-start ${correlationsService.getCorrelationBadgeColor(summary.topCorrelation.coefficient)}`}>
                {summary.topCorrelation.strength}
              </div>
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 ? (
          insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base break-words">
                    {insight.title}
                  </h4>
                  
                  <p className="text-sm text-gray-700 mb-3 break-words">
                    {insight.description}
                  </p>

                  {/* Correlations in this insight */}
                  {insight.correlations && insight.correlations.length > 0 && (
                    <div className="space-y-2">
                      {insight.correlations.slice(0, 3).map((correlation, idx) => (
                        <div key={idx} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-sm p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-base sm:text-lg">
                              {correlationsService.getCorrelationDirectionIcon(correlation.coefficient)}
                            </span>
                            <span className="text-gray-700 break-words">
                              {correlationsService.formatCategoryName(correlation.categoryA)}
                              {' ↔ '}
                              {correlationsService.formatCategoryName(correlation.categoryB)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 self-start">
                            <span className={`font-medium ${correlationsService.getCorrelationStrengthColor(correlation.coefficient)}`}>
                              {correlationsService.formatCorrelationCoefficient(correlation.coefficient)}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs border ${correlationsService.getCorrelationBadgeColor(correlation.coefficient)}`}>
                              {correlation.strength}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actionable recommendations */}
                  {insight.actionable && insight.correlations && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800 break-words">
                        <strong>💡 Recommendation:</strong> {correlationsService.generateCorrelationRecommendation(insight.correlations[0])}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No correlation insights available yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Log more activities across different categories to discover patterns
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <button
          onClick={loadCorrelationData}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh insights
        </button>
      </div>
    </div>
  );
};

export default CorrelationInsights;