import React from 'react';
import { Bell } from 'lucide-react';
import AlertsPanel from '../components/alerts/AlertsPanel.jsx';
import RiskAnalysisDashboard from '../components/analytics/RiskAnalysisDashboard.jsx';

const AlertsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-30">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Alerts & Predictions
              </h1>
              <p className="text-gray-600">
                Stay on top of your habits with predictive alerts and risk analysis
              </p>
            </div>
          </div>
        </div>

        {/* Risk Analysis Dashboard */}
        <RiskAnalysisDashboard />

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>
    </div>
  );
};

export default AlertsPage;