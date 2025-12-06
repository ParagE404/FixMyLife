import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileWrapper } from './components/layout/MobileWrapper';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivityPage } from './pages/ActivityPage';

function App() {
  return (
    <MobileWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <OnboardingPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <PrivateRoute>
                <ActivityPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </MobileWrapper>
  );
}

export default App;
