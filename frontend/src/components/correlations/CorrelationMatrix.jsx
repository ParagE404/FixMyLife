import React, { useState, useEffect } from 'react';
import { Grid, AlertCircle, Info } from 'lucide-react';
import correlationsService from '../../services/correlations.service.js';

const CorrelationMatrix = () => {
  const [matrixData, setMatrixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
    loadMatrixData();
  }, []);

  const loadMatrixData = async () => {
    try {
      setLoading(true);
      const response = await correlationsService.getCorrelationMatrix();
      setMatrixData(response);
      setError(null);
    } catch (err) {
      console.error('Failed to load correlation matrix:', err);
      setError('Failed to load correlation matrix');
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (categoryA, categoryB, coefficient) => {
    if (categoryA === categoryB) return; // Skip diagonal cells
    
    setSelectedCell({
      categoryA,
      categoryB,
      coefficient,
      strength: correlationsService.getCorrelationStrengthColor(coefficient),
      description: correlationsService.getCorrelationDescription({
        categoryA,
        categoryB,
        coefficient,
        strength: getStrengthText(coefficient),
        direction: coefficient > 0 ? 'positive' : 'negative',
      }),
    });
  };

  const getStrengthText = (coefficient) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.8) return 'Very Strong';
    if (abs >= 0.6) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const getCellStyle = (coefficient) => {
    if (coefficient === 1) {
      return 'bg-gray-200 cursor-default'; // Diagonal cells
    }
    
    const abs = Math.abs(coefficient);
    const opacity = Math.max(0.1, abs);
    
    if (coefficient > 0) {
      return `cursor-pointer hover:scale-105 transition-transform`;
    } else if (coefficient < 0) {
      return `cursor-pointer hover:scale-105 transition-transform`;
    } else {
      return 'bg-gray-50 cursor-pointer hover:scale-105 transition-transform';
    }
  };

  const getCellColor = (coefficient) => {
    return correlationsService.getHeatmapColor(coefficient);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
            onClick={loadMatrixData}
            className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!matrixData || !matrixData.categories || matrixData.categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Grid className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No correlation data available</p>
          <p className="text-xs text-gray-400 mt-1">
            Log activities across multiple categories to see correlations
          </p>
        </div>
      </div>
    );
  }

  const { matrix, categories } = matrixData;

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Grid className="w-5 h-5 mr-2 text-blue-600" />
          Correlation Matrix
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Visual representation of activity correlations
        </p>
      </div>

      <div className="p-4">
        {/* Legend */}
        <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div>
              <span>Positive</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}></div>
              <span>Negative</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-gray-200"></div>
              <span>None</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {matrixData.correlations} correlations found
          </div>
        </div>

        {/* Matrix */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="w-20 sm:w-32"></th>
                  {categories.map((category, index) => (
                    <th key={index} className="p-0.5 sm:p-1 text-xs font-medium text-gray-700 transform -rotate-45 origin-bottom-left h-16 sm:h-20">
                      <div className="w-12 sm:w-16 truncate">
                        {correlationsService.formatCategoryName(category)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((categoryA, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="p-0.5 sm:p-1 text-xs font-medium text-gray-700 w-20 sm:w-32 truncate">
                      {correlationsService.formatCategoryName(categoryA)}
                    </td>
                    {categories.map((categoryB, colIndex) => {
                      const coefficient = matrix[categoryA]?.[categoryB] || 0;
                      return (
                        <td key={colIndex} className="p-0.5 sm:p-1">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center text-xs font-medium ${getCellStyle(coefficient)}`}
                            style={{ backgroundColor: getCellColor(coefficient) }}
                            onClick={() => handleCellClick(categoryA, categoryB, coefficient)}
                            title={`${categoryA} ↔ ${categoryB}: ${correlationsService.formatCorrelationCoefficient(coefficient)}`}
                          >
                            {coefficient === 1 ? '1' : coefficient !== 0 ? correlationsService.formatCorrelationCoefficient(coefficient).substring(0, 3) : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Cell Details */}
        {selectedCell && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">
                  Correlation Details
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  {selectedCell.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-blue-700">
                  <span>
                    Coefficient: {correlationsService.formatCorrelationCoefficient(selectedCell.coefficient)}
                  </span>
                  <span>•</span>
                  <span>
                    Strength: {getStrengthText(selectedCell.coefficient)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* How to Read */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-gray-600 mt-0.5 shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">How to read the matrix:</p>
              <p>• Click on any cell to see correlation details</p>
              <p>• Darker colors indicate stronger correlations</p>
              <p>• Blue = activities increase together, Red = one increases as other decreases</p>
              <p>• Values range from -1 (perfect negative) to +1 (perfect positive)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t rounded-b-lg">
        <button
          onClick={loadMatrixData}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh matrix
        </button>
      </div>
    </div>
  );
};

export default CorrelationMatrix;