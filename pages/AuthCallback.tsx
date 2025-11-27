import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your account...');

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setMessage('Authorization was denied or failed.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code returned.');
      return;
    }

    const exchangeCode = async () => {
      try {
        const result = await api.connectInstagram(code);
        setStatus('success');
        setMessage('Account connected successfully! Token received.');
        
        // Optional: Store the new token or user data if the backend returns updated profile info
        // if (result.access_token) { ... }

        // Redirect back to dashboard after a brief delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err: any) {
        console.error('Exchange failed', err);
        setStatus('error');
        setMessage('Failed to connect account. The code may be invalid or expired.');
      }
    };

    exchangeCode();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <Card className="w-full max-w-md text-center py-10">
        <div className="flex justify-center mb-6">
          {status === 'loading' && <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />}
          {status === 'success' && <CheckCircle className="w-16 h-16 text-emerald-500" />}
          {status === 'error' && <XCircle className="w-16 h-16 text-red-500" />}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {status === 'loading' && 'Verifying Connection'}
          {status === 'success' && 'Connected!'}
          {status === 'error' && 'Connection Failed'}
        </h2>
        
        <p className="text-slate-400 mb-8">{message}</p>

        {status === 'error' && (
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Return to Dashboard
          </button>
        )}
      </Card>
    </div>
  );
};

export default AuthCallback;