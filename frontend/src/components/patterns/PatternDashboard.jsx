import React, { useState } from 'react';
import { Brain, TrendingUp, Bell, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PatternSuggestions from './PatternSuggestions.jsx';
import PatternInsights from './PatternInsights.jsx';

const PatternDashboard = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestionCount, setSuggestionCount] = useState(0);
  const navigate = useNavigate();

  const handleSuggestionAction = (action, suggestion) => {
    // Handle suggestion actions (acted on or dismissed)
    console.log(`Suggestion ${action}:`, suggestion);
    
    // You could show a toast notification here
    // or trigger other actions like logging an activity
  };

  const tabs = [
    {
      id: 'suggestions',
      name: 'Smart Suggestions',
      icon: Bell,
      count: suggestionCount,
    },
    {
      id: 'insights',
      name: 'Pattern Insights',
      icon: TrendingUp,
    },
    {
      id: 'correlations',
      name: 'Cross-Correlations',
      icon: Network,
      isExternal: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 sm:p-6 text-white">
        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
          <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
          <h2 className="text-lg sm:text-2xl font-bold break-words">Behavioral Pattern Recognition</h2>
        </div>
        <p className="text-blue-100 text-sm sm:text-base">
          AI-powered insights into your activity patterns and proactive habit suggestions
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
                  onClick={() => {
                    if (tab.isExternal) {
                      navigate('/correlations');
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${tab.isExternal ? 'hover:text-purple-600 hover:border-purple-300' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">
                    {tab.id === 'suggestions' ? 'Suggestions' : 
                     tab.id === 'insights' ? 'Insights' : 'Cross-Corr'}
                  </span>
                  {tab.count > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                  {tab.isExternal && (
                    <span className="text-xs text-purple-600">→</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'suggestions' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Proactive Habit Suggestions
                </h3>
                <p className="text-sm text-gray-600">
                  Based on your activity patterns, here are personalized suggestions to help you maintain your habits.
                </p>
              </div>
              <PatternSuggestions onSuggestionAction={handleSuggestionAction} />
            </div>
          )}

          {activeTab === 'insights' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Behavioral Patterns
                </h3>
                <p className="text-sm text-gray-600">
                  Discover insights about your activity patterns, peak times, and habit consistency.
                </p>
              </div>
              <PatternInsights />
            </div>
          )}

          {activeTab === 'correlations' && (
            <div className="text-center py-8">
              <Network className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cross-Correlation Analysis
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Discover hidden relationships between your activities and get AI-powered predictions.
              </p>
              <button
                onClick={() => navigate('/correlations')}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Network className="w-4 h-4 mr-2" />
                Explore Cross-Correlation Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Pattern Analysis</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Learning Period</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">30 Days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Smart Suggestions</p>
              <p className="text-sm sm:text-lg font-semibold text-gray-900">Enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How Pattern Recognition Works
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold text-sm sm:text-base">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Data Collection</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Analyzes your activity logs from the past 30 days
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold text-sm sm:text-base">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Pattern Detection</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Identifies temporal patterns and habit sequences
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold text-sm sm:text-base">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Deviation Detection</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Notices when you deviate from established patterns
            </p>
          </div>

          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold text-sm sm:text-base">4</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Smart Suggestions</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              Provides proactive suggestions to resume habits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternDashboard;