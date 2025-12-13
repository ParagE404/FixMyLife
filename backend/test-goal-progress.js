// Simple test script to verify goal progress updates
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGoalProgressUpdate() {
  try {
    console.log('🧪 Testing goal progress update functionality...\n');

    // Find a test user (or create one)
    let testUser = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!testUser) {
      console.log('❌ No test user found. Please create a test user first.');
      return;
    }

    console.log(`✅ Found test user: ${testUser.email}`);

    // Find or create a test category
    let testCategory = await prisma.category.findFirst({
      where: { name: 'Physical Health' }
    });

    if (!testCategory) {
      testCategory = await prisma.category.create({
        data: {
          name: 'Physical Health',
          description: 'Exercise and fitness activities'
        }
      });
    }

    console.log(`✅ Using category: ${testCategory.name}`);

    // Create a test goal
    const testGoal = await prisma.goal.create({
      data: {
        title: 'Test Exercise Goal',
        description: 'Test goal for progress tracking',
        targetHours: 5, // 5 hours per week
        categoryId: testCategory.id,
        userId: testUser.id,
        startDate: new Date(),
        status: 'active'
      }
    });

    console.log(`✅ Created test goal: ${testGoal.title}`);

    // Check initial progress
    let goalProgress = await prisma.goalProgress.findMany({
      where: { goalId: testGoal.id }
    });

    console.log(`📊 Initial progress entries: ${goalProgress.length}`);

    // Create a test activity that should trigger goal progress update
    const testActivity = await prisma.activity.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        description: 'Test workout session',
        startTime: new Date(),
        duration: 60, // 60 minutes = 1 hour
        confidenceScore: 1.0
      }
    });

    console.log(`✅ Created test activity: ${testActivity.description} (${testActivity.duration} minutes)`);

    // Check if goal progress was updated
    goalProgress = await prisma.goalProgress.findMany({
      where: { goalId: testGoal.id }
    });

    console.log(`📊 Progress entries after activity: ${goalProgress.length}`);

    if (goalProgress.length > 0) {
      const totalHours = goalProgress.reduce((sum, p) => sum + p.hoursLogged, 0);
      console.log(`✅ Total hours logged: ${totalHours}`);
      console.log('🎉 Goal progress update is working correctly!');
    } else {
      console.log('❌ Goal progress was not updated automatically');
    }

    // Clean up test data
    await prisma.goalProgress.deleteMany({ where: { goalId: testGoal.id } });
    await prisma.activity.delete({ where: { id: testActivity.id } });
    await prisma.goal.delete({ where: { id: testGoal.id } });

    console.log('\n🧹 Cleaned up test data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGoalProgressUpdate();