import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}!</h1>
        <p className="text-text-secondary">Dashboard coming soon...</p>
      </div>
    </div>
  );
}
