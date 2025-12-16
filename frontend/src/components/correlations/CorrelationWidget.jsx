import React, { useState, useEffect } from 'react';
import { Network, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import correlationsService from '../../services/correlations.service.js';

const CorrelationWidget = () => {
  const [summary, setSummary] = useState(null);
  const [topCorrelations, setTopCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCorrelationData();
  }, []);

  const loadCorrelationData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, insightsResponse] = await Promise.all([
        correlationsService.getCorrelationSummary(),
        correlationsService.getCorrelationInsights(),
      ]);
      
      setSummary(summaryResponse);
      
      // Extract top correlations from insights
      const allCorrelations = [];
      insightsResponse.insights?.forEach(insight => {
        if (insight.correlations) {
          allCorrelations.push(...insight.correlations);
        }
      });
      
      // Sort by strength and take top 2
      const sortedCorrelations = correlationsService.sortCorrelationsByStrength(allCorrelations);
      setTopCorrelations(sortedCorrelations.slice(0, 2));
      
    } catch (error) {
      console.error('Failed to load correlation data:', error);
      setSummary(null);
      setTopCorrelations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalCorrelations === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Network className="w-4 h-4 mr-2 text-purple-600" />
            Cross-Correlations
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          <Network className="w-6 h-6 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No correlations found yet</p>
          <p className="text-xs text-gray-400">Log activities across different categories</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <Network className="w-4 h-4 mr-2 text-purple-600" />
          Cross-Correlations
        </h3>
        <button
          onClick={() => navigate('/correlations')}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
        >
          View all
          <ArrowRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{summary.totalCorrelations}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{summary.strongCorrelations}</div>
          <div className="text-xs text-gray-600">Strong</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{summary.predictions}</div>
          <div className="text-xs text-gray-600">Predictions</div>
        </div>
      </div>

      {/* Top Correlations */}
      <div className="space-y-2">
        {topCorrelations.map((correlation, index) => (
          <div key={index} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <div className="text-lg">
                  {correlation.direction === 'positive' ? 
                    <TrendingUp className="w-4 h-4 text-green-600" /> : 
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {correlationsService.formatCategoryName(correlation.categoryA)}
                    {' ↔ '}
                    {correlationsService.formatCategoryName(correlation.categoryB)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {correlation.strength} correlation
                  </div>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded text-xs font-medium border ${correlationsService.getCorrelationBadgeColor(correlation.coefficient)}`}>
                {correlationsService.formatCorrelationCoefficient(correlation.coefficient)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-4 pt-3 border-t">
        <button
          onClick={() => navigate('/correlations')}
          className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Explore Cross-Correlation Analysis →
        </button>
      </div>
    </div>
  );
};

export default CorrelationWidget;