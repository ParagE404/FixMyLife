import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, Target, AlertCircle, Lightbulb } from 'lucide-react';
import correlationsService from '../../services/correlations.service.js';

const PredictiveInsights = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPredictiveInsights();
  }, []);

  const loadPredictiveInsights = async () => {
    try {
      setLoading(true);
      const response = await correlationsService.getPredictiveInsights();
      setPredictions(response.predictions || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load predictive insights:', err);
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const getPredictionIcon = (type) => {
    switch (type) {
      case 'correlation_prediction':
        return <Zap className="w-5 h-5 text-purple-600" />;
      default:
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (confidence >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getDirectionIcon = (direction) => {
    return direction === 'positive' ? '📈' : '📉';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-16 bg-gray-200 rounded"></div>
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
            onClick={loadPredictiveInsights}
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
          <Zap className="w-5 h-5 mr-2 text-purple-600" />
          Predictive Insights
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          AI predictions based on your behavioral correlations
        </p>
      </div>

      <div className="p-4 space-y-4">
        {predictions.length > 0 ? (
          predictions.map((prediction, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getPredictionIcon(prediction.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <span className="text-lg mr-2">
                        {getDirectionIcon(prediction.direction)}
                      </span>
                      Prediction: {correlationsService.formatCategoryName(prediction.predicted)}
                    </h4>
                    
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getConfidenceColor(prediction.confidence)}`}>
                      {correlationsService.formatPredictionConfidence(prediction.confidence).text} Confidence
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">
                      {prediction.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Trigger: {correlationsService.formatCategoryName(prediction.trigger)}
                      </span>
                      <span>•</span>
                      <span>
                        Direction: {prediction.direction === 'positive' ? 'Increases' : 'Decreases'}
                      </span>
                      <span>•</span>
                      <span>
                        Confidence: {Math.round(prediction.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  {prediction.recommendation && (
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-purple-800 mb-1">
                            Recommendation
                          </p>
                          <p className="text-sm text-purple-700">
                            {prediction.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Zap className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No predictions available yet</p>
            <p className="text-xs text-gray-400 mt-1">
              More activity data is needed to generate reliable predictions
            </p>
          </div>
        )}

        {/* How Predictions Work */}
        {predictions.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Target className="w-4 h-4 mr-2 text-gray-600" />
              How Predictions Work
            </h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Predictions are based on statistical correlations in your activity data</p>
              <p>• Higher confidence indicates stronger historical patterns</p>
              <p>• Predictions update as you log more activities</p>
              <p>• Use these insights to optimize your daily routines</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <button
          onClick={loadPredictiveInsights}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh predictions
        </button>
      </div>
    </div>
  );
};

export default PredictiveInsights;