import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MobileWrapper } from './components/layout/MobileWrapper';
import { MobileNav } from './components/layout/MobileNav';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { ToastProvider } from './components/ui/toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ActivityPage } from './pages/ActivityPage';
import { ActivitiesHistoryPage } from './pages/ActivitiesHistoryPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import PatternsPage from './pages/PatternsPage.jsx';
import CorrelationsPage from './pages/CorrelationsPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
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
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
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
          path="/history"
          element={
            <PrivateRoute>
              <ActivitiesHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <PrivateRoute>
              <GoalsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/patterns"
          element={
            <PrivateRoute>
              <PatternsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/correlations"
          element={
            <PrivateRoute>
              <CorrelationsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/alerts"
          element={
            <PrivateRoute>
              <AlertsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      {!isAuthPage && <MobileNav />}
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <MobileWrapper>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </MobileWrapper>
    </ToastProvider>
  );
}

export default App;
