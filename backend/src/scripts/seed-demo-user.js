import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Demo user email
const DEMO_EMAIL = 'parag.dharadhar@city.ac.uk';
const DEMO_PASSWORD = 'demo123';
const DEMO_NAME = 'Parag Dharadhar';

// Helper to get random number in range
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Activity templates by category
const activityTemplates = {
  'Physical Health': [
    { desc: 'Morning run in the park', duration: [30, 60] },
    { desc: 'Gym workout - strength training', duration: [45, 90] },
    { desc: 'Yoga session', duration: [30, 60] },
    { desc: 'Swimming laps at the pool', duration: [30, 45] },
    { desc: 'Cycling around the city', duration: [45, 90] },
    { desc: 'HIIT workout at home', duration: [20, 40] },
    { desc: 'Evening walk', duration: [20, 45] },
    { desc: 'Stretching and mobility work', duration: [15, 30] },
    { desc: 'Basketball with friends', duration: [60, 120] },
    { desc: 'Meal prep - healthy cooking', duration: [45, 90] },
  ],
  'Career & Finances': [
    { desc: 'Deep work session - coding project', duration: [60, 180] },
    { desc: 'Team standup and planning meeting', duration: [30, 60] },
    { desc: 'Code review and PR feedback', duration: [30, 60] },
    { desc: 'Learning new framework - online course', duration: [45, 90] },
    { desc: 'Client presentation preparation', duration: [60, 120] },
    { desc: 'Budget review and financial planning', duration: [30, 60] },
    { desc: 'Networking event attendance', duration: [90, 180] },
    { desc: 'Technical documentation writing', duration: [45, 90] },
    { desc: 'Interview preparation', duration: [30, 60] },
    { desc: 'Side project development', duration: [60, 180] },
  ],
  'Relationships': [
    { desc: 'Dinner with family', duration: [60, 120] },
    { desc: 'Video call with parents', duration: [30, 60] },
    { desc: 'Coffee catch-up with friend', duration: [45, 90] },
    { desc: 'Date night', duration: [120, 180] },
    { desc: 'Game night with friends', duration: [120, 240] },
    { desc: 'Helping a friend move', duration: [180, 360] },
    { desc: 'Birthday party attendance', duration: [120, 240] },
    { desc: 'Weekend brunch with colleagues', duration: [60, 120] },
    { desc: 'Phone call with old friend', duration: [30, 60] },
    { desc: 'Family movie night', duration: [90, 150] },
  ],
  'Emotional & Mental Health': [
    { desc: 'Morning meditation', duration: [10, 30] },
    { desc: 'Journaling session', duration: [15, 30] },
    { desc: 'Therapy appointment', duration: [50, 60] },
    { desc: 'Mindfulness practice', duration: [15, 30] },
    { desc: 'Gratitude reflection', duration: [10, 20] },
    { desc: 'Digital detox - no screens', duration: [60, 180] },
    { desc: 'Nature walk for mental clarity', duration: [30, 60] },
    { desc: 'Reading self-help book', duration: [30, 60] },
    { desc: 'Breathing exercises', duration: [10, 20] },
    { desc: 'Relaxation bath and self-care', duration: [30, 60] },
  ],
  'Personal Growth': [
    { desc: 'Reading non-fiction book', duration: [30, 60] },
    { desc: 'Learning Spanish on Duolingo', duration: [15, 30] },
    { desc: 'Piano practice', duration: [30, 60] },
    { desc: 'Photography walk', duration: [60, 120] },
    { desc: 'Cooking new recipe', duration: [45, 90] },
    { desc: 'Writing blog post', duration: [60, 120] },
    { desc: 'Podcast listening - educational', duration: [30, 60] },
    { desc: 'Sketching and drawing', duration: [30, 60] },
    { desc: 'Chess practice online', duration: [30, 60] },
    { desc: 'Woodworking project', duration: [60, 180] },
  ],
};

// Goal templates
const goalTemplates = [
  { title: 'Exercise 5 hours per week', category: 'Physical Health', targetHours: 5, type: 'habit' },
  { title: 'Meditate daily', category: 'Emotional & Mental Health', targetHours: 3.5, type: 'habit' },
  { title: 'Learn Spanish - 30 min daily', category: 'Personal Growth', targetHours: 3.5, type: 'habit' },
  { title: 'Deep work - 20 hours weekly', category: 'Career & Finances', targetHours: 20, type: 'habit' },
  { title: 'Quality time with family', category: 'Relationships', targetHours: 10, type: 'habit' },
  { title: 'Read 2 books this month', category: 'Personal Growth', targetHours: 8, type: 'milestone' },
  { title: 'Complete online course', category: 'Career & Finances', targetHours: 15, type: 'milestone' },
  { title: '30-day yoga challenge', category: 'Physical Health', targetHours: 15, type: 'challenge' },
];

async function main() {
  console.log('🌱 Seeding demo user data for:', DEMO_EMAIL);

  // Ensure categories exist
  const categories = [
    { name: 'Physical Health', description: 'Exercise, sleep, nutrition, medical care', order: 0 },
    { name: 'Career & Finances', description: 'Work, learning, professional development', order: 1 },
    { name: 'Relationships', description: 'Family, friends, romantic partners', order: 2 },
    { name: 'Emotional & Mental Health', description: 'Meditation, therapy, self-care', order: 3 },
    { name: 'Personal Growth', description: 'Hobbies, creativity, skill development', order: 4 },
  ];

  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categoryMap[cat.name] = created.id;
  }
  console.log('✅ Categories ready');

  // Create or update demo user
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
  
  // First, try to delete existing user data to start fresh
  const existingUser = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existingUser) {
    console.log('🗑️  Cleaning up existing user data...');
    await prisma.activity.deleteMany({ where: { userId: existingUser.id } });
    await prisma.goal.deleteMany({ where: { userId: existingUser.id } });
    await prisma.notification.deleteMany({ where: { userId: existingUser.id } });
    await prisma.insight.deleteMany({ where: { userId: existingUser.id } });
    await prisma.patternSuggestion.deleteMany({ where: { userId: existingUser.id } });
    await prisma.activitySuggestion.deleteMany({ where: { userId: existingUser.id } });
    await prisma.userPatterns.deleteMany({ where: { userId: existingUser.id } });
    await prisma.correlationAnalysis.deleteMany({ where: { userId: existingUser.id } });
    await prisma.dailyAggregate.deleteMany({ where: { userId: existingUser.id } });
    await prisma.weeklyAggregate.deleteMany({ where: { userId: existingUser.id } });
    await prisma.streak.deleteMany({ where: { userId: existingUser.id } });
    await prisma.milestone.deleteMany({ where: { userId: existingUser.id } });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { 
      name: DEMO_NAME,
      password: hashedPassword,
      onboardingCompleted: true,
    },
    create: {
      email: DEMO_EMAIL,
      password: hashedPassword,
      name: DEMO_NAME,
      timezone: 'Europe/London',
      onboardingCompleted: true,
      preferences: {
        create: {
          notificationsEnabled: true,
          dailyReminders: true,
          weeklyReports: true,
          goalAchievements: true,
          streakAlerts: true,
          theme: 'system',
          accentColor: 'green',
        },
      },
    },
  });

  console.log('✅ Demo user created:', { email: demoUser.email, password: DEMO_PASSWORD });

  // Generate activities for the past 90 days
  console.log('📝 Generating activities for past 90 days...');
  const today = new Date();
  const activities = [];

  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    
    // Skip some days randomly (10% chance) to make it realistic
    if (Math.random() < 0.1 && daysAgo > 7) continue;

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Morning routine (6-9 AM)
    if (Math.random() > 0.2) {
      const morningActivities = ['Physical Health', 'Emotional & Mental Health'];
      const category = morningActivities[random(0, 1)];
      const templates = activityTemplates[category];
      const template = templates[random(0, templates.length - 1)];
      
      const startHour = random(6, 8);
      const startTime = new Date(date);
      startTime.setHours(startHour, random(0, 30), 0, 0);
      
      const duration = random(template.duration[0], template.duration[1]);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      
      activities.push({
        userId: demoUser.id,
        description: template.desc,
        categoryId: categoryMap[category],
        startTime,
        endTime,
        duration,
        confidenceScore: randomFloat(0.85, 0.98),
      });
    }

    // Work hours (9 AM - 6 PM) - more on weekdays
    if (!isWeekend || Math.random() > 0.7) {
      const workSessions = isWeekend ? random(0, 2) : random(2, 4);
      let currentHour = 9;
      
      for (let i = 0; i < workSessions; i++) {
        const category = Math.random() > 0.3 ? 'Career & Finances' : 'Personal Growth';
        const templates = activityTemplates[category];
        const template = templates[random(0, templates.length - 1)];
        
        const startTime = new Date(date);
        startTime.setHours(currentHour, random(0, 30), 0, 0);
        
        const duration = random(template.duration[0], template.duration[1]);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        activities.push({
          userId: demoUser.id,
          description: template.desc,
          categoryId: categoryMap[category],
          startTime,
          endTime,
          duration,
          confidenceScore: randomFloat(0.85, 0.98),
        });
        
        currentHour += Math.ceil(duration / 60) + random(0, 1);
        if (currentHour >= 18) break;
      }
    }

    // Evening activities (6-10 PM)
    if (Math.random() > 0.15) {
      const eveningCategories = isWeekend 
        ? ['Relationships', 'Personal Growth', 'Physical Health']
        : ['Relationships', 'Emotional & Mental Health', 'Personal Growth'];
      
      const numActivities = random(1, 2);
      let currentHour = 18;
      
      for (let i = 0; i < numActivities; i++) {
        const category = eveningCategories[random(0, eveningCategories.length - 1)];
        const templates = activityTemplates[category];
        const template = templates[random(0, templates.length - 1)];
        
        const startTime = new Date(date);
        startTime.setHours(currentHour, random(0, 45), 0, 0);
        
        const duration = random(template.duration[0], template.duration[1]);
        const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        
        activities.push({
          userId: demoUser.id,
          description: template.desc,
          categoryId: categoryMap[category],
          startTime,
          endTime,
          duration,
          confidenceScore: randomFloat(0.85, 0.98),
        });
        
        currentHour += Math.ceil(duration / 60) + 1;
        if (currentHour >= 22) break;
      }
    }
  }

  // Batch insert activities
  await prisma.activity.createMany({ data: activities });
  console.log(`✅ Created ${activities.length} activities`);

  // Create goals
  console.log('🎯 Creating goals...');
  const goals = [];
  const goalStartDate = new Date(today);
  goalStartDate.setDate(goalStartDate.getDate() - 30);

  for (const goalTemplate of goalTemplates) {
    const goal = await prisma.goal.create({
      data: {
        userId: demoUser.id,
        title: goalTemplate.title,
        description: `Track and improve ${goalTemplate.category.toLowerCase()} activities`,
        targetHours: goalTemplate.targetHours,
        goalType: goalTemplate.type,
        categoryId: categoryMap[goalTemplate.category],
        startDate: goalStartDate,
        endDate: goalTemplate.type === 'habit' ? null : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });
    goals.push(goal);
  }
  console.log(`✅ Created ${goals.length} goals`);

  // Create goal progress for each goal
  console.log('📊 Creating goal progress...');
  for (const goal of goals) {
    for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
      const progressDate = new Date(today);
      progressDate.setDate(progressDate.getDate() - daysAgo);
      progressDate.setHours(0, 0, 0, 0);
      
      // Simulate varying progress
      const baseProgress = goal.targetHours / 7; // Daily target
      const variance = randomFloat(0.5, 1.5);
      const hoursLogged = Math.max(0, baseProgress * variance);
      
      if (hoursLogged > 0) {
        await prisma.goalProgress.create({
          data: {
            goalId: goal.id,
            date: progressDate,
            hoursLogged: Math.round(hoursLogged * 100) / 100,
          },
        });
      }
    }
  }
  console.log('✅ Goal progress created');

  // Create streaks
  console.log('🔥 Creating streaks...');
  const streakData = [
    { categoryId: categoryMap['Physical Health'], currentCount: 12, bestCount: 21 },
    { categoryId: categoryMap['Emotional & Mental Health'], currentCount: 8, bestCount: 15 },
    { categoryId: categoryMap['Career & Finances'], currentCount: 25, bestCount: 30 },
    { categoryId: categoryMap['Personal Growth'], currentCount: 5, bestCount: 14 },
    { categoryId: categoryMap['Relationships'], currentCount: 3, bestCount: 7 },
  ];

  for (const streak of streakData) {
    await prisma.streak.create({
      data: {
        userId: demoUser.id,
        categoryId: streak.categoryId,
        currentCount: streak.currentCount,
        bestCount: streak.bestCount,
        lastActivityDate: new Date(),
      },
    });
  }
  console.log('✅ Streaks created');

  // Create milestones
  console.log('🏆 Creating milestones...');
  const milestones = [
    { milestoneType: 'logging_7day', achieved: true, achievedAt: new Date(today.getTime() - 83 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'logging_30day', achieved: true, achievedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'activities_50', achieved: true, achievedAt: new Date(today.getTime() - 70 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'activities_100', achieved: true, achievedAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'activities_250', achieved: true, achievedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'exercise_streak_7', achieved: true, achievedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'meditation_streak_7', achieved: true, achievedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'goal_completed', achieved: true, achievedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { milestoneType: 'activities_500', achieved: false },
    { milestoneType: 'logging_90day', achieved: false },
  ];

  for (const milestone of milestones) {
    await prisma.milestone.create({
      data: {
        userId: demoUser.id,
        ...milestone,
      },
    });
  }
  console.log('✅ Milestones created');

  // Create insights
  console.log('💡 Creating insights...');
  const insights = [
    { type: 'milestone', title: '250 Activities Logged!', message: 'You\'ve logged 250 activities. Your consistency is paying off!' },
    { type: 'trend', title: 'Exercise Up 25%', message: 'Your physical activity has increased by 25% compared to last month. Keep it up!' },
    { type: 'trend', title: 'Morning Routine Established', message: 'You\'ve been consistently starting your day with exercise or meditation for 2 weeks.' },
    { type: 'recommendation', title: 'Try Evening Meditation', message: 'Based on your patterns, adding evening meditation could improve your sleep quality.' },
    { type: 'recommendation', title: 'Weekend Balance', message: 'Consider adding more relationship activities on weekends for better work-life balance.' },
    { type: 'warning', title: 'Career Focus Increasing', message: 'Work hours have increased 15% this week. Remember to maintain balance.' },
    { type: 'milestone', title: '30-Day Streak!', message: 'You\'ve logged activities for 30 consecutive days. Amazing dedication!' },
    { type: 'trend', title: 'Personal Growth Trending', message: 'Your learning activities have doubled this month. Great investment in yourself!' },
  ];

  for (let i = 0; i < insights.length; i++) {
    await prisma.insight.create({
      data: {
        userId: demoUser.id,
        ...insights[i],
        isRead: i < 3, // First 3 are read
        createdAt: new Date(today.getTime() - i * 3 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Insights created');

  // Create notifications
  console.log('🔔 Creating notifications...');
  const notifications = [
    { type: 'streak', title: '🔥 12-Day Exercise Streak!', message: 'You\'re on fire! Keep your exercise streak going.' },
    { type: 'milestone', title: '🏆 Goal Achieved!', message: 'You completed your "Exercise 5 hours per week" goal!' },
    { type: 'goal_alert', title: '⚠️ Goal at Risk', message: 'Your meditation goal is 30% behind this week. Log some mindfulness time!' },
    { type: 'recommendation', title: '💡 Perfect Time for Yoga', message: 'Based on your schedule, 6 PM today would be ideal for yoga.' },
    { type: 'streak', title: '🎉 New Personal Best!', message: 'You\'ve set a new record: 25-day career activities streak!' },
    { type: 'milestone', title: '📚 Learning Milestone', message: 'You\'ve spent 50 hours on personal growth this month!' },
  ];

  for (let i = 0; i < notifications.length; i++) {
    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        ...notifications[i],
        read: i < 2,
        createdAt: new Date(today.getTime() - i * 2 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Notifications created');

  // Create user patterns
  console.log('🧠 Creating behavioral patterns...');
  const patterns = {
    dailyPatterns: {
      morning: { 
        preferredActivities: ['Physical Health', 'Emotional & Mental Health'],
        peakHours: [7, 8],
        consistency: 0.85
      },
      afternoon: {
        preferredActivities: ['Career & Finances'],
        peakHours: [10, 11, 14, 15],
        consistency: 0.92
      },
      evening: {
        preferredActivities: ['Relationships', 'Personal Growth'],
        peakHours: [19, 20],
        consistency: 0.78
      }
    },
    weeklyPatterns: {
      mostActiveDay: 'Tuesday',
      leastActiveDay: 'Sunday',
      weekdayAvgActivities: 4.2,
      weekendAvgActivities: 2.8
    },
    categoryPatterns: {
      'Physical Health': { frequency: 'daily', avgDuration: 45, trend: 'increasing' },
      'Career & Finances': { frequency: 'daily', avgDuration: 180, trend: 'stable' },
      'Relationships': { frequency: 'weekly', avgDuration: 90, trend: 'stable' },
      'Emotional & Mental Health': { frequency: 'daily', avgDuration: 25, trend: 'increasing' },
      'Personal Growth': { frequency: 'daily', avgDuration: 45, trend: 'increasing' }
    },
    habitSequences: [
      { sequence: ['Morning meditation', 'Morning run'], frequency: 0.7 },
      { sequence: ['Deep work session', 'Coffee break', 'Code review'], frequency: 0.8 },
      { sequence: ['Evening walk', 'Dinner with family'], frequency: 0.6 }
    ]
  };

  await prisma.userPatterns.create({
    data: {
      userId: demoUser.id,
      patterns: patterns,
      lastAnalyzed: new Date(),
    },
  });
  console.log('✅ User patterns created');

  // Create correlation analysis
  console.log('🔗 Creating correlation analysis...');
  const correlations = [
    { category1: 'Physical Health', category2: 'Emotional & Mental Health', correlation: 0.72, strength: 'strong', direction: 'positive' },
    { category1: 'Physical Health', category2: 'Career & Finances', correlation: 0.45, strength: 'moderate', direction: 'positive' },
    { category1: 'Emotional & Mental Health', category2: 'Personal Growth', correlation: 0.68, strength: 'strong', direction: 'positive' },
    { category1: 'Career & Finances', category2: 'Relationships', correlation: -0.32, strength: 'moderate', direction: 'negative' },
    { category1: 'Physical Health', category2: 'Personal Growth', correlation: 0.55, strength: 'moderate', direction: 'positive' },
  ];

  const correlationInsights = [
    { insight: 'Exercise boosts mental clarity', description: 'Days with morning exercise show 40% more productive work sessions', confidence: 0.85 },
    { insight: 'Meditation improves focus', description: 'Meditation before work correlates with longer deep work sessions', confidence: 0.78 },
    { insight: 'Social time affects mood', description: 'Weeks with more relationship activities show better emotional health scores', confidence: 0.72 },
    { insight: 'Work-life balance pattern', description: 'High work weeks tend to reduce relationship time - consider scheduling social activities', confidence: 0.65 },
  ];

  const predictions = [
    { prediction: 'Likely to exercise tomorrow morning', confidence: 0.88, basedOn: 'Morning exercise pattern detected on weekdays' },
    { prediction: 'May skip meditation this weekend', confidence: 0.65, basedOn: 'Weekend meditation frequency is 40% lower' },
    { prediction: 'Deep work session expected 10 AM', confidence: 0.82, basedOn: 'Consistent work pattern on weekdays' },
    { prediction: 'Family time likely Saturday evening', confidence: 0.75, basedOn: 'Regular weekend family activities' },
  ];

  await prisma.correlationAnalysis.create({
    data: {
      userId: demoUser.id,
      correlations: correlations,
      insights: correlationInsights,
      predictions: predictions,
      dataPoints: activities.length,
      lastAnalyzed: new Date(),
    },
  });
  console.log('✅ Correlation analysis created');

  // Create pattern suggestions
  console.log('💭 Creating pattern suggestions...');
  const patternSuggestions = [
    { 
      type: 'habit_resumption', 
      category: 'Physical Health', 
      title: 'Time for your morning run?',
      message: 'You usually go for a run around this time. Ready to lace up?',
      priority: 'high',
      confidence: 0.88,
      timing: 'immediate',
      actionType: 'log_activity'
    },
    {
      type: 'upcoming_habit',
      category: 'Emotional & Mental Health',
      title: 'Meditation session coming up',
      message: 'Based on your routine, you typically meditate in 30 minutes.',
      priority: 'medium',
      confidence: 0.75,
      timing: 'upcoming',
      actionType: 'prepare_activity'
    },
    {
      type: 'sequence_suggestion',
      category: 'Career & Finances',
      title: 'Deep work time',
      message: 'After your morning routine, you usually start a deep work session. Ready to focus?',
      priority: 'high',
      confidence: 0.82,
      timing: 'sequence',
      actionType: 'log_activity'
    },
    {
      type: 'weekly_habit',
      category: 'Relationships',
      title: 'Weekend family time',
      message: 'You often spend Saturday evenings with family. Any plans today?',
      priority: 'medium',
      confidence: 0.70,
      timing: 'weekly',
      actionType: 'reminder'
    },
  ];

  for (const suggestion of patternSuggestions) {
    await prisma.patternSuggestion.create({
      data: {
        userId: demoUser.id,
        ...suggestion,
        isRead: false,
        isActedOn: false,
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Pattern suggestions created');

  // Create activity suggestions (autocomplete)
  console.log('📝 Creating activity suggestions...');
  const activitySuggestions = [
    { description: 'Morning run in the park', categoryId: categoryMap['Physical Health'], frequency: 45 },
    { description: 'Gym workout - strength training', categoryId: categoryMap['Physical Health'], frequency: 38 },
    { description: 'Morning meditation', categoryId: categoryMap['Emotional & Mental Health'], frequency: 52 },
    { description: 'Deep work session - coding project', categoryId: categoryMap['Career & Finances'], frequency: 60 },
    { description: 'Team standup and planning meeting', categoryId: categoryMap['Career & Finances'], frequency: 35 },
    { description: 'Dinner with family', categoryId: categoryMap['Relationships'], frequency: 28 },
    { description: 'Reading non-fiction book', categoryId: categoryMap['Personal Growth'], frequency: 32 },
    { description: 'Learning Spanish on Duolingo', categoryId: categoryMap['Personal Growth'], frequency: 40 },
    { description: 'Yoga session', categoryId: categoryMap['Physical Health'], frequency: 25 },
    { description: 'Journaling session', categoryId: categoryMap['Emotional & Mental Health'], frequency: 30 },
  ];

  for (const suggestion of activitySuggestions) {
    await prisma.activitySuggestion.create({
      data: {
        userId: demoUser.id,
        description: suggestion.description,
        categoryId: suggestion.categoryId,
        frequency: suggestion.frequency,
        lastUsed: new Date(today.getTime() - random(0, 7) * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Activity suggestions created');

  // Create daily aggregates for the past 30 days
  console.log('📈 Creating daily aggregates...');
  for (let daysAgo = 0; daysAgo < 30; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(0, 0, 0, 0);

    const dayActivities = activities.filter(a => {
      const actDate = new Date(a.startTime);
      return actDate.toDateString() === date.toDateString();
    });

    const categoryBreakdown = {};
    let totalDuration = 0;

    for (const activity of dayActivities) {
      const catId = activity.categoryId;
      if (!categoryBreakdown[catId]) categoryBreakdown[catId] = 0;
      categoryBreakdown[catId] += activity.duration / 60; // Convert to hours
      totalDuration += activity.duration;
    }

    await prisma.dailyAggregate.create({
      data: {
        userId: demoUser.id,
        date: date,
        totalActivities: dayActivities.length,
        totalDuration: totalDuration,
        categoryBreakdown: categoryBreakdown,
      },
    });
  }
  console.log('✅ Daily aggregates created');

  // Create weekly aggregates for the past 12 weeks
  console.log('📊 Creating weekly aggregates...');
  for (let weeksAgo = 0; weeksAgo < 12; weeksAgo++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - (weeksAgo * 7)); // Monday
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekActivities = activities.filter(a => {
      const actDate = new Date(a.startTime);
      return actDate >= weekStart && actDate < weekEnd;
    });

    const categoryBreakdown = {};
    let totalHours = 0;

    for (const activity of weekActivities) {
      const catId = activity.categoryId;
      if (!categoryBreakdown[catId]) categoryBreakdown[catId] = 0;
      const hours = activity.duration / 60;
      categoryBreakdown[catId] += hours;
      totalHours += hours;
    }

    await prisma.weeklyAggregate.create({
      data: {
        userId: demoUser.id,
        weekStart: weekStart,
        totalHours: Math.round(totalHours),
        categoryBreakdown: categoryBreakdown,
      },
    });
  }
  console.log('✅ Weekly aggregates created');

  console.log('\n🎉 Demo user seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email: ${DEMO_EMAIL}`);
  console.log(`🔑 Password: ${DEMO_PASSWORD}`);
  console.log(`📝 Activities: ${activities.length}`);
  console.log(`🎯 Goals: ${goals.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding demo user:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
