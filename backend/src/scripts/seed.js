import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default categories
  const categories = [
    { name: 'Physical Health', description: 'Exercise, sleep, nutrition, medical care', order: 0 },
    { name: 'Career & Finances', description: 'Work, learning, professional development', order: 1 },
    { name: 'Relationships', description: 'Family, friends, romantic partners', order: 2 },
    { name: 'Emotional & Mental Health', description: 'Meditation, therapy, self-care', order: 3 },
    { name: 'Personal Growth', description: 'Hobbies, creativity, skill development', order: 4 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories seeded');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
      timezone: 'UTC',
      preferences: {
        create: {},
      },
    },
  });

  console.log('✅ Demo user created:', { email: demoUser.email, password: 'password123' });

  // Create sample activities for demo
  const physicalCategory = await prisma.category.findUnique({
    where: { name: 'Physical Health' },
  });

  const careerCategory = await prisma.category.findUnique({
    where: { name: 'Career & Finances' },
  });

  // Add activities from past 2 weeks
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const activityDate = new Date(today);
    activityDate.setDate(activityDate.getDate() - i);
    activityDate.setHours(9, 0, 0, 0);

    const workoutEndTime = new Date(activityDate.getTime() + 60 * 60 * 1000); // 1 hour
    await prisma.activity.create({
      data: {
        userId: demoUser.id,
        description: 'Morning workout',
        categoryId: physicalCategory.id,
        startTime: activityDate,
        endTime: workoutEndTime,
        duration: 60, // 60 minutes
        confidenceScore: 0.95,
      },
    });

    const workDate = new Date(activityDate);
    workDate.setHours(10, 0, 0, 0);
    const workEndTime = new Date(workDate.getTime() + 480 * 60 * 1000); // 8 hours
    await prisma.activity.create({
      data: {
        userId: demoUser.id,
        description: 'Work session',
        categoryId: careerCategory.id,
        startTime: workDate,
        endTime: workEndTime,
        duration: 480, // 480 minutes (8 hours)
        confidenceScore: 0.9,
      },
    });
  }

  console.log('✅ Sample activities created');
  console.log('\n🚀 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
