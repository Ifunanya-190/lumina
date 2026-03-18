import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaBrain, FaEye, FaEyeSlash, FaRocket } from 'react-icons/fa';

const AuthPage = () => {
  const { signup, login, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [form, setForm] = useState({ username: '', email: '', password: '', display_name: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isLoggedIn) {
    navigate('/');
    return null;
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const data = await signup(form.username, form.email, form.password, form.display_name);
        if (data.user.skill_level === 'undecided') {
          navigate('/assessment');
        } else {
          navigate('/');
        }
      } else {
        const data = await login(form.username, form.password);
        if (data.user.skill_level === 'undecided') {
          navigate('/assessment');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink mb-4 shadow-lg shadow-aurora-blue/30">
            <FaBrain className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            {mode === 'login' ? 'Welcome Back' : 'Join Lumina'}
          </h1>
          <p className="text-white/40 text-sm">
            {mode === 'login' ? 'Sign in to continue your learning journey' : 'Start your AI-powered learning adventure'}
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={form.display_name}
                  onChange={handleChange}
                  placeholder="How should we call you?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-blue/50 focus:ring-1 focus:ring-aurora-blue/30 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">
                {mode === 'login' ? 'Username or Email' : 'Username'}
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={mode === 'login' ? 'Enter username or email' : 'Choose a username'}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-blue/50 focus:ring-1 focus:ring-aurora-blue/30 transition-all"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-white/50 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-blue/50 focus:ring-1 focus:ring-aurora-blue/30 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/50 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-blue/50 focus:ring-1 focus:ring-aurora-blue/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-aurora-pink/10 border border-aurora-pink/20">
                <p className="text-aurora-pink text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-sm shadow-lg shadow-aurora-blue/20 disabled:opacity-50 hover:shadow-aurora-blue/40 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '100ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '200ms' }} />
                </div>
              ) : (
                <>
                  <FaRocket />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <div className="mt-6 text-center">
            <p className="text-white/30 text-sm">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
                className="text-aurora-cyan hover:text-white font-semibold transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
