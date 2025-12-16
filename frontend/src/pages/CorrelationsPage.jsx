import React from 'react';
import { MobileWrapper } from '../components/layout/MobileWrapper.jsx';
import CorrelationDashboard from '../components/correlations/CorrelationDashboard.jsx';

const CorrelationsPage = () => {
  return (
    <MobileWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CorrelationDashboard />
        </div>
      </div>
    </MobileWrapper>
  );
};

export default CorrelationsPage;