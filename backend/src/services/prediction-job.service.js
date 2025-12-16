import cron from 'node-cron';
import PredictionService from './prediction.service.js';

// Schedule prediction analysis to run daily at 9 AM
export const initializePredictionScheduler = () => {
  console.log('🔮 Initializing prediction scheduler...');
  
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔮 Running daily habit degradation analysis...');
    
    try {
      const results = await PredictionService.runBatchAnalysis();
      
      const totalUsers = results.length;
      const successfulAnalyses = results.filter(r => !r.error).length;
      const totalAlerts = results.reduce((sum, r) => sum + (r.alertsGenerated || 0), 0);
      
      console.log(`✅ Prediction analysis completed:`);
      console.log(`   - Users analyzed: ${successfulAnalyses}/${totalUsers}`);
      console.log(`   - Alerts generated: ${totalAlerts}`);
      
      if (results.some(r => r.error)) {
        console.log(`⚠️  Some analyses failed - check logs for details`);
      }
      
    } catch (error) {
      console.error('❌ Prediction scheduler error:', error);
    }
  });
  
  // Also run a lighter check every 6 hours for critical cases
  cron.schedule('0 */6 * * *', async () => {
    console.log('🔮 Running critical habit check...');
    
    try {
      // This could be a lighter version that only checks for critical cases
      // For now, we'll skip to avoid overwhelming users with notifications
      console.log('⏭️  Critical check skipped - using daily analysis only');
    } catch (error) {
      console.error('❌ Critical check error:', error);
    }
  });
  
  console.log('✅ Prediction scheduler initialized');
  console.log('   - Daily analysis: 9:00 AM');
  console.log('   - Critical check: Every 6 hours');
};

// Manual trigger for testing
export const runManualPredictionAnalysis = async () => {
  console.log('🔮 Running manual prediction analysis...');
  
  try {
    const results = await PredictionService.runBatchAnalysis();
    console.log('✅ Manual analysis completed:', results);
    return results;
  } catch (error) {
    console.error('❌ Manual analysis error:', error);
    throw error;
  }
};

export default {
  initializePredictionScheduler,
  runManualPredictionAnalysis
};