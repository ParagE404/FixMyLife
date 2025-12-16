# Behavioral Pattern Recognition Engine

## Overview

The Behavioral Pattern Recognition Engine is an AI-powered feature that analyzes user activity patterns and provides proactive suggestions to help maintain habits and routines. It learns from temporal patterns in user activities and detects when users deviate from their established habits.

## Features

### 🧠 Pattern Analysis
- **Daily Patterns**: Identifies activities that occur at consistent times of day
- **Weekly Patterns**: Detects day-of-week preferences for different activities
- **Category Patterns**: Analyzes frequency and timing preferences by activity category
- **Temporal Sequences**: Discovers activity chains and sequences

### 🔍 Deviation Detection
- **Missed Patterns**: Identifies when expected activities haven't occurred
- **Unusual Timing**: Detects activities happening at atypical times
- **Real-time Analysis**: Continuously monitors for pattern deviations

### 💡 Proactive Suggestions
- **Habit Resumption**: Suggests logging missed activities based on patterns
- **Upcoming Habits**: Reminds about activities that typically happen soon
- **Sequence Suggestions**: Recommends next activities based on common sequences
- **Weekly Reminders**: Suggests activities based on day-of-week patterns

## How It Works

### 1. Data Collection
The system analyzes the last 30 days of user activities to establish patterns. It requires a minimum of 3 occurrences to establish a reliable pattern.

### 2. Pattern Detection
```javascript
// Example pattern detection
{
  category: "Exercise",
  hour: 7,
  confidence: 0.85,
  occurrences: 12,
  averageDuration: 45
}
```

### 3. Deviation Analysis
The system checks for deviations in real-time:
- **Time Window**: ±2 hours for pattern matching
- **Confidence Threshold**: Minimum 30% confidence for suggestions
- **Deviation Threshold**: 2+ hours deviation triggers suggestions

### 4. Suggestion Generation
Suggestions are prioritized by:
- **Priority**: High (immediate), Medium (upcoming), Low (weekly)
- **Confidence**: Pattern strength and reliability
- **Timing**: Immediate, upcoming, sequence-based, or weekly

## API Endpoints

### Pattern Analysis
```
GET /api/patterns/analyze
```
Returns comprehensive pattern analysis for the authenticated user.

### Pattern Insights
```
GET /api/patterns/insights
```
Returns formatted insights for dashboard display.

### Pattern Suggestions
```
GET /api/patterns/suggestions
```
Returns current proactive suggestions based on patterns and deviations.

### Suggestion Actions
```
POST /api/patterns/suggestions/:id/act
POST /api/patterns/suggestions/:id/dismiss
```
Mark suggestions as acted upon or dismissed.

### Pattern Strength
```
GET /api/patterns/strength
```
Returns overall pattern strength score and breakdown.

## Database Schema

### UserPatterns
Stores detected patterns for each user:
```sql
- id: String (Primary Key)
- userId: String (Foreign Key)
- patterns: Json (Pattern data)
- lastAnalyzed: DateTime
```

### PatternSuggestion
Stores generated suggestions:
```sql
- id: String (Primary Key)
- userId: String (Foreign Key)
- type: String (Suggestion type)
- category: String
- title: String
- message: String
- priority: String (high/medium/low)
- confidence: Float
- timing: String
- actionType: String
- isRead: Boolean
- isActedOn: Boolean
- expiresAt: DateTime
```

## Frontend Components

### PatternDashboard
Main dashboard component with tabs for suggestions and insights.

### PatternSuggestions
Displays proactive suggestions with action buttons.

### PatternInsights
Shows pattern analysis and strength metrics.

### PatternSuggestionsWidget
Compact widget for dashboard integration.

## Configuration

### Pattern Analysis Settings
```javascript
const PATTERN_ANALYSIS_DAYS = 30; // Days to analyze
const MIN_OCCURRENCES = 3; // Minimum pattern occurrences
const DEVIATION_THRESHOLD = 2; // Hours deviation threshold
const TIME_WINDOW_HOURS = 2; // Pattern matching window
```

### Background Jobs
- **Pattern Analysis**: Runs every 2 hours for active users
- **Suggestion Cleanup**: Removes expired suggestions every hour
- **Active User Detection**: Users with activities in last 7 days

## Usage Examples

### 1. Morning Exercise Pattern
```
Pattern Detected:
- Activity: "Morning workout"
- Time: 7:00 AM
- Confidence: 85%
- Frequency: 5 days/week

Suggestion Generated:
- Type: habit_resumption
- Message: "You usually exercise around 7:00 AM. Would you like to log this activity now?"
- Priority: high
- Timing: immediate
```

### 2. Study Session Sequence
```
Pattern Detected:
- Sequence: "Coffee" → "Study session"
- Average gap: 30 minutes
- Confidence: 70%

Suggestion Generated:
- Type: sequence_suggestion
- Message: "After coffee, you often study. Ready for the next activity?"
- Priority: medium
- Timing: sequence
```

## Performance Considerations

### Optimization Strategies
1. **Incremental Analysis**: Only analyze users with recent activity
2. **Pattern Caching**: Store patterns to avoid recalculation
3. **Batch Processing**: Process multiple users in background jobs
4. **Suggestion Expiry**: Automatic cleanup of old suggestions

### Scalability
- Background job processing prevents real-time performance impact
- Pattern storage reduces computation overhead
- Configurable analysis frequency based on user activity

## Privacy & Data

### Data Usage
- Only analyzes user's own activity data
- Patterns stored locally per user
- No cross-user pattern sharing
- Automatic data cleanup after 30 days

### User Control
- Users can disable pattern recognition
- Suggestions can be dismissed or acted upon
- Pattern analysis frequency is configurable
- Full data export/deletion available

## Future Enhancements

### Planned Features
1. **Machine Learning Integration**: Advanced pattern detection algorithms
2. **Seasonal Patterns**: Long-term seasonal behavior analysis
3. **Goal Integration**: Pattern-based goal recommendations
4. **Social Patterns**: Optional community pattern insights
5. **Habit Strength Scoring**: Advanced consistency metrics
6. **Custom Pattern Rules**: User-defined pattern preferences

### Technical Improvements
1. **Real-time Processing**: WebSocket-based live suggestions
2. **Advanced Analytics**: Statistical significance testing
3. **Pattern Visualization**: Interactive pattern charts
4. **A/B Testing**: Suggestion effectiveness measurement
5. **Mobile Notifications**: Push notifications for suggestions

## Testing

### Test Coverage
- Unit tests for pattern detection algorithms
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Performance tests for large datasets

### Test Data
Use the provided test script to verify functionality:
```bash
node test-pattern-recognition.js
```

## Monitoring

### Key Metrics
- Pattern detection accuracy
- Suggestion acceptance rate
- User engagement with features
- System performance metrics

### Logging
- Pattern analysis job execution
- Suggestion generation events
- User interaction tracking
- Error monitoring and alerting