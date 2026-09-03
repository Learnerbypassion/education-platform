import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { 
  HiOutlineMail, 
  HiOutlineLockClosed, 
  HiOutlineUser, 
  HiOutlineEye, 
  HiOutlineEyeOff, 
  HiOutlineExclamation,
  HiOutlineAcademicCap,
  HiOutlinePresentationChartBar,
  HiOutlineArrowRight
} from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Register = () => {
  const rawServerUrl = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const serverUrl = rawServerUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto transition-all duration-300 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-heading">Create account</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Start your learning journey with a simple setup.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-left" id="register-form">
        
        {/* Full Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="reg-name" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name</label>
          <div className="relative flex items-center group">
            <HiOutlineUser className="pointer-events-none absolute left-3.5 z-10 text-indigo-500 dark:text-indigo-400 group-focus-within:scale-110 transition-transform duration-200" size={19} aria-hidden="true" />
            <input 
              id="reg-name" 
              type="text" 
              style={{ paddingLeft: '2.75rem' }}
              className="w-full pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:scale-[1.01] transition-all duration-300 text-sm font-medium shadow-sm" 
              placeholder="e.g. John Doe" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              required 
              aria-label="Full Name" 
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
          <div className="relative flex items-center group">
            <HiOutlineMail className="pointer-events-none absolute left-3.5 z-10 text-indigo-500 dark:text-indigo-400 group-focus-within:scale-110 transition-transform duration-200" size={19} aria-hidden="true" />
            <input 
              id="reg-email" 
              type="email" 
              style={{ paddingLeft: '2.75rem' }}
              className="w-full pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:scale-[1.01] transition-all duration-300 text-sm font-medium shadow-sm" 
              placeholder="name@example.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
              required 
              aria-label="Email address" 
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password</label>
          <div className="relative flex items-center group">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3.5 z-10 text-indigo-500 dark:text-indigo-400 group-focus-within:scale-110 transition-transform duration-200" size={19} aria-hidden="true" />
            <input 
              id="reg-password" 
              type={showPass ? 'text' : 'password'} 
              style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
              className="w-full py-3.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:scale-[1.01] transition-all duration-300 text-sm font-medium shadow-sm" 
              placeholder="Min. 6 characters" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
              required 
              minLength={6} 
              aria-label="Password" 
            />
            <button 
              type="button" 
              className="absolute right-3.5 z-10 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-1" 
              onClick={() => setShowPass(!showPass)} 
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? <HiOutlineEyeOff size={19} aria-hidden="true" /> : <HiOutlineEye size={19} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Role Selector Buttons with Spring Micro-Animations */}
        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider" id="role-label">I want to</label>
          <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="role-label">
            <button 
              type="button" 
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 px-4 text-xs font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer ${
                form.role === 'student' 
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 hover:border-indigo-400'
              }`} 
              onClick={() => setForm({ ...form, role: 'student' })} 
              aria-pressed={form.role === 'student'}
            >
              <HiOutlineAcademicCap className="text-lg" />
              <span>Learn</span>
            </button>
            <button 
              type="button" 
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 px-4 text-xs font-extrabold transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer ${
                form.role === 'instructor' 
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20' 
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400 hover:border-indigo-400'
              }`} 
              onClick={() => setForm({ ...form, role: 'instructor' })} 
              aria-pressed={form.role === 'instructor'}
            >
              <HiOutlinePresentationChartBar className="text-lg" />
              <span>Teach</span>
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3.5 rounded-xl border border-rose-200 dark:border-rose-500/20 animate-scale-in" role="alert">
            <HiOutlineExclamation className="text-base flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="btn-primary w-full py-4 text-sm font-extrabold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2 cursor-pointer" 
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Creating account...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>Create Account</span>
              <HiOutlineArrowRight size={16} />
            </span>
          )}
        </button>
        
        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <span className="absolute bg-white dark:bg-[#0c0e17] px-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or continue with</span>
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={`${serverUrl}/api/auth/google`} 
            className="flex w-full items-center justify-center gap-2.5 py-3 px-4 text-xs font-extrabold rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <FcGoogle className="text-lg" />
            <span>Google</span>
          </a>
          <a 
            href={`${serverUrl}/api/auth/github`} 
            className="flex w-full items-center justify-center gap-2.5 py-3 px-4 text-xs font-extrabold rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-800 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
          >
            <FaGithub className="text-lg text-slate-900 dark:text-white" />
            <span>GitHub</span>
          </a>
        </div>
      </form>
      
      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
        Already have an account? 
        <Link to="/login" className="font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline ml-1.5 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;