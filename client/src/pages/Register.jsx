import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Register = () => {
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
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Create account</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Start your learning journey with a simple setup.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4" id="register-form">
        <div>
          <label htmlFor="reg-name" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
          <div className="relative">
            <HiOutlineUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="reg-name" type="text" className="input-field pl-10" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email</label>
          <div className="relative">
            <HiOutlineMail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="reg-email" type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>
        <div>
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="reg-password" type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">I want to</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={`rounded-2xl border px-3 py-2 text-sm font-medium ${form.role === 'student' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`} onClick={() => setForm({ ...form, role: 'student' })}>🎓 Learn</button>
            <button type="button" className={`rounded-2xl border px-3 py-2 text-sm font-medium ${form.role === 'instructor' ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`} onClick={() => setForm({ ...form, role: 'instructor' })}>📚 Teach</button>
          </div>
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
