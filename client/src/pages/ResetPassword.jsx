import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/authApi';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed as LockIcon, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ token, password });
      toast.success('Password reset successful! Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Invalid Link</h2>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link to="/forgot-password" className="btn btn-primary mt-6 block w-full text-center">
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Set new password</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Enter your new password below.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="reset-password-form">
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            New Password
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              aria-label="New password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Confirm Password
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              className="input-field pl-10"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              aria-label="Confirm new password"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        Remember your password? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
      </p>
    </div>
  );
};

export default ResetPassword;
