import { PrismaClient } from '@prisma/client';
import PredictionService from './src/services/prediction.service.js';

const prisma = new PrismaClient();

async function testPredictions() {
  try {
    console.log('🔮 Testing Predictive Habit Degradation Alerts...\n');
    
    // Get a test user
    const user = await prisma.user.findFirst({
      where: { email: { contains: '@' } }
    });
    
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    
    console.log(`📊 Analyzing habits for user: ${user.email}`);
    
    // Run prediction analysis
    const predictions = await PredictionService.analyzeHabitDegradationRisk(user.id);
    
    console.log(`\n✅ Analysis completed. Found ${predictions.length} predictions:\n`);
    
    if (predictions.length === 0) {
      console.log('🎉 No habit degradation risks detected!');
      console.log('💡 This could mean:');
      console.log('   - User has consistent habits');
      console.log('   - Not enough activity data (need 5+ activities per category)');
      console.log('   - All habits are performing well');
    } else {
      predictions.forEach((prediction, index) => {
        console.log(`${index + 1}. ${prediction.categoryName}`);
        console.log(`   Risk Level: ${prediction.riskLevel.toUpperCase()}`);
        console.log(`   Risk Score: ${Math.round(prediction.riskScore)}%`);
        console.log(`   Frequency Trend: ${prediction.frequencyTrend.toFixed(1)}%`);
        console.log(`   Duration Trend: ${prediction.durationTrend.toFixed(1)}%`);
        console.log(`   Consistency: ${Math.round(prediction.consistencyScore)}%`);
        console.log(`   Days Since Last: ${prediction.daysSinceLastActivity}`);
        console.log(`   Message: ${prediction.message}`);
        console.log(`   Recommendations: ${prediction.recommendations.length} suggestions`);
        console.log('');
      });
    }
    
    // Check notifications created
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: 'habit_degradation_alert'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📢 Generated ${notifications.length} habit degradation alerts`);
    
    if (notifications.length > 0) {
      console.log('\nRecent alerts:');
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title}`);
        console.log(`   ${notif.message}`);
        console.log(`   Created: ${notif.createdAt.toLocaleString()}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPredictions();