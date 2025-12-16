import { PrismaClient } from '@prisma/client';
import { storePatternSuggestions, getActivePatternSuggestions } from './pattern-suggestions.service.js';

const prisma = new PrismaClient();

// Constants for pattern analysis
const PATTERN_ANALYSIS_DAYS = 30; // Analyze last 30 days for patterns
const MIN_OCCURRENCES = 3; // Minimum occurrences to establish a pattern
const DEVIATION_THRESHOLD = 2; // Hours deviation to trigger suggestion
const TIME_WINDOW_HOURS = 2; // ±2 hours window for pattern matching

/**
 * Behavioral Pattern Recognition Engine
 * Analyzes user activity patterns and detects deviations
 */

// Main function to analyze patterns and generate suggestions
export const analyzeUserPatterns = async (userId) => {
  try {
    const patterns = await detectTemporalPatterns(userId);
    const deviations = await detectPatternDeviations(userId, patterns);
    const suggestions = await generateProactiveSuggestions(userId, patterns, deviations);
    
    return {
      patterns,
      deviations,
      suggestions,
      analysisDate: new Date(),
    };
  } catch (error) {
    console.error('Pattern analysis error:', error);
    throw error;
  }
};

// Detect temporal patterns in user activities
export const detectTemporalPatterns = async (userId) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - PATTERN_ANALYSIS_DAYS);

    // Get activities for pattern analysis
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
        customCategory: true,
      },
      orderBy: { startTime: 'asc' },
    });

    const patterns = {
      daily: await analyzeDailyPatterns(activities),
      weekly: await analyzeWeeklyPatterns(activities),
      category: await analyzeCategoryPatterns(activities),
      temporal: await analyzeTemporalSequences(activities),
    };

    // Store patterns for future reference
    await storeUserPatterns(userId, patterns);

    return patterns;
  } catch (error) {
    console.error('Temporal pattern detection error:', error);
    throw error;
  }
};

// Analyze daily activity patterns
const analyzeDailyPatterns = async (activities) => {
  const dailyPatterns = {};
  
  activities.forEach(activity => {
    const hour = activity.startTime.getHours();
    const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
    const dayOfWeek = activity.startTime.getDay();
    
    const key = `${categoryName}_${hour}`;
    
    if (!dailyPatterns[key]) {
      dailyPatterns[key] = {
        category: categoryName,
        hour,
        occurrences: 0,
        days: new Set(),
        averageDuration: 0,
        totalDuration: 0,
        confidence: 0,
      };
    }
    
    dailyPatterns[key].occurrences++;
    dailyPatterns[key].days.add(activity.startTime.toDateString());
    
    if (activity.duration) {
      dailyPatterns[key].totalDuration += activity.duration;
      dailyPatterns[key].averageDuration = dailyPatterns[key].totalDuration / dailyPatterns[key].occurrences;
    }
  });

  // Calculate confidence scores and filter significant patterns
  const significantPatterns = Object.values(dailyPatterns)
    .filter(pattern => pattern.occurrences >= MIN_OCCURRENCES)
    .map(pattern => {
      pattern.confidence = Math.min(pattern.occurrences / PATTERN_ANALYSIS_DAYS, 1.0);
      pattern.days = Array.from(pattern.days);
      return pattern;
    })
    .sort((a, b) => b.confidence - a.confidence);

  return significantPatterns;
};

// Analyze weekly patterns (day of week preferences)
const analyzeWeeklyPatterns = async (activities) => {
  const weeklyPatterns = {};
  
  activities.forEach(activity => {
    const dayOfWeek = activity.startTime.getDay();
    const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
    const key = `${categoryName}_${dayOfWeek}`;
    
    if (!weeklyPatterns[key]) {
      weeklyPatterns[key] = {
        category: categoryName,
        dayOfWeek,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        occurrences: 0,
        averageDuration: 0,
        totalDuration: 0,
      };
    }
    
    weeklyPatterns[key].occurrences++;
    if (activity.duration) {
      weeklyPatterns[key].totalDuration += activity.duration;
      weeklyPatterns[key].averageDuration = weeklyPatterns[key].totalDuration / weeklyPatterns[key].occurrences;
    }
  });

  return Object.values(weeklyPatterns)
    .filter(pattern => pattern.occurrences >= MIN_OCCURRENCES)
    .sort((a, b) => b.occurrences - a.occurrences);
};

// Analyze category-specific patterns
const analyzeCategoryPatterns = async (activities) => {
  const categoryPatterns = {};
  
  activities.forEach(activity => {
    const categoryName = activity.category?.name || activity.customCategory?.name || 'Other';
    
    if (!categoryPatterns[categoryName]) {
      categoryPatterns[categoryName] = {
        category: categoryName,
        totalActivities: 0,
        averageFrequency: 0,
        preferredTimes: [],
        preferredDays: [],
        averageDuration: 0,
        totalDuration: 0,
      };
    }
    
    const pattern = categoryPatterns[categoryName];
    pattern.totalActivities++;
    
    if (activity.duration) {
      pattern.totalDuration += activity.duration;
      pattern.averageDuration = pattern.totalDuration / pattern.totalActivities;
    }
    
    // Track preferred times
    const hour = activity.startTime.getHours();
    pattern.preferredTimes.push(hour);
    
    // Track preferred days
    const dayOfWeek = activity.startTime.getDay();
    pattern.preferredDays.push(dayOfWeek);
  });

  // Process preferred times and days
  Object.values(categoryPatterns).forEach(pattern => {
    // Calculate most common hours
    const hourCounts = {};
    pattern.preferredTimes.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    pattern.preferredTimes = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Calculate most common days
    const dayCounts = {};
    pattern.preferredDays.forEach(day => {
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    pattern.preferredDays = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day, count]) => ({ 
        day: parseInt(day), 
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
        count 
      }));

    // Calculate frequency (activities per week)
    pattern.averageFrequency = (pattern.totalActivities / PATTERN_ANALYSIS_DAYS) * 7;
  });

  return Object.values(categoryPatterns)
    .filter(pattern => pattern.totalActivities >= MIN_OCCURRENCES)
    .sort((a, b) => b.totalActivities - a.totalActivities);
};

// Analyze temporal sequences (activity chains)
const analyzeTemporalSequences = async (activities) => {
  const sequences = [];
  
  // Group activities by day
  const activitiesByDay = {};
  activities.forEach(activity => {
    const dayKey = activity.startTime.toDateString();
    if (!activitiesByDay[dayKey]) {
      activitiesByDay[dayKey] = [];
    }
    activitiesByDay[dayKey].push(activity);
  });

  // Analyze sequences within each day
  Object.values(activitiesByDay).forEach(dayActivities => {
    dayActivities.sort((a, b) => a.startTime - b.startTime);
    
    for (let i = 0; i < dayActivities.length - 1; i++) {
      const current = dayActivities[i];
      const next = dayActivities[i + 1];
      
      const currentCategory = current.category?.name || current.customCategory?.name || 'Other';
      const nextCategory = next.category?.name || next.customCategory?.name || 'Other';
      
      const timeDiff = (next.startTime - current.startTime) / (1000 * 60 * 60); // hours
      
      if (timeDiff <= 6) { // Only consider sequences within 6 hours
        sequences.push({
          from: currentCategory,
          to: nextCategory,
          timeDiff,
          fromHour: current.startTime.getHours(),
          toHour: next.startTime.getHours(),
        });
      }
    }
  });

  // Find common sequences
  const sequenceCounts = {};
  sequences.forEach(seq => {
    const key = `${seq.from}_${seq.to}`;
    if (!sequenceCounts[key]) {
      sequenceCounts[key] = {
        from: seq.from,
        to: seq.to,
        count: 0,
        averageTimeDiff: 0,
        totalTimeDiff: 0,
      };
    }
    
    sequenceCounts[key].count++;
    sequenceCounts[key].totalTimeDiff += seq.timeDiff;
    sequenceCounts[key].averageTimeDiff = sequenceCounts[key].totalTimeDiff / sequenceCounts[key].count;
  });

  return Object.values(sequenceCounts)
    .filter(seq => seq.count >= MIN_OCCURRENCES)
    .sort((a, b) => b.count - a.count);
};

// Detect deviations from established patterns
export const detectPatternDeviations = async (userId, patterns) => {
  try {
    const today = new Date();
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Get today's activities
    const todayActivities = await prisma.activity.findMany({
      where: {
        userId,
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        category: true,
        customCategory: true,
      },
    });

    const deviations = [];
    const currentHour = today.getHours();

    // Check for missed patterns
    patterns.daily.forEach(pattern => {
      if (pattern.confidence > 0.3 && pattern.hour <= currentHour) {
        const hasMatchingActivity = todayActivities.some(activity => {
          const activityCategory = activity.category?.name || activity.customCategory?.name || 'Other';
          const activityHour = activity.startTime.getHours();
          
          return activityCategory === pattern.category && 
                 Math.abs(activityHour - pattern.hour) <= TIME_WINDOW_HOURS;
        });

        if (!hasMatchingActivity) {
          deviations.push({
            type: 'missed_pattern',
            category: pattern.category,
            expectedHour: pattern.hour,
            confidence: pattern.confidence,
            message: `You usually ${pattern.category.toLowerCase()} around ${formatHour(pattern.hour)}`,
          });
        }
      }
    });

    // Check for unusual timing
    todayActivities.forEach(activity => {
      const activityCategory = activity.category?.name || activity.customCategory?.name || 'Other';
      const activityHour = activity.startTime.getHours();
      
      const matchingPatterns = patterns.daily.filter(p => p.category === activityCategory);
      
      if (matchingPatterns.length > 0) {
        const isUnusualTime = !matchingPatterns.some(pattern => 
          Math.abs(pattern.hour - activityHour) <= TIME_WINDOW_HOURS
        );
        
        if (isUnusualTime) {
          deviations.push({
            type: 'unusual_timing',
            category: activityCategory,
            actualHour: activityHour,
            expectedHours: matchingPatterns.map(p => p.hour),
            message: `Unusual time for ${activityCategory.toLowerCase()} - you typically do this around ${matchingPatterns.map(p => formatHour(p.hour)).join(' or ')}`,
          });
        }
      }
    });

    return deviations;
  } catch (error) {
    console.error('Pattern deviation detection error:', error);
    throw error;
  }
};

// Generate proactive suggestions based on patterns and deviations
export const generateProactiveSuggestions = async (userId, patterns, deviations) => {
  try {
    const suggestions = [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Suggestions for missed patterns
    deviations
      .filter(d => d.type === 'missed_pattern')
      .forEach(deviation => {
        suggestions.push({
          type: 'habit_resumption',
          priority: 'high',
          category: deviation.category,
          title: `Time for ${deviation.category}?`,
          message: `${deviation.message}. Would you like to log this activity now?`,
          suggestedAction: 'log_activity',
          confidence: deviation.confidence,
          timing: 'immediate',
        });
      });

    // Suggestions for upcoming patterns
    patterns.daily
      .filter(pattern => {
        const timeDiff = pattern.hour - currentHour;
        return timeDiff > 0 && timeDiff <= 2 && pattern.confidence > 0.4;
      })
      .forEach(pattern => {
        suggestions.push({
          type: 'upcoming_habit',
          priority: 'medium',
          category: pattern.category,
          title: `Upcoming: ${pattern.category}`,
          message: `You usually ${pattern.category.toLowerCase()} in ${pattern.hour - currentHour} hour(s). Want to prepare?`,
          suggestedAction: 'prepare_activity',
          confidence: pattern.confidence,
          timing: 'upcoming',
        });
      });

    // Suggestions based on sequences
    const lastActivity = await getLastActivity(userId);
    if (lastActivity) {
      const lastCategory = lastActivity.category?.name || lastActivity.customCategory?.name || 'Other';
      const timeSinceLastActivity = (new Date() - lastActivity.startTime) / (1000 * 60 * 60);
      
      patterns.temporal
        .filter(seq => seq.from === lastCategory && timeSinceLastActivity <= seq.averageTimeDiff + 1)
        .forEach(sequence => {
          suggestions.push({
            type: 'sequence_suggestion',
            priority: 'medium',
            category: sequence.to,
            title: `Next up: ${sequence.to}?`,
            message: `After ${sequence.from}, you often do ${sequence.to}. Ready for the next activity?`,
            suggestedAction: 'log_activity',
            confidence: sequence.count / 10, // Normalize confidence
            timing: 'sequence',
          });
        });
    }

    // Weekly pattern suggestions
    patterns.weekly
      .filter(pattern => pattern.dayOfWeek === currentDay)
      .forEach(pattern => {
        const hasActivityToday = deviations.some(d => d.category === pattern.category);
        
        if (!hasActivityToday) {
          suggestions.push({
            type: 'weekly_habit',
            priority: 'low',
            category: pattern.category,
            title: `${pattern.dayName} ${pattern.category}`,
            message: `You often do ${pattern.category.toLowerCase()} on ${pattern.dayName}s. Don't forget!`,
            suggestedAction: 'reminder',
            confidence: pattern.occurrences / 10,
            timing: 'weekly',
          });
        }
      });

    // Sort by priority and confidence
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 5); // Limit to top 5 suggestions

  } catch (error) {
    console.error('Suggestion generation error:', error);
    throw error;
  }
};

// Store user patterns in database for persistence
const storeUserPatterns = async (userId, patterns) => {
  try {
    await prisma.userPatterns.upsert({
      where: { userId },
      update: {
        patterns: patterns,
        lastAnalyzed: new Date(),
      },
      create: {
        userId,
        patterns: patterns,
        lastAnalyzed: new Date(),
      },
    });
  } catch (error) {
    // If table doesn't exist, we'll create it in the schema update
    console.log('Pattern storage not available yet - will be created in schema update');
  }
};

// Get user's last activity
const getLastActivity = async (userId) => {
  return await prisma.activity.findFirst({
    where: { userId },
    include: {
      category: true,
      customCategory: true,
    },
    orderBy: { startTime: 'desc' },
  });
};

// Helper function to format hour
const formatHour = (hour) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
};

// Get pattern insights for a user
export const getPatternInsights = async (userId) => {
  try {
    const patterns = await detectTemporalPatterns(userId);
    const insights = [];

    // Most consistent habits
    const consistentHabits = patterns.daily
      .filter(p => p.confidence > 0.5)
      .slice(0, 3);

    if (consistentHabits.length > 0) {
      insights.push({
        type: 'consistent_habits',
        title: 'Your Most Consistent Habits',
        data: consistentHabits,
        message: `You're most consistent with ${consistentHabits.map(h => h.category).join(', ')}`,
      });
    }

    // Peak activity times
    const hourCounts = {};
    patterns.daily.forEach(pattern => {
      hourCounts[pattern.hour] = (hourCounts[pattern.hour] || 0) + pattern.occurrences;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    if (peakHours.length > 0) {
      insights.push({
        type: 'peak_times',
        title: 'Your Peak Activity Times',
        data: peakHours,
        message: `You're most active around ${peakHours.map(p => formatHour(p.hour)).join(', ')}`,
      });
    }

    // Activity sequences
    const topSequences = patterns.temporal.slice(0, 3);
    if (topSequences.length > 0) {
      insights.push({
        type: 'activity_sequences',
        title: 'Your Activity Patterns',
        data: topSequences,
        message: `You often follow ${topSequences[0].from} with ${topSequences[0].to}`,
      });
    }

    return insights;
  } catch (error) {
    console.error('Pattern insights error:', error);
    throw error;
  }
};

// Check for pattern deviations and return suggestions (main API endpoint)
export const checkPatternsAndSuggest = async (userId) => {
  try {
    // First, get existing active suggestions
    const existingSuggestions = await getActivePatternSuggestions(userId);
    
    // If we have recent suggestions (less than 1 hour old), return them
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentSuggestions = existingSuggestions.filter(s => 
      new Date(s.createdAt) > oneHourAgo
    );
    
    if (recentSuggestions.length > 0) {
      // Return existing suggestions without regenerating
      return {
        hasDeviations: recentSuggestions.length > 0,
        deviations: [], // Don't recalculate deviations
        suggestions: existingSuggestions,
        patternStrength: 50, // Default pattern strength when using cached suggestions
        lastAnalyzed: new Date(),
      };
    }
    
    // Generate new analysis only if no recent suggestions exist
    const analysis = await analyzeUserPatterns(userId);
    
    // Store suggestions in database if any were generated
    if (analysis.suggestions && analysis.suggestions.length > 0) {
      await storePatternSuggestions(userId, analysis.suggestions);
    }
    
    // Get stored suggestions with IDs (including newly created ones)
    const storedSuggestions = await getActivePatternSuggestions(userId);
    
    return {
      hasDeviations: analysis.deviations.length > 0,
      deviations: analysis.deviations,
      suggestions: storedSuggestions,
      patternStrength: calculatePatternStrength(analysis.patterns),
      lastAnalyzed: analysis.analysisDate,
    };
  } catch (error) {
    console.error('Pattern check error:', error);
    throw error;
  }
};

// Calculate overall pattern strength
const calculatePatternStrength = (patterns) => {
  const totalPatterns = patterns.daily.length + patterns.weekly.length + patterns.temporal.length;
  if (totalPatterns === 0) return 0;

  const avgConfidence = patterns.daily.reduce((sum, p) => sum + p.confidence, 0) / Math.max(patterns.daily.length, 1);
  const patternDiversity = Math.min(totalPatterns / 10, 1); // Normalize to 0-1
  
  return Math.round((avgConfidence * 0.7 + patternDiversity * 0.3) * 100);
};