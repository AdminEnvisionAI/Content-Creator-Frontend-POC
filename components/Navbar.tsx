import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, BarChart2, User, Sparkles } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('nexus_token');

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-dark-700 bg-dark-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-primary-500/20 transition-all">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Nexus<span className="text-primary-500">AI</span>
            </span>
          </Link>

          {token ? (
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary-400 flex items-center gap-2 ${location.pathname === '/dashboard' ? 'text-primary-500' : 'text-slate-400'}`}>
                <BarChart2 className="w-4 h-4" />
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
               <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white">Login</Link>
               <Link to="/register" className="text-sm font-medium px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;