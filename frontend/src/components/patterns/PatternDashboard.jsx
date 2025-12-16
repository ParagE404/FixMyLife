import React, { useState } from 'react';
import { Brain, TrendingUp, Bell } from 'lucide-react';
import PatternSuggestions from './PatternSuggestions.jsx';
import PatternInsights from './PatternInsights.jsx';

const PatternDashboard = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestionCount, setSuggestionCount] = useState(0);

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
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Brain className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Behavioral Pattern Recognition</h2>
        </div>
        <p className="text-blue-100">
          AI-powered insights into your activity patterns and proactive habit suggestions
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pattern Analysis</p>
              <p className="text-lg font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Learning Period</p>
              <p className="text-lg font-semibold text-gray-900">30 Days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bell className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Smart Suggestions</p>
              <p className="text-lg font-semibold text-gray-900">Enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          How Pattern Recognition Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Data Collection</h4>
            <p className="text-sm text-gray-600">
              Analyzes your activity logs from the past 30 days
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Pattern Detection</h4>
            <p className="text-sm text-gray-600">
              Identifies temporal patterns and habit sequences
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">3</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Deviation Detection</h4>
            <p className="text-sm text-gray-600">
              Notices when you deviate from established patterns
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Smart Suggestions</h4>
            <p className="text-sm text-gray-600">
              Provides proactive suggestions to resume habits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternDashboard;