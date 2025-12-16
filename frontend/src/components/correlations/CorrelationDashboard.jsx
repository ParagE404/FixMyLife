import React, { useState } from 'react';
import { Network, TrendingUp, Zap, Grid } from 'lucide-react';
import CorrelationInsights from './CorrelationInsights.jsx';
import PredictiveInsights from './PredictiveInsights.jsx';
import CorrelationMatrix from './CorrelationMatrix.jsx';

const CorrelationDashboard = () => {
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    {
      id: 'insights',
      name: 'Correlation Insights',
      icon: TrendingUp,
      description: 'Discover hidden relationships',
    },
    {
      id: 'predictions',
      name: 'Predictions',
      icon: Zap,
      description: 'AI-powered behavioral predictions',
    },
    {
      id: 'matrix',
      name: 'Correlation Matrix',
      icon: Grid,
      description: 'Visual correlation heatmap',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <Network className="w-6 h-6 sm:w-8 sm:h-8" />
          <h2 className="text-lg sm:text-2xl font-bold break-words">Multi-Domain Habit Cross-Correlation</h2>
        </div>
        <p className="text-purple-100 text-sm sm:text-base">
          Discover hidden behavioral relationships and predict future activity patterns
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex overflow-x-auto px-4 sm:px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">
                    {tab.id === 'insights' ? 'Insights' : 
                     tab.id === 'predictions' ? 'Predict' : 'Matrix'}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'insights' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cross-Correlation Insights
                </h3>
                <p className="text-sm text-gray-600">
                  Analyze relationships between different activity categories to understand how your habits influence each other.
                </p>
              </div>
              <CorrelationInsights />
            </div>
          )}

          {activeTab === 'predictions' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Predictive Behavioral Insights
                </h3>
                <p className="text-sm text-gray-600">
                  AI-powered predictions based on your historical activity correlations to help optimize your routines.
                </p>
              </div>
              <PredictiveInsights />
            </div>
          )}

          {activeTab === 'matrix' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Correlation Matrix Visualization
                </h3>
                <p className="text-sm text-gray-600">
                  Interactive heatmap showing the strength and direction of correlations between all your activity categories.
                </p>
              </div>
              <CorrelationMatrix />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Network className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Analysis Method</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900 break-words">Pearson Correlation</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Analysis Period</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">60 Days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Minimum Threshold</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">0.3 Correlation</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How Cross-Correlation Analysis Works
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-sm sm:text-base">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Data Collection</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Analyzes 60 days of activity data across all categories
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-sm sm:text-base">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Correlation Calculation</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Uses Pearson correlation to find relationships between categories
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-sm sm:text-base">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Pattern Recognition</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Identifies significant correlations and behavioral patterns
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold text-sm sm:text-base">4</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Predictive Insights</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Generates predictions and recommendations based on correlations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationDashboard;