# FixMyLife

AI-powered habit formation application that helps users build positive habits and maintain a healthier, more balanced lifestyle through intelligent activity tracking and personalized insights.

## Features

### 🎯 Smart Activity Tracking
- **Voice & Text Input**: Log activities using natural language through voice or text
- **AI-Powered Categorization**: Automatic categorization of activities using LLM services
- **Custom Categories**: Create personalized activity categories
- **Real-time Analytics**: Track progress with interactive charts and visualizations

### 📊 Analytics & Insights
- **Weekly Progress Charts**: Visual representation of activity trends
- **Category Breakdown**: Understand time distribution across different life areas
- **Habit Strength Indicators**: Monitor consistency and improvement
- **Calendar Heatmap**: Visual activity calendar for long-term tracking

### 🎯 Goal Management
- **Smart Goal Setting**: Set and track habit-based goals
- **Progress Monitoring**: Real-time goal progress tracking
- **AI Recommendations**: Personalized suggestions based on activity patterns
- **Milestone Celebrations**: Achievement tracking and notifications

### 🧠 Behavioral Pattern Recognition
- **Temporal Pattern Analysis**: Learns when you typically do activities (e.g., "exercise at 7 AM")
- **Deviation Detection**: Identifies when you deviate from established patterns
- **Proactive Suggestions**: Automatically suggests habit resumption without explicit prompting
- **Pattern Insights**: Visualizes your behavioral patterns and habit consistency
- **Smart Scheduling**: Recommends optimal times for activities based on your patterns

### 🔐 User Experience
- **Secure Authentication**: JWT-based authentication with session management
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Onboarding Flow**: Guided setup for new users
- **Privacy-Focused**: Secure data handling and user privacy protection

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication
- **Zod** validation
- **AI Integration** for activity categorization

### Frontend
- **React 19** with modern hooks
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication

## Project Structure

```
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (auth, activities, goals, etc.)
│   │   ├── scripts/         # Database seeding and utilities
│   │   └── utils/           # Helper functions
│   ├── prisma/             # Database schema and migrations
│   └── generated/          # Prisma client
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── stores/         # Zustand state management
│   │   └── assets/         # Static assets
│   └── public/             # Public assets
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

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
DATABASE_URL="postgresql://username:password@localhost:5432/fixmylife"
JWT_SECRET="your-jwt-secret"
LLM_API_KEY="your-llm-api-key"
PORT=3000
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Activities
- `GET /api/activities` - Get user activities
- `POST /api/activities` - Create new activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Analytics
- `GET /api/analytics/weekly` - Weekly activity data
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/trends` - Activity trends

### Pattern Recognition
- `GET /api/patterns/analyze` - Analyze user behavioral patterns
- `GET /api/patterns/insights` - Get pattern insights for dashboard
- `GET /api/patterns/suggestions` - Get proactive habit suggestions
- `POST /api/patterns/suggestions/:id/act` - Mark suggestion as acted upon
- `GET /api/patterns/strength` - Get pattern strength score

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
```

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Follow React best practices and hooks patterns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
