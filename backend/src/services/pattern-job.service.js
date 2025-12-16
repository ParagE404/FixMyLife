import { PrismaClient } from '@prisma/client';
import { checkPatternsAndSuggest } from './pattern-recognition.service.js';
import { storePatternSuggestions, cleanupExpiredSuggestions } from './pattern-suggestions.service.js';

const prisma = new PrismaClient();

/**
 * Pattern Job Service
 * Handles background processing of pattern analysis and suggestion generation
 */

// Run pattern analysis for all active users
export const runPatternAnalysisJob = async () => {
  try {
    console.log('🔍 Starting pattern analysis job...');
    
    // Get all users who have been active in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeUsers = await prisma.user.findMany({
      where: {
        activities: {
          some: {
            startTime: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`📊 Found ${activeUsers.length} active users for pattern analysis`);

    let processedUsers = 0;
    let totalSuggestions = 0;

    // Process each user
    for (const user of activeUsers) {
      try {
        // Check if user already has recent pattern analysis (within last 2 hours)
        const recentAnalysis = await prisma.userPatterns.findFirst({
          where: {
            userId: user.id,
            lastAnalyzed: {
              gte: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
          },
        });

        if (recentAnalysis) {
          console.log(`⏭️  Skipping ${user.email} - recent analysis exists`);
          continue;
        }

        // Run pattern analysis
        const result = await checkPatternsAndSuggest(user.id);
        
        if (result.suggestions && result.suggestions.length > 0) {
          // Store suggestions
          const storedCount = await storePatternSuggestions(user.id, result.suggestions);
          totalSuggestions += storedCount;
          
          console.log(`✅ Processed ${user.email}: ${storedCount} suggestions generated`);
        } else {
          console.log(`✅ Processed ${user.email}: no suggestions needed`);
        }
        
        processedUsers++;
        
        // Add small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (userError) {
        console.error(`❌ Error processing user ${user.email}:`, userError.message);
      }
    }

    // Cleanup expired suggestions
    const cleanedUp = await cleanupExpiredSuggestions();
    
    console.log(`🧹 Pattern analysis job completed:`);
    console.log(`   - Processed: ${processedUsers}/${activeUsers.length} users`);
    console.log(`   - Generated: ${totalSuggestions} suggestions`);
    console.log(`   - Cleaned up: ${cleanedUp} expired suggestions`);

    return {
      processedUsers,
      totalUsers: activeUsers.length,
      totalSuggestions,
      cleanedUpSuggestions: cleanedUp,
    };
    
  } catch (error) {
    console.error('❌ Pattern analysis job error:', error);
    throw error;
  }
};

// Check patterns for a specific user (on-demand)
export const runUserPatternCheck = async (userId) => {
  try {
    console.log(`🔍 Running pattern check for user ${userId}...`);
    
    const result = await checkPatternsAndSuggest(userId);
    
    if (result.suggestions && result.suggestions.length > 0) {
      const storedCount = await storePatternSuggestions(userId, result.suggestions);
      console.log(`✅ Generated ${storedCount} suggestions for user ${userId}`);
      return { suggestionsGenerated: storedCount, ...result };
    }
    
    console.log(`✅ No suggestions needed for user ${userId}`);
    return { suggestionsGenerated: 0, ...result };
    
  } catch (error) {
    console.error(`❌ Pattern check error for user ${userId}:`, error);
    throw error;
  }
};

// Initialize pattern analysis scheduler
export const initializePatternScheduler = () => {
  console.log('🚀 Initializing pattern analysis scheduler...');
  
  // Run pattern analysis every 2 hours
  const PATTERN_CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
  
  setInterval(async () => {
    try {
      await runPatternAnalysisJob();
    } catch (error) {
      console.error('❌ Scheduled pattern analysis failed:', error);
    }
  }, PATTERN_CHECK_INTERVAL);
  
  // Run cleanup every hour
  const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
  
  setInterval(async () => {
    try {
      const cleaned = await cleanupExpiredSuggestions();
      if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} expired suggestions`);
      }
    } catch (error) {
      console.error('❌ Suggestion cleanup failed:', error);
    }
  }, CLEANUP_INTERVAL);
  
  console.log('✅ Pattern scheduler initialized');
  console.log(`   - Pattern analysis: every ${PATTERN_CHECK_INTERVAL / (60 * 60 * 1000)} hours`);
  console.log(`   - Cleanup: every ${CLEANUP_INTERVAL / (60 * 60 * 1000)} hour`);
};

// Get job status and statistics
export const getPatternJobStatus = async () => {
  try {
    // Get recent pattern analyses
    const recentAnalyses = await prisma.userPatterns.count({
      where: {
        lastAnalyzed: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Get active suggestions
    const activeSuggestions = await prisma.patternSuggestion.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        isRead: false,
      },
    });

    // Get suggestion stats for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [totalSuggestions, actedOnSuggestions] = await Promise.all([
      prisma.patternSuggestion.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.patternSuggestion.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
          isActedOn: true,
        },
      }),
    ]);

    const actionRate = totalSuggestions > 0 ? (actedOnSuggestions / totalSuggestions) * 100 : 0;

    return {
      recentAnalyses,
      activeSuggestions,
      weeklyStats: {
        totalSuggestions,
        actedOnSuggestions,
        actionRate: Math.round(actionRate),
      },
      lastJobRun: new Date(), // This would be stored in a job status table in production
    };
  } catch (error) {
    console.error('Get pattern job status error:', error);
    throw error;
  }
};