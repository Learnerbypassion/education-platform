import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

const Register = () => {
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
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
    <div className="glass-card p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Start your learning journey with a simple setup.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="register-form">
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
          <div className="relative">
            <HiOutlineUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="reg-name" type="text" className="input-field pl-10" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required aria-label="Full Name" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <div className="relative">
            <HiOutlineMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="reg-email" type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required aria-label="Email address" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="reg-password" type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} aria-label="Password" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 focus-visible:outline-brand-500 rounded-md p-1" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Hide password" : "Show password"}>
              {showPass ? <HiOutlineEyeOff aria-hidden="true" /> : <HiOutlineEye aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200" id="role-label">I want to</label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="role-label">
            <button type="button" className={`rounded-2xl border px-3 py-2 text-sm font-medium focus-visible:outline-brand-500 transition-colors ${form.role === 'student' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:border-brand-300'}`} onClick={() => setForm({ ...form, role: 'student' })} aria-pressed={form.role === 'student'}>🎓 Learn</button>
            <button type="button" className={`rounded-2xl border px-3 py-2 text-sm font-medium focus-visible:outline-brand-500 transition-colors ${form.role === 'instructor' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:border-brand-300'}`} onClick={() => setForm({ ...form, role: 'instructor' })} aria-pressed={form.role === 'instructor'}>📚 Teach</button>
          </div>
        </div>
        {error && <p className="text-sm font-medium text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
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
        Already have an account? <Link to="/login" className="font-semibold text-brand-600 focus-visible:outline-brand-500 rounded-sm ml-1">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
