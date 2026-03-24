import { useState } from 'react';
import { Code2, AlertCircle } from 'lucide-react'; // Added AlertCircle for error messages

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  // 1. Add state to hold the input values and any errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2. Update the submit function to talk to your backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();

      if (response.ok) {
        // FIX: Read from responseData.data.token instead of responseData.token
        localStorage.setItem('token', responseData.data.token);
        localStorage.setItem('userName', responseData.data.name || email.split('@')[0]);
        
        onNavigate('dashboard');
      } else {
        setError(responseData.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Network error. Is your backend server running?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-2xl">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="ml-3 text-2xl font-bold text-gray-900">Code-Pair</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 font-medium">Enter your details to access your account</p>
        </div>

        {/* 3. Show an error message box if something goes wrong */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              College Email ID
            </label>
            <input
              type="email"
              id="email"
              value={email} // Bind state
              onChange={(e) => setEmail(e.target.value)} // Update state on type
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="you@college.edu"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password} // Bind state
              onChange={(e) => setPassword(e.target.value)} // Update state on type
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Logging in...' : 'Login to Code-Pair'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 font-medium">
          New User?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}