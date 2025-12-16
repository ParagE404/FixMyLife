import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Clock, ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import predictionService from '../../services/prediction.service.js';

const RiskAnalysisWidget = ({ className = '' }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRiskAnalysis();
  }, []);

  const loadRiskAnalysis = async () => {
    try {
      setIsLoading(true);
      const data = await predictionService.getRiskAnalysis();
      setAnalysis(data || { predictions: [], riskSummary: {} });
    } catch (error) {
      console.error('Error loading risk analysis:', error);
      setAnalysis({ predictions: [], riskSummary: {} });
    } finally {
      setIsLoading(false);
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
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <TrendingDown className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Habit Risk Analysis</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const { predictions = [], riskSummary = {} } = analysis || {};
  const highRiskPredictions = predictions.filter(p => ['critical', 'high'].includes(p.riskLevel));

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Habit Risk Analysis</h3>
          </div>
          <Link
            to="/alerts"
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {highRiskPredictions.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              All Habits Stable
            </h4>
            <p className="text-sm text-gray-500">
              No high-risk habits detected. Keep up the great work!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {riskSummary.criticalRisk || 0}
                </div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {riskSummary.highRisk || 0}
                </div>
                <div className="text-xs text-gray-500">High Risk</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {riskSummary.averageRiskScore ? Math.round(riskSummary.averageRiskScore) : 0}%
                </div>
                <div className="text-xs text-gray-500">Avg Risk</div>
              </div>
            </div>

            {/* High Risk Predictions */}
            <div className="space-y-2">
              {highRiskPredictions.slice(0, 3).map((prediction, index) => (
                <div
                  key={index}
                  className={`border rounded-md p-3 ${getRiskColor(prediction.riskLevel)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(prediction.riskLevel)}
                      <div>
                        <div className="font-medium text-sm">
                          {prediction.categoryName}
                        </div>
                        <div className="text-xs text-gray-600">
                          {prediction.daysSinceLastActivity > 0 && 
                            `${prediction.daysSinceLastActivity} days since last activity`
                          }
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        {Math.round(prediction.riskScore)}%
                      </div>
                      <div className="text-xs text-gray-500 uppercase">
                        {prediction.riskLevel}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {highRiskPredictions.length > 3 && (
                <div className="text-center pt-2">
                  <Link
                    to="/alerts"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    +{highRiskPredictions.length - 3} more alerts
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskAnalysisWidget;