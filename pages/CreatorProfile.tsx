import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  Heart, 
  MessageCircle, 
  CheckCircle,
  Calendar,
  Share2,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Globe,
  Music,
  ShoppingBag,
  Link as LinkIcon
} from 'lucide-react';
import { api } from '../services/api';
import { Creator, Post } from '../types';
import { Button, Card, Badge } from '../components/ui';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PlatformIcon = ({ platform, className = "w-4 h-4" }: { platform: string, className?: string }) => {
  switch (platform.toLowerCase()) {
    case 'youtube': return <Youtube className={className} />;
    case 'twitter': return <Twitter className={className} />;
    case 'instagram': return <Instagram className={className} />;
    default: return <ExternalLink className={className} />;
  }
};

const getLinkInfo = (url: string) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('instagram.com')) return { icon: Instagram, label: 'Instagram', color: 'text-pink-500', border: 'border-pink-500/20 hover:bg-pink-500/10' };
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return { icon: Twitter, label: 'X (Twitter)', color: 'text-blue-400', border: 'border-blue-400/20 hover:bg-blue-400/10' };
  if (lowerUrl.includes('facebook.com')) return { icon: Facebook, label: 'Facebook', color: 'text-blue-600', border: 'border-blue-600/20 hover:bg-blue-600/10' };
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return { icon: Youtube, label: 'YouTube', color: 'text-red-500', border: 'border-red-500/20 hover:bg-red-500/10' };
  if (lowerUrl.includes('spotify') || lowerUrl.includes('music') || lowerUrl.includes('sound')) return { icon: Music, label: 'Music', color: 'text-emerald-400', border: 'border-emerald-400/20 hover:bg-emerald-400/10' };
  if (lowerUrl.includes('shop') || lowerUrl.includes('store') || lowerUrl.includes('merch') || lowerUrl.includes('youthiapa')) return { icon: ShoppingBag, label: 'Merch / Store', color: 'text-purple-400', border: 'border-purple-400/20 hover:bg-purple-400/10' };
  
  return { icon: LinkIcon, label: 'External Link', color: 'text-slate-400', border: 'border-slate-700 hover:bg-dark-700' };
};

const MetricCard = ({ icon: Icon, label, value, subtext, colorClass }: any) => (
  <div className="bg-dark-800 border border-dark-700 rounded-xl p-5 flex items-center gap-4 flex-1 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg bg-opacity-10 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white leading-none mb-1">{value}</h3>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      {subtext && <p className="text-xs text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const CreatorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await api.getUserProfile(id);
        if (res.data && res.data.length > 0) {
          setCreator(res.data[0]);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-slate-300">
        <p className="text-xl mb-4">{error || 'User not found'}</p>
        <Button onClick={() => navigate('/dashboard')} variant="secondary">Back to Dashboard</Button>
      </div>
    );
  }

  // Calculate aggregate sentiment data from posts
  const totalGood = creator.posts.reduce((acc, post) => acc + (post.good_comments || 0), 0);
  const totalBad = creator.posts.reduce((acc, post) => acc + (post.bad_comments || 0), 0);
  const totalComments = totalGood + totalBad;
  
  const sentimentData = totalComments > 0 ? [
    { name: 'Good Comments', value: totalGood },
    { name: 'Bad Comments', value: totalBad },
  ] : [
    { name: 'Positive', value: creator.metrics.sentiment_score },
    { name: 'Negative', value: 100 - creator.metrics.sentiment_score }
  ];

  const COLORS = ['#10b981', '#ef4444']; // Emerald-500, Red-500

  // Extract and process links
  const extractLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const bioLinks = creator.bio ? extractLinks(creator.bio) : [];
  // Always ensure the main platform link exists
  const mainPlatformLink = creator.platform === 'youtube' ? `https://www.youtube.com/channel/${creator.platform_id}` : '';
  
  // Combine and deduplicate
  let allLinks = [...bioLinks];
  if (mainPlatformLink && !allLinks.some(l => l.includes(creator.platform_id))) {
    allLinks.unshift(mainPlatformLink);
  }
  const uniqueLinks = Array.from(new Set(allLinks));

  return (
    <div className="min-h-screen bg-dark-900 text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center text-slate-400 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
        </div>

        {/* 1. Profile Header Card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-primary-500 to-purple-600">
                <img 
                  src={creator.profile_pic_url} 
                  alt={creator.name} 
                  className="w-full h-full rounded-full object-cover border-4 border-dark-800"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${creator.name}` }}
                />
              </div>
              <div className="absolute bottom-1 right-1 bg-dark-900 text-white p-2 rounded-full border border-dark-700 shadow-lg">
                <PlatformIcon platform={creator.platform} className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{creator.name}</h1>
                <Badge color="blue" className="w-fit text-sm py-1">@{creator.username}</Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-300">
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-primary-400" />
                  <span className="font-bold text-white text-lg">
                    {Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(creator.followers)}
                  </span>
                  <span className="text-sm text-slate-500">Followers</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-emerald-400 text-lg">
                    {creator.metrics.overall_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-slate-500">Overall Score</span>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <a 
                href={creator.platform === 'youtube' ? `https://youtube.com/channel/${creator.platform_id}` : '#'} 
                target="_blank" 
                rel="noreferrer"
              >
                <Button variant="secondary" className="gap-2">
                  Visit Channel <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: About & Key Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* About Section */}
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-slate-400 leading-relaxed mb-6 whitespace-pre-line text-sm md:text-base">
                {creator.bio || "No bio available."}
              </p>
              
              {/* Social Connections Grid */}
              {uniqueLinks.length > 0 && (
                <div className="border-t border-dark-700 pt-4">
                  <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-3">Social Connections</p>
                  <div className="flex flex-wrap gap-3">
                    {uniqueLinks.map((url, index) => {
                      const { icon: Icon, label, color, border } = getLinkInfo(url);
                      return (
                        <a 
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-dark-900/50 transition-all ${border}`}
                        >
                          <Icon className={`w-4 h-4 ${color}`} />
                          <span className="text-sm text-slate-300 font-medium">{label}</span>
                          <ExternalLink className="w-3 h-3 text-slate-600" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics Row */}
            <div>
               <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard 
                  icon={Heart} 
                  value={`${creator.metrics.engagement_rate_per_post.toFixed(2)}%`} 
                  label="Engagement / Post" 
                  colorClass="text-red-500"
                />
                <MetricCard 
                  icon={MessageCircle} 
                  value={creator.metrics.like_comment_ratio.toFixed(1)} 
                  label="Like/Comment Ratio" 
                  colorClass="text-blue-500"
                />
                <MetricCard 
                  icon={CheckCircle} 
                  value={`${creator.metrics.sentiment_score}%`} 
                  label="Positive Sentiment" 
                  colorClass="text-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Sentiment Chart */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-sm h-full flex flex-col">
              <h2 className="text-xl font-bold text-white mb-2 text-center">Comment Sentiment</h2>
              <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-3xl font-bold text-white">
                    {totalGood > 0 ? Math.round((totalGood / totalComments) * 100) : creator.metrics.sentiment_score}%
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">Positive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Recent Posts Section (Horizontal List) */}
        <div className="pt-4">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Posts</h2>
          <div className="space-y-4">
            {creator.posts.map((post) => (
              <div 
                key={post.post_id} 
                className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all group flex flex-col md:flex-row"
              >
                {/* Thumbnail Section */}
                <div className="w-full md:w-72 h-48 md:h-auto relative flex-shrink-0 bg-dark-900">
                  <img 
                    src={`https://img.youtube.com/vi/${post.post_id}/mqdefault.jpg`}
                    alt={post.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {
                      // Fallback if generic image fails (rare for YT ids)
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/320x180?text=No+Thumbnail"
                    }}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                    {post.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors leading-snug">
                        {post.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Published on {formatDate(post.published_at)}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm line-clamp-2 mb-4 md:mb-0">
                      {post.description}
                    </p>
                  </div>

                  {/* Stats Footer */}
                  <div className="flex items-center gap-6 mt-4 text-sm border-t border-dark-700 pt-4">
                    <div className="flex items-center gap-2 text-slate-300" title="Views">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="font-medium">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.views)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300" title="Likes">
                      <Heart className="w-4 h-4 text-red-500/70" />
                      <span className="font-medium">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.likes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300" title="Comments">
                      <MessageSquare className="w-4 h-4 text-blue-500/70" />
                      <span className="font-medium">{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(post.comments_total)}</span>
                    </div>
                    <div className="ml-auto">
                       <a href={`https://youtu.be/${post.post_id}`} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-400 text-xs font-medium flex items-center gap-1">
                         Watch Video <ExternalLink className="w-3 h-3" />
                       </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Icons locally if not in lucide imports above (though they are imported)
const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
);

export default CreatorProfile;