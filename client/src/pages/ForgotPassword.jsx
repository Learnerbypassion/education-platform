import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/authApi';
import toast from 'react-hot-toast';
import { HiOutlineMail as MailIcon } from 'react-icons/hi';
import './Auth.css';

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
    <div className="auth-page">
      <h2 className="auth-title">Reset Password</h2>
      {sent ? (
        <div className="auth-success-state animate-scale-in">
          <p className="auth-subtitle">We have sent a password reset link to <strong>{email}</strong>.</p>
          <Link to="/login" className="btn btn-primary btn-lg auth-submit">Return to Login</Link>
        </div>
      ) : (
        <>
          <p className="auth-subtitle">Enter your email address and we&apos;ll send you a link to reset your password.</p>
          <form onSubmit={handleSubmit} className="auth-form" id="forgot-password-form">
            <div className="input-group">
              <label htmlFor="reset-email">Email</label>
              <div className="input-icon-wrapper">
                <MailIcon className="input-icon" />
                <input id="reset-email" type="email" className="input-field input-with-icon" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </form>
          <p className="auth-switch">
            Remember your password? <Link to="/login" className="auth-link">Sign in</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
