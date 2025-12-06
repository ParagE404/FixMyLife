import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const result = await register(email, password, name);
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-6 bg-surface rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-text-secondary text-sm mb-6">
          Join millions building better habits
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || formError) && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error || formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-white rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
