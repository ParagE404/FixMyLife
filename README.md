# FixMyLife

AI-powered habit formation application that helps users build positive habits and maintain a healthier, more balanced lifestyle through intelligent activity tracking, behavioral pattern recognition, and predictive interventions.

## Screenshots

### 📱 Dashboard & Analytics
<table>
  <tr>
    <td width="50%">
      <img src="screenshots/dashboard.png" alt="Dashboard Overview" />
      <p align="center"><em>Dashboard with habit insights and quick actions</em></p>
    </td>
    <td width="50%">
      <img src="screenshots/analytics.png" alt="Analytics Charts" />
      <p align="center"><em>Weekly progress and category breakdown</em></p>
    </td>
  </tr>
</table>

### 🎯 Activity Tracking & Goals
<table>
  <tr>
    <td width="50%">
      <img src="screenshots/activity-input.png" alt="Activity Input" />
      <p align="center"><em>AI-powered activity logging with voice/text input</em></p>
    </td>
    <td width="50%">
      <img src="screenshots/goals.png" alt="Goals Management" />
      <p align="center"><em>Goal tracking with progress indicators</em></p>
    </td>
  </tr>
</table>

### 🧠 Pattern Recognition & Predictions
<table>
  <tr>
    <td width="50%">
      <img src="screenshots/patterns.png" alt="Pattern Recognition" />
      <p align="center"><em>Behavioral pattern insights and suggestions</em></p>
    </td>
    <td width="50%">
      <img src="screenshots/correlations.png" alt="Correlation Analysis" />
      <p align="center"><em>Cross-correlation matrix and insights</em></p>
    </td>
  </tr>
</table>

### 🔔 Alerts & Settings
<table>
  <tr>
    <td width="50%">
      <img src="screenshots/alerts.png" alt="Predictive Alerts" />
      <p align="center"><em>Habit degradation alerts with interventions</em></p>
    </td>
    <td width="50%">
      <img src="screenshots/settings.png" alt="Settings & Preferences" />
      <p align="center"><em>Customizable preferences and notifications</em></p>
    </td>
  </tr>
</table>

## Features

### 🎯 Smart Activity Tracking
- **Voice & Text Input**: Log activities using natural language through voice or text
- **AI-Powered Categorization**: Automatic categorization using Groq LLM (Llama 3.3 70B)
- **Custom Categories**: Create personalized activity categories
- **Activity Suggestions**: Smart autocomplete based on your history
- **Flexible Time Tracking**: Support for both timed and untimed activities

### 📊 Advanced Analytics & Insights
- **Weekly Progress Charts**: Visual representation of activity trends over time
- **Category Breakdown**: Understand time distribution across different life areas
- **Habit Strength Indicators**: Monitor consistency and improvement with scoring
- **Calendar Heatmap**: Visual activity calendar for long-term tracking
- **Four-Week Trends**: Track progress and patterns over monthly periods
- **Daily Stats**: Detailed breakdown of daily activities and time allocation

### 🎯 Intelligent Goal Management
- **Smart Goal Setting**: Set and track habit-based goals with target hours
- **Progress Monitoring**: Real-time goal progress tracking with visual indicators
- **AI Recommendations**: Personalized suggestions based on activity patterns
- **Goal Types**: Support for habits, milestones, and challenges
- **Achievement Tracking**: Milestone celebrations and progress notifications

### 🧠 Behavioral Pattern Recognition Engine
- **Temporal Pattern Analysis**: Learns when you typically do activities (e.g., "exercise at 7 AM")
- **Deviation Detection**: Identifies when you deviate from established patterns
- **Proactive Suggestions**: Automatically suggests habit resumption without explicit prompting
- **Pattern Insights**: Visualizes your behavioral patterns and habit consistency
- **Smart Scheduling**: Recommends optimal times for activities based on your patterns
- **Weekly & Daily Patterns**: Detects day-of-week preferences and daily routines
- **Sequence Detection**: Discovers activity chains and common sequences

### 🔮 Predictive Habit Degradation Alerts
- **Risk Analysis**: Predicts when habits are at risk of breaking before failure occurs
- **Multi-Factor Assessment**: Analyzes frequency trends, duration, consistency, and recency
- **Proactive Interventions**: Provides actionable strategies to prevent habit breaks
- **Risk Scoring**: 0-100% risk scores with categorized levels (low, medium, high, critical)
- **Personalized Messages**: Human-readable explanations of habit risks
- **Intervention Strategies**: Immediate actions and strategic planning suggestions

### 🔗 Multi-Domain Habit Cross-Correlation
- **Hidden Relationship Discovery**: Identifies correlations between different activity categories
- **Statistical Analysis**: Uses Pearson correlation to find behavioral relationships
- **Predictive Insights**: AI-powered predictions based on activity correlations
- **Correlation Matrix**: Interactive heatmap visualization of all category relationships
- **Actionable Recommendations**: Suggests optimizations based on discovered correlations
- **Cross-Category Predictions**: Understand how one habit affects others

### ⚡ High-Performance Caching
- **Redis Integration**: Lightning-fast response times with intelligent caching
- **Smart Cache Invalidation**: Automatic cache updates when data changes
- **LLM Result Caching**: Expensive AI calls cached for 24 hours
- **Analytics Caching**: Complex calculations cached with appropriate TTL
- **95-99% Performance Improvement**: Sub-10ms response times for cached data

### 🔐 Comprehensive User Experience
- **Secure Authentication**: JWT-based authentication with session management
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Onboarding Flow**: Guided setup for new users with preference configuration
- **Privacy-Focused**: Secure data handling and user privacy protection
- **Customizable Preferences**: Theme, notifications, and display customization
- **Unified Alerts System**: Centralized notifications and alert management

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **Redis** for high-performance caching
- **JWT** authentication with session tokens
- **Zod** validation schemas
- **Groq AI** (Llama 3.3 70B) for activity categorization
- **Node-cron** for scheduled background jobs
- **bcryptjs** for password hashing

### Frontend
- **React 19** with modern hooks and concurrent features
- **Vite** for fast development and building
- **TailwindCSS v4** for modern styling
- **Radix UI** components for accessibility
- **Zustand** for lightweight state management
- **React Router v7** for navigation
- **Recharts** for interactive data visualization
- **Axios** for API communication
- **Lucide React** for consistent iconography


## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Redis server (for caching)
- npm or yarn package manager
- Groq API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fixmylife
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database URL and other settings
   
   # Run database migrations
   npm run migrate
   
   # Seed the database (optional)
   npm run seed
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your API URL
   
   # Start development server
   npm run dev
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fixmylife"

# Authentication
JWT_SECRET="your-secure-jwt-secret-key"

# AI Integration
GROQ_API_KEY="your-groq-api-key"

# Redis Caching
REDIS_URL="redis://localhost:6379"
REDIS_ENABLED="true"

# Server
PORT=5001
NODE_ENV="development"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:5001"
```

## Development

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npm run migrate

# Open Prisma Studio
npm run studio

# Reset database
npx prisma migrate reset

# Seed database with demo data
npm run seed
```

### Redis Setup
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server

# Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Test Redis connection
npm run test:redis
```

### Background Jobs
The application runs several background jobs:
- **Pattern Analysis**: Every 2 hours for active users
- **Prediction Analysis**: Daily at 9:00 AM
- **Cache Cleanup**: Automatic expiration handling

### Testing & Debugging
```bash
# Test Redis connection
npm run test:redis

# Check application health
curl http://localhost:5001/health

# View cache statistics (development)
curl -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:5001/api/cache/stats
```


## Key Features Deep Dive

### 🤖 AI-Powered Activity Parsing
FixMyLife uses Groq's Llama 3.3 70B model to intelligently parse natural language activity descriptions:
- **Smart Categorization**: Automatically assigns activities to appropriate categories
- **Time Extraction**: Parses time ranges from descriptions like "worked 9-5, gym at 6"
- **Confidence Scoring**: Provides confidence levels for categorization accuracy
- **Caching**: Results cached for 24 hours to reduce API costs and improve performance

### 📈 Advanced Pattern Recognition
The pattern recognition engine analyzes 30 days of activity data to:
- **Detect Temporal Patterns**: Learn when you typically do activities
- **Identify Sequences**: Discover activity chains (e.g., coffee → study session)
- **Monitor Deviations**: Alert when you deviate from established patterns
- **Generate Proactive Suggestions**: Recommend activities before you think to log them

### 🔮 Predictive Habit Health
The prediction system uses multi-factor analysis to prevent habit breaks:
- **Risk Scoring**: 0-100% risk assessment based on frequency, duration, consistency, and recency
- **Early Warning System**: Alerts trigger before habits fail, not after
- **Intervention Strategies**: Provides specific, actionable recovery suggestions
- **Trend Analysis**: Tracks 4-week patterns to identify declining habits

### ⚡ High-Performance Architecture
- **Redis Caching**: 95-99% performance improvement with intelligent cache invalidation
- **Background Jobs**: Pattern analysis and predictions run automatically
- **Optimized Queries**: Efficient database queries with proper indexing
- **Smart Cache Keys**: Structured caching with automatic invalidation on data changes

## Performance Metrics

### Response Times (with Redis)
- **Cached Analytics**: 5-15ms (vs 200-500ms without cache)
- **Cached LLM Results**: 5-10ms (vs 1000-3000ms without cache)
- **Cached Recommendations**: 5-10ms (vs 300-800ms without cache)
- **Real-time Suggestions**: 2-5ms (vs 50-150ms without cache)

### AI Integration
- **Activity Parsing Accuracy**: ~90% with confidence scoring
- **Pattern Detection**: Minimum 3 occurrences for reliable patterns
- **Prediction Accuracy**: Multi-factor risk assessment with 70%+ accuracy for high-risk predictions




## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration with validation
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/logout` - User logout and token cleanup
- `GET /api/auth/me` - Get current user profile

### Activities
- `GET /api/activities` - Get user activities with filtering
- `POST /api/activities` - Create new activity with AI categorization
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/suggestions` - Get activity suggestions
- `GET /api/activities/history` - Paginated activity history

### Goals
- `GET /api/goals` - Get user goals with progress
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/goals/:id/progress` - Get detailed goal progress

### Analytics
- `GET /api/analytics/weekly` - Weekly activity summary
- `GET /api/analytics/categories` - Category breakdown with colors
- `GET /api/analytics/trends` - Four-week trend analysis
- `GET /api/analytics/heatmap` - Calendar heatmap data
- `GET /api/analytics/habit-strength` - Habit consistency scoring
- `GET /api/analytics/daily/:date` - Daily activity stats

### Pattern Recognition
- `GET /api/patterns/analyze` - Comprehensive pattern analysis
- `GET /api/patterns/insights` - Pattern insights for dashboard
- `GET /api/patterns/suggestions` - Proactive habit suggestions
- `POST /api/patterns/suggestions/:id/act` - Mark suggestion as acted upon
- `POST /api/patterns/suggestions/:id/dismiss` - Dismiss suggestion
- `GET /api/patterns/strength` - Pattern strength scoring

### Cross-Correlation Analysis
- `GET /api/correlations/analyze` - Multi-domain correlation analysis
- `GET /api/correlations/summary` - Correlation summary with insights
- `GET /api/correlations/insights` - Detailed correlation relationships
- `GET /api/correlations/predictions` - Predictive insights from correlations
- `GET /api/correlations/matrix` - Correlation matrix for visualization

### Predictive Alerts
- `GET /api/predictions/habits/risk-analysis` - Habit degradation risk analysis
- `GET /api/predictions/alerts` - All user alerts and notifications
- `GET /api/predictions/alerts/habit-degradation` - Habit-specific alerts
- `PATCH /api/predictions/alerts/:id/read` - Mark alert as read
- `DELETE /api/predictions/alerts/:id` - Delete alert
- `POST /api/predictions/alerts/:id/intervention` - Generate intervention strategies

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/preferences` - Get user preferences
- `PUT /api/users/preferences` - Update user preferences

### Cache Management (Development)
- `GET /api/cache/stats` - Cache statistics and health
- `DELETE /api/cache/user/:userId` - Clear user-specific cache
- `DELETE /api/cache/pattern/:pattern` - Clear cache by pattern

## Project Structure

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic & AI services
│   │   │   ├── auth.service.js
│   │   │   ├── activity.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── llm.service.js          # Groq AI integration
│   │   │   ├── redis.service.js        # Caching layer
│   │   │   ├── pattern.service.js      # Pattern recognition
│   │   │   ├── correlation.service.js  # Cross-correlation analysis
│   │   │   ├── prediction.service.js   # Habit degradation prediction
│   │   │   └── *-job.service.js        # Background schedulers
│   │   ├── scripts/         # Database seeding and utilities
│   │   └── utils/           # Helper functions
│   ├── prisma/             # Database schema and migrations
│   └── generated/          # Prisma client
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── activity/   # Activity logging components
│   │   │   ├── analytics/  # Charts and visualizations
│   │   │   ├── auth/       # Authentication forms
│   │   │   ├── goals/      # Goal management
│   │   │   ├── layout/     # Navigation and layout
│   │   │   └── ui/         # Base UI components (Radix)
│   │   ├── pages/          # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ActivityPage.jsx
│   │   │   ├── PatternsPage.jsx
│   │   │   ├── CorrelationsPage.jsx
│   │   │   ├── AlertsPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── services/       # API service layer
│   │   ├── stores/         # Zustand state management
│   │   └── assets/         # Static assets
│   └── public/             # Public assets
└── *.md                    # Documentation files
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure Redis caching is implemented for expensive operations
- Test with both Redis enabled and disabled

### Screenshots Setup
To add screenshots to the README:

1. **Create screenshots directory**:
   ```bash
   mkdir screenshots
   ```

2. **Recommended screenshots** (mobile-first, 375x812px or similar):
   - `dashboard.png` - Main dashboard with widgets and insights
   - `activity-input.png` - Activity logging page with AI categorization
   - `analytics.png` - Analytics page with charts and heatmap
   - `goals.png` - Goals management with progress tracking
   - `patterns.png` - Pattern recognition insights and suggestions
   - `correlations.png` - Correlation analysis matrix and insights
   - `alerts.png` - Predictive alerts with intervention strategies
   - `settings.png` - Settings and preferences page

3. **Screenshot guidelines**:
   - Use consistent device frame (iPhone or clean mobile view)
   - Capture with sample data that demonstrates features
   - Ensure good contrast and readability
   - Show the app in action (charts with data, active states)
   - Use light theme for consistency

## Recent Updates & Features

### ✨ Latest Enhancements
- **Predictive Habit Degradation Alerts**: Proactive intervention system to prevent habit breaks
- **Advanced Pattern Recognition**: Comprehensive behavioral analysis with temporal patterns
- **Cross-Correlation Analysis**: Multi-domain habit relationship discovery
- **Redis Caching Layer**: Massive performance improvements with intelligent cache management
- **Enhanced Analytics**: Calendar heatmaps, habit strength scoring, and trend analysis
- **Unified Alerts System**: Centralized notification management with intervention strategies
- **Mobile-Optimized UI**: Responsive design with Radix UI components and TailwindCSS v4

### 🔧 Technical Improvements
- **Background Job Schedulers**: Automated pattern analysis and prediction generation
- **Smart Cache Invalidation**: Automatic cache updates when user data changes
- **Enhanced Database Schema**: Comprehensive models for patterns, correlations, and predictions
- **Improved Error Handling**: Graceful fallbacks and detailed error logging
- **Health Monitoring**: Redis health checks and system status endpoints

### 📱 User Experience Enhancements
- **Onboarding Flow**: Guided setup with preference configuration
- **Activity Suggestions**: Smart autocomplete based on user history
- **Voice Input Support**: Natural language activity logging
- **Customizable Preferences**: Theme, notifications, and display options
- **Interactive Visualizations**: Rich charts and heatmaps for data exploration

## License

MIT License - see LICENSE file for details.

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact the development team.