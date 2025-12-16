import React, { useState } from 'react';
import { AlertTriangle, Clock, TrendingDown, CheckCircle, X, Lightbulb } from 'lucide-react';
import predictionService from '../../services/prediction.service.js';

const HabitDegradationAlert = ({ alert, onDismiss, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInterventions, setShowInterventions] = useState(false);
  const [interventions, setInterventions] = useState([]);

  const actionData = alert.actionData || {};
  const { categoryName, riskLevel, riskScore, recommendations = [] } = actionData;

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
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

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

  const handleTriggerIntervention = async () => {
    setIsLoading(true);
    try {
      const result = await predictionService.triggerIntervention(alert.id);
      setInterventions(result.interventions);
      setShowInterventions(true);
      onUpdate?.();
    } catch (error) {
      console.error('Error triggering intervention:', error);
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
    <div className={`border rounded-lg p-4 ${getRiskColor(riskLevel)} ${alert.read ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getRiskIcon(riskLevel)}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {alert.title}
            </h3>
            <p className="text-sm mt-1 text-gray-700">
              {alert.message}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>{formatDate(alert.createdAt)}</span>
              {riskScore && (
                <span className="font-medium">
                  Risk: {Math.round(riskScore)}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {(recommendations.length > 0 || !alert.read) && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Show Actions'}
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Recommendations:
              </h4>
              <ul className="space-y-1">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleTriggerIntervention}
              disabled={isLoading || actionData.interventionTriggered}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              <span>
                {actionData.interventionTriggered ? 'Intervention Sent' : 'Get Help'}
              </span>
            </button>
            
            {!alert.read && (
              <button
                onClick={handleMarkAsRead}
                disabled={isLoading}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Mark as Read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Intervention Modal/Popup */}
      {showInterventions && interventions.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-1" />
            Action Plan Generated
          </h4>
          <div className="space-y-2">
            {interventions.map((intervention, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium text-blue-700">
                  {intervention.title}
                </div>
                <div className="text-blue-600">
                  {intervention.description}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInterventions(false)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitDegradationAlert;