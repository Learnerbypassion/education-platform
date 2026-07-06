import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Login = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
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
    <div className="glass-card p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Welcome back</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue your learning journey.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="login-form">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <div className="relative">
            <HiOutlineMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="login-email" type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required aria-label="Email address" />
          </div>
        </div>
        <div>
          <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="login-password" type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required aria-label="Password" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 focus-visible:outline-brand-500 rounded-md p-1" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Hide password" : "Show password"}>
              {showPass ? <HiOutlineEyeOff aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700 focus-visible:outline-brand-500 rounded-sm">Forgot password?</Link>
        </div>
        {error && <p className="text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        
        <div className="relative mt-6 flex items-center justify-center">
          <span className="absolute bg-white px-2 text-sm text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">Or continue with</span>
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <a href={`${serverUrl}/api/auth/google`} className="btn btn-outline flex w-full items-center justify-center gap-2">
            <FcGoogle className="text-xl" />
            <span>Google</span>
          </a>
          <a href={`${serverUrl}/api/auth/github`} className="btn btn-outline flex w-full items-center justify-center gap-2">
            <FaGithub className="text-xl text-slate-900 dark:text-white" />
            <span>GitHub</span>
          </a>
        </div>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        Don&apos;t have an account? <Link to="/register" className="font-semibold text-brand-600 focus-visible:outline-brand-500 rounded-sm ml-1">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
