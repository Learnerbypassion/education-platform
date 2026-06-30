import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

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
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue your learning journey.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="login-form">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <div className="relative">
            <HiOutlineMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="login-email" type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="login-password" type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">Forgot password?</Link>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account? <Link to="/register" className="font-semibold text-brand-600">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
