import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to continue your learning journey</p>
      <form onSubmit={handleSubmit} className="auth-form" id="login-form">
        <div className="input-group">
          <label htmlFor="login-email">Email</label>
          <div className="input-icon-wrapper">
            <HiOutlineMail className="input-icon" />
            <input id="login-email" type="email" className="input-field input-with-icon" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <div className="input-icon-wrapper">
            <HiOutlineLockClosed className="input-icon" />
            <input id="login-password" type={showPass ? 'text' : 'password'} className="input-field input-with-icon" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div className="auth-extras">
          <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/register" className="auth-link">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
