import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, Target, RefreshCw, Brain } from 'lucide-react';
import predictionService from '../../services/prediction.service.js';

const RiskAnalysisDashboard = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRiskAnalysis();
  }, []);

  const loadRiskAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await predictionService.getRiskAnalysis();
      setAnalysis(data);
    } catch (error) {
      console.error('Error loading risk analysis:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      await predictionService.analyzeHabits();
      await loadRiskAnalysis();
    } catch (error) {
      console.error('Error running analysis:', error);
      setError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'high': return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTrend = (trend) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Analyzing habit patterns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Analysis Error
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadRiskAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { predictions = [], riskSummary = {}, lastAnalyzed } = analysis || {};

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b">
        <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Habit Risk Analysis
            </h2>
          </div>
          
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-3">
            {lastAnalyzed && (
              <span className="text-xs md:text-sm text-gray-500">
                Last updated: {formatDate(lastAnalyzed)}
              </span>
            )}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="flex items-center justify-center space-x-2 px-3 py-2 md:px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-4 md:p-6 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {riskSummary.totalCategories || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500">Categories</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-red-600">
              {riskSummary.criticalRisk || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500">Critical</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-orange-600">
              {riskSummary.highRisk || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500">High Risk</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-900">
              {riskSummary.averageRiskScore ? Math.round(riskSummary.averageRiskScore) : 0}%
            </div>
            <div className="text-xs md:text-sm text-gray-500">Avg Risk</div>
          </div>
        </div>
      </div>

      {/* Predictions */}
      <div className="p-4 md:p-6">
        {predictions.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              All Habits Looking Good!
            </h3>
            <p className="text-gray-500">
              No significant degradation risks detected in your current habits.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Habit Risk Predictions
            </h3>
            
            {predictions.map((prediction, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 md:p-4 ${getRiskColor(prediction.riskLevel)}`}
              >
                <div className="flex flex-col space-y-3 md:flex-row md:items-start md:justify-between md:space-y-0">
                  <div className="flex items-start space-x-3 flex-1">
                    {getRiskIcon(prediction.riskLevel)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between md:block">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base">
                            {prediction.categoryName}
                          </h4>
                          <p className="text-xs md:text-sm mt-1 text-gray-700">
                            {prediction.message}
                          </p>
                        </div>
                        
                        {/* Risk Score - Mobile */}
                        <div className="text-right ml-3 md:hidden">
                          <div className="text-lg font-bold">
                            {Math.round(prediction.riskScore)}%
                          </div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            {prediction.riskLevel}
                          </div>
                        </div>
                      </div>
                      
                      {/* Metrics - Mobile Stacked */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs md:flex md:items-center md:space-x-4 md:gap-0">
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Frequency:</span>
                          <span className={prediction.frequencyTrend < 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatTrend(prediction.frequencyTrend)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Duration:</span>
                          <span className={prediction.durationTrend < 0 ? 'text-red-600' : 'text-green-600'}>
                            {formatTrend(prediction.durationTrend)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span className="font-medium">Consistency:</span>
                          <span>{Math.round(prediction.consistencyScore)}%</span>
                        </div>
                        
                        {prediction.daysSinceLastActivity > 0 && (
                          <div className="flex items-center space-x-1 col-span-2 md:col-span-1">
                            <span className="font-medium">Last:</span>
                            <span>{prediction.daysSinceLastActivity}d ago</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Recommendations */}
                      {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Quick Actions:
                          </div>
                          <ul className="space-y-1">
                            {prediction.recommendations.slice(0, 2).map((rec, recIndex) => (
                              <li key={recIndex} className="text-xs text-gray-600 flex items-start">
                                <span className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Risk Score - Desktop */}
                  <div className="text-right hidden md:block">
                    <div className="text-lg font-bold">
                      {Math.round(prediction.riskScore)}%
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {prediction.riskLevel} Risk
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysisDashboard;