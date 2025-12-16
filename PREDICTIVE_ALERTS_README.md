# Predictive Habit Degradation Alerts

## Overview

The Predictive Habit Degradation Alerts system uses historical activity trends to predict when habits are at risk of breaking and provides proactive interventions before failure occurs.

## Features

### 🔮 Predictive Analysis
- **Historical Trend Analysis**: Analyzes 4 weeks of activity data to identify patterns
- **Multi-Factor Risk Assessment**: Considers frequency trends, duration trends, consistency, and recency
- **Risk Scoring**: Calculates 0-100% risk scores with categorized risk levels (low, medium, high, critical)
- **Category-Specific Predictions**: Analyzes each habit category independently

### 🚨 Smart Alerting
- **Proactive Notifications**: Alerts trigger before habit failure, not after
- **Risk-Based Filtering**: Only high and critical risk predictions generate alerts
- **Personalized Messages**: Human-readable explanations of why a habit is at risk
- **Actionable Recommendations**: Specific suggestions for habit recovery

### 🎯 Intervention System
- **Immediate Actions**: Quick 5-minute interventions to restart momentum
- **Strategic Planning**: Calendar scheduling and environment preparation
- **Accountability Support**: Social and reminder-based interventions
- **Adaptive Suggestions**: Risk-level appropriate intervention strategies

## How It Works

### 1. Data Collection
The system analyzes activities from the last 30 days, requiring at least 5 activities per category for meaningful predictions.

### 2. Trend Analysis
- **Weekly Breakdown**: Groups activities into 4-week periods
- **Frequency Trends**: Calculates percentage change in activity frequency
- **Duration Trends**: Tracks changes in time spent on activities
- **Consistency Scoring**: Measures habit regularity over 14-day periods

### 3. Risk Calculation
```javascript
Risk Score = (
  Frequency Trend Impact (40%) +
  Duration Trend Impact (30%) +
  Consistency Impact (20%) +
  Recency Impact (10%)
)
```

### 4. Alert Generation
- **Critical Risk (70-100%)**: Immediate intervention needed
- **High Risk (50-69%)**: Proactive action recommended  
- **Medium Risk (30-49%)**: Monitoring and minor adjustments
- **Low Risk (0-29%)**: No alerts generated

## API Endpoints

### Risk Analysis
```
GET /api/predictions/habits/risk-analysis
```
Returns comprehensive risk analysis with predictions and recent alerts.

### Alerts Management
```
GET /api/predictions/alerts
GET /api/predictions/alerts/habit-degradation
PATCH /api/predictions/alerts/:id/read
DELETE /api/predictions/alerts/:id
```

### Interventions
```
POST /api/predictions/alerts/:id/intervention
```
Generates personalized intervention strategies for specific alerts.

## Frontend Components

### 📊 Risk Analysis Dashboard
- **Real-time Analysis**: Fresh predictions with trend visualizations
- **Risk Summary**: Overview of categories at risk
- **Detailed Metrics**: Frequency, duration, and consistency trends
- **Interactive Refresh**: Manual analysis triggering

### 🔔 Alerts Panel
- **Unified Notifications**: All alerts in one place with filtering
- **Interactive Management**: Mark as read, dismiss, or trigger interventions
- **Smart Categorization**: Habit alerts vs. other notification types
- **Batch Operations**: Mark all as read functionality

### 🎯 Habit Degradation Alerts
- **Visual Risk Indicators**: Color-coded risk levels with appropriate icons
- **Expandable Details**: Recommendations and metrics on demand
- **One-Click Interventions**: Immediate access to recovery strategies
- **Progress Tracking**: Shows intervention history and outcomes

### 📈 Risk Analysis Widget (Dashboard)
- **At-a-Glance Status**: Quick overview of habit health
- **High-Risk Highlights**: Immediate attention to critical habits
- **Navigation Integration**: Direct links to detailed analysis

## Scheduled Jobs

### Daily Analysis (9:00 AM)
- Runs batch analysis for all users with notifications enabled
- Generates alerts for high and critical risk predictions
- Respects user preferences and notification timing

### Critical Check (Every 6 hours)
- Reserved for future critical case monitoring
- Currently disabled to avoid notification spam

## Configuration

### User Preferences
Users can control alert behavior through their preferences:
- `notificationsEnabled`: Master switch for all alerts
- Alert frequency and timing preferences (future enhancement)

### Risk Thresholds
Configurable in the prediction service:
- Critical: 70%+ risk score
- High: 50-69% risk score  
- Medium: 30-49% risk score
- Low: 0-29% risk score

## Usage Examples

### Example Alert Message
> "Your exercise activity has dropped significantly (40%) and it's been 3 days since your last session. Habit break risk: 75%."

### Example Interventions
1. **Quick Win**: Do just 5 minutes of exercise right now
2. **Schedule It**: Block time in your calendar for exercise this week
3. **Get Support**: Tell someone about your commitment to restart this habit
4. **Make It Easier**: Identify and remove barriers preventing you from starting

## Technical Implementation

### Backend Services
- **PredictionService**: Core analysis and risk calculation logic
- **AlertService**: Notification management and intervention generation
- **Scheduled Jobs**: Automated daily analysis and cleanup

### Frontend Integration
- **React Components**: Modular alert and analysis components
- **Service Layer**: API communication and state management
- **Navigation**: Dedicated alerts page with dashboard widgets

### Database Schema
- **Notifications**: Stores alerts with rich metadata
- **CorrelationAnalysis**: Caches predictions and analysis results
- **UserPreferences**: Controls notification behavior

## Benefits

### For Users
- **Proactive Support**: Catch habit breaks before they happen
- **Personalized Insights**: Understand your unique habit patterns
- **Actionable Guidance**: Clear steps to get back on track
- **Reduced Guilt**: Focus on solutions, not failures

### For Habit Formation
- **Higher Success Rates**: Intervention before failure improves outcomes
- **Data-Driven Insights**: Objective analysis of habit health
- **Continuous Improvement**: Learn from patterns to build stronger habits
- **Motivation Maintenance**: Stay engaged with your habit journey

## Future Enhancements

### Advanced Analytics
- **Seasonal Patterns**: Account for time-of-year variations
- **Cross-Habit Correlations**: Understand how habits affect each other
- **External Factors**: Weather, calendar events, and mood integration

### Smart Interventions
- **Personalized Timing**: Optimal intervention timing based on user patterns
- **Adaptive Strategies**: Learn which interventions work best for each user
- **Social Integration**: Connect with accountability partners

### Enhanced Notifications
- **Multi-Channel Alerts**: Email, SMS, and push notifications
- **Smart Scheduling**: Respect user's daily routines and preferences
- **Progressive Escalation**: Increase intervention intensity over time

## Getting Started

1. **Backend Setup**: Ensure the prediction service is running with scheduled jobs
2. **Frontend Integration**: Add alert components to your dashboard and navigation
3. **User Onboarding**: Explain the feature benefits during user setup
4. **Data Requirements**: Users need consistent activity logging for accurate predictions

The Predictive Habit Degradation Alerts system transforms reactive habit tracking into proactive habit maintenance, helping users stay on track with their goals through intelligent, data-driven interventions.