import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // Just set token and fetch /me by reloading
      localStorage.setItem('token', token);
      toast.success('Successfully logged in!');
      // Force reload to let the app fetch the user naturally, or redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      toast.error('Authentication failed');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Authenticating...</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Please wait while we log you in.</p>
        <div className="mt-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    </div>
  );
};

export default OAuthCallback;
