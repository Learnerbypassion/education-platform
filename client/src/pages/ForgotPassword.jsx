import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';
import toast from 'react-hot-toast';
import { HiOutlineMail as MailIcon } from 'react-icons/hi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Reset password</h2>
      {sent ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">We sent a password reset link to <span className="font-semibold text-slate-900 dark:text-white">{email}</span>.</p>
          <Link to="/login" className="btn btn-primary w-full">Return to Login</Link>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Enter your email address and we&apos;ll send you a link to reset your password.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="forgot-password-form">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="reset-email" type="email" className="input-field pl-10" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
            Remember your password? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
