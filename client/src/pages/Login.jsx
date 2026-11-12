import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineExclamation, HiOutlineArrowRight } from 'react-icons/hi';
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
    <div className="w-full max-w-md mx-auto transition-all duration-300 animate-fade-in-up">
      <div className="space-y-3 text-left">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">Welcome back</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-normal mt-1">Sign in to continue your learning journey.</p>
        </div>

        <div className="flex items-center gap-2 pt-1 text-sm text-slate-600 dark:text-slate-400">
          <span>Don&apos;t have an account?</span>
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all shadow-xs cursor-pointer"
          >
            Sign up
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5" id="login-form">
        
        {/* Email Input */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center group">
            <HiOutlineMail className="pointer-events-none absolute left-3.5 z-10 text-slate-400 dark:text-slate-500 transition-colors" size={19} aria-hidden="true" />
            <input 
              id="login-email" 
              type="email" 
              style={{ paddingLeft: '2.75rem' }}
              className="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-slate-400/10 transition-all text-sm font-medium shadow-xs" 
              placeholder="name@example.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
              aria-label="Email address" 
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between items-center">
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
            <Link to="/forgot-password" className="text-xs font-semibold text-slate-900 dark:text-slate-300 hover:underline transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center group">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 z-10 text-slate-400 dark:text-slate-500 transition-colors" size={19} aria-hidden="true" />
            <input 
              id="login-password" 
              type={showPass ? 'text' : 'password'} 
              style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
              className="w-full py-3 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 focus:ring-1 focus:ring-slate-900/10 dark:focus:ring-slate-400/10 transition-all text-sm font-medium shadow-xs" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
              aria-label="Password" 
            />
            <button 
              type="button" 
              className="absolute right-3.5 z-10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors p-1" 
              onClick={() => setShowPass(!showPass)} 
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <HiOutlineEyeOff size={19} aria-hidden="true" /> : <HiOutlineEye size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-lg border border-rose-200 dark:border-rose-900 animate-scale-in" role="alert">
            <HiOutlineExclamation className="text-base flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-primary w-full py-3.5 text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 cursor-pointer" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Sign In</span>
              <HiOutlineArrowRight size={16} />
            </span>
          )}
        </button>
        
        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute bg-white dark:bg-[#0c0e17] px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or continue with</span>
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={`${serverUrl}/api/auth/google`} 
            className="flex w-full items-center justify-center gap-2.5 py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FcGoogle className="text-lg" />
            <span>Google</span>
          </a>
          <a 
            href={`${serverUrl}/api/auth/github`} 
            className="flex w-full items-center justify-center gap-2.5 py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FaGithub className="text-lg text-slate-900 dark:text-white" />
            <span>GitHub</span>
          </a>
        </div>
      </form>
    </div>
  );
};

export default Login;