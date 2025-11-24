import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Button, Input, Card } from '../components/ui';
import { Sparkles } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'creator' | 'brand'>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // For creator
    company_name: '', // For brand
    bio: '',
    niche: '',
    industry: '',
    website: '',
    instagram: '',
    youtube: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        email: formData.email,
        password: formData.password,
        user_type: userType
      };

      if (userType === 'creator') {
        payload.name = formData.name;
        payload.niche = formData.niche.split(',').map(s => s.trim());
        payload.bio = formData.bio;
        payload.social_links = {
          instagram: formData.instagram,
          youtube: formData.youtube
        };
      } else {
        payload.company_name = formData.company_name;
        payload.industry = formData.industry;
        payload.website = formData.website;
      }

      await api.register(payload);
      // Auto redirect to login after successful reg
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 py-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="text-center mb-8">
           <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-2xl font-bold text-white">NexusAI</span>
           </div>
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
        </div>

        <Card className="backdrop-blur-xl bg-dark-800/80">
          <div className="flex bg-dark-900/50 p-1 rounded-lg mb-8">
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userType === 'creator' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setUserType('creator')}
            >
              I am a Creator
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${userType === 'brand' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setUserType('brand')}
            >
              I am a Brand
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email" 
              name="email" 
              type="email" 
              required 
              value={formData.email} 
              onChange={handleChange} 
            />
            <Input 
              label="Password" 
              name="password" 
              type="password" 
              required 
              value={formData.password} 
              onChange={handleChange} 
            />

            {userType === 'creator' ? (
              <>
                <Input label="Full Name" name="name" required value={formData.name} onChange={handleChange} />
                <Input label="Niche (comma separated)" name="niche" placeholder="Gaming, Tech, Vlog" value={formData.niche} onChange={handleChange} />
                <div className="w-full">
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Bio</label>
                  <textarea 
                    name="bio"
                    className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-3 py-2.5 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="YouTube URL" name="youtube" value={formData.youtube} onChange={handleChange} />
                  <Input label="Instagram URL" name="instagram" value={formData.instagram} onChange={handleChange} />
                </div>
              </>
            ) : (
              <>
                <Input label="Company Name" name="company_name" required value={formData.company_name} onChange={handleChange} />
                <Input label="Industry" name="industry" required value={formData.industry} onChange={handleChange} />
                <Input label="Website" name="website" value={formData.website} onChange={handleChange} />
              </>
            )}

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full mt-4" isLoading={loading}>
              Register as {userType === 'creator' ? 'Creator' : 'Brand'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            Already have an account? 
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium ml-1">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;