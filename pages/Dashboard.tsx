import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Youtube, Twitter, Instagram, Users, Briefcase, Trophy, TrendingUp, CheckCircle } from 'lucide-react';
import { api, BASE_URL, API_ENDPOINTS } from '../services/api';
import { selectUser, updateConnectionStatus } from '../redux/slices/userSlice';
import { Card, Button, Input, Badge } from '../components/ui';

const FB_APP_ID = "1976150976498875";

const StatBox = ({ icon: Icon, label, value, loading, color }) => (
  <Card className="relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
    </div>
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-dark-700/50 ${color.replace('text-', 'text-opacity-100 ')}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {loading ? (
          <div className="h-8 w-16 bg-dark-700 animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-white">{value}</h3>
        )}
      </div>
    </div>
  </Card>
);

const PlatformIcon = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
    case 'twitter': return <Twitter className="w-5 h-5 text-blue-400" />;
    case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
    default: return <Users className="w-5 h-5 text-slate-400" />;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [stats, setStats] = useState({ total_creators: 0, total_brands: 0, total_users: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(true);
  const [platform, setPlatform] = useState('youtube');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const initStats = async () => {
      try {
        const res = await api.getStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setStatsLoading(false);
      }
    };
    initStats();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isSuccess = params.get('success') === 'true';
    const errorParam = params.get('error');

    if (isSuccess) {
      setSuccessMessage('Instagram account connected successfully!');
      dispatch(updateConnectionStatus(true));
      navigate('/dashboard', { replace: true });
      setTimeout(() => setSuccessMessage(null), 5000);
    } else if (errorParam) {
        setError(`Connection failed: ${errorParam.replace(/_/g, ' ')}`);
        navigate('/dashboard', { replace: true });
        setTimeout(() => setError(null), 7000);
    }
  }, [location, navigate, dispatch]);

  const fetchCreators = useCallback(async (currPlatform, query) => {
    setCreatorsLoading(true);
    setError(null);
    try {
      let res;
      if (query) {
        res = await api.searchCreators(query);
      } else {
        res = await api.getTopCreators(currPlatform);
      }
      setCreators(res.data || []);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      setCreators([]);
    } finally {
      setCreatorsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSearchQuery('');
    fetchCreators(platform, '');
  }, [platform, fetchCreators]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCreators(platform, searchQuery);
  };

  const handlePlatformChange = (p) => {
    setPlatform(p);
  };

  const handleConnectInstagram = () => {
    const redirectUri = `${BASE_URL}${API_ENDPOINTS.EXCHANGE_CODE}`;
    const scope = "instagram_basic,instagram_manage_insights,instagram_manage_comments,public_profile,instagram_content_publish,pages_show_list";
    const state = user?.id;
    const fbLoginUrl = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code&state=${state}`;
    window.location.href = fbLoginUrl;
  };

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      <div className="bg-gradient-to-b from-dark-800 to-dark-900 border-b border-dark-700 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Creator Intelligence Dashboard</h1>
            <p className="text-slate-400 max-w-2xl text-lg">
              Leverage AI-driven insights to discover high-performing creators.
              Analyze engagement rates, sentiment scores, and audience growth in real-time.
            </p>
          </div>
          <Button
            onClick={handleConnectInstagram}
            disabled={user?.isFBGraphConnected}
            className={
              user?.isFBGraphConnected
                ? "bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-900/20 whitespace-nowrap cursor-not-allowed"
                : "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-0 shadow-lg shadow-pink-900/20 whitespace-nowrap"
            }
          >
            {user?.isFBGraphConnected ? (
                <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
                <Instagram className="w-5 h-5 mr-2" />
            )}
            {user?.isFBGraphConnected ? 'Connected' : 'Connect Instagram'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-lg mb-6 flex items-center shadow-lg animate-fade-in">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatBox
            icon={Trophy}
            label="Total Creators"
            value={stats.total_creators}
            loading={statsLoading}
            color="text-amber-500"
          />
          <StatBox
            icon={Briefcase}
            label="Partner Brands"
            value={stats.total_brands}
            loading={statsLoading}
            color="text-emerald-500"
          />
          <StatBox
            icon={Users}
            label="Total Analyzed Users"
            value={stats.total_users}
            loading={statsLoading}
            color="text-blue-500"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex bg-dark-800 p-1 rounded-lg border border-dark-700">
            {['youtube', 'instagram', 'twitter'].map((p) => (
              <button
                key={p}
                onClick={() => handlePlatformChange(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  platform === p
                    ? 'bg-dark-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                } capitalize flex items-center gap-2`}
              >
                <PlatformIcon platform={p} />
                {p}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search creators by name or niche..."
                className="pl-10 bg-dark-800/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" disabled={creatorsLoading}>
              {creatorsLoading ? '...' : 'Search'}
            </Button>
          </form>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatorsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-dark-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-dark-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-dark-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-dark-700 rounded w-full"></div>
                  <div className="h-3 bg-dark-700 rounded w-5/6"></div>
                </div>
              </Card>
            ))
          ) : creators.length > 0 ? (
            creators.map((creator) => (
              <Card
                key={creator._id}
                onClick={() => navigate(`/profile/${creator._id}`)}
                className="group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={creator.profile_pic_url}
                        alt={creator.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-dark-700 group-hover:border-primary-500 transition-colors"
                        onError={(e) => { (e.target).src = `https://ui-avatars.com/api/?name=${creator.name}&background=random` }}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-dark-800 rounded-full p-1 border border-dark-700">
                        <PlatformIcon platform={creator.platform} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors line-clamp-1">{creator.name}</h3>
                      <p className="text-xs text-slate-500">@{creator.username}</p>
                    </div>
                  </div>
                  <Badge color={creator.metrics.overall_score > 80 ? 'green' : creator.metrics.overall_score > 50 ? 'blue' : 'orange'}>
                    Score: {creator.metrics.overall_score.toFixed(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-dark-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Engagement</p>
                    <p className="font-bold text-white text-lg">{creator.metrics.engagement_rate_per_post.toFixed(2)}%</p>
                  </div>
                  <div className="bg-dark-900/50 p-3 rounded-lg text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Followers</p>
                    <p className="font-bold text-white text-lg">
                      {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(creator.followers)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                  {creator.bio || "No bio available for this creator."}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>Sentiment Score: <strong>{creator.metrics.sentiment_score}</strong></span>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <Users className="w-16 h-16 text-dark-700 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No creators found matching criteria.</p>
              <button onClick={() => { setSearchQuery(''); fetchCreators(platform, ''); }} className="text-primary-500 hover:underline mt-2">Clear Search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;