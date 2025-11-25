import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'entrepreneur' | 'investor' | 'realtor' | 'supplier'>('entrepreneur');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(fullName, email, password, role);

      // 🚀 Redirect based on role
      const roleRoutes: Record<typeof role, string> = {
        entrepreneur: '/entrepreneur/dashboard',
        investor: '/investor/dashboard',
        realtor: '/realtor/dashboard',
        supplier: '/supplier/dashboard',
      };

      navigate(roleRoutes[role]);
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B2C45] via-[#0e3a5a] to-[#00AEEF] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0B2C45] mb-2">TefTef</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a...
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none transition"
            >
              <option value="entrepreneur">Entrepreneur — Start a business</option>
              <option value="investor">Investor — Fund businesses</option>
              <option value="supplier">Supplier — Sell starter packages</option>
              <option value="realtor">Realtor — List properties</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <UserPlus size={20} />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-[#00AEEF] hover:text-[#0B2C45] font-medium transition"
          >
            Already have an account? Sign In
          </button>
        </div>

      </div>
    </div>
  );
};
