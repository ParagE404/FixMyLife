import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import { MobileWrapper } from '../components/layout/MobileWrapper.jsx';
import CorrelationDashboard from '../components/correlations/CorrelationDashboard.jsx';

const CorrelationsPage = () => {
  const navigate = useNavigate();

  return (
    <MobileWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/patterns')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <Brain className="w-4 h-4 mr-1" />
              Back to Patterns
            </button>
          </div>
          
          <CorrelationDashboard />
        </div>
      </div>
    </MobileWrapper>
  );
};

export default CorrelationsPage;