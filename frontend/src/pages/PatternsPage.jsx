import React from 'react';
import { MobileWrapper } from '../components/layout/MobileWrapper.jsx';
import PatternDashboard from '../components/patterns/PatternDashboard.jsx';

const PatternsPage = () => {
  return (
    <MobileWrapper>
      <div className="min-h-screen bg-gray-50 pb-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PatternDashboard />
        </div>
      </div>
    </MobileWrapper>
  );
};

export default PatternsPage;