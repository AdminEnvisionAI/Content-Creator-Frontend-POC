import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../services/api';
import { setLogin } from '../redux/slices/userSlice';
import { Button, Input, Card } from '../components/ui';
import { Sparkles, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('carryminatii@getnada.com');
  const [password, setPassword] = useState('kunal@123');
  const [userType, setUserType] = useState('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login(email, password, userType);
      dispatch(setLogin({
          token: response.data.token,
          user: response.data.user
      }));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-primary-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">NexusAI</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-slate-400">Sign in to access advanced creator analytics</p>
        </div>

        <Card className="backdrop-blur-xl bg-dark-800/80 border-dark-700 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex bg-dark-900/50 p-1 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userType === 'creator' ? 'bg-dark-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setUserType('creator')}
              >
                Creator
              </button>
              <button
                type="button"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userType === 'brand' ? 'bg-dark-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                onClick={() => setUserType('brand')}
              >
                Brand
              </button>
            </div>

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              <div className="flex justify-end">
                <a href="#" className="text-xs text-primary-400 hover:text-primary-300">Forgot password?</a>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/10 py-2 rounded border border-red-900/30">{error}</p>}

            <Button type="submit" className="w-full h-12 text-base" isLoading={loading}>
              Sign In <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium ml-1">
              Create Account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;