import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import './Auth.css';

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
    <div className="auth-page">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Start your learning journey today</p>
      <form onSubmit={handleSubmit} className="auth-form" id="register-form">
        <div className="input-group">
          <label htmlFor="reg-name">Full Name</label>
          <div className="input-icon-wrapper">
            <HiOutlineUser className="input-icon" />
            <input id="reg-name" type="text" className="input-field input-with-icon" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="reg-email">Email</label>
          <div className="input-icon-wrapper">
            <HiOutlineMail className="input-icon" />
            <input id="reg-email" type="email" className="input-field input-with-icon" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="reg-password">Password</label>
          <div className="input-icon-wrapper">
            <HiOutlineLockClosed className="input-icon" />
            <input id="reg-password" type={showPass ? 'text' : 'password'} className="input-field input-with-icon" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
              {showPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
            </button>
          </div>
        </div>
        <div className="input-group">
          <label htmlFor="reg-role">I want to</label>
          <div className="auth-role-selector">
            <button type="button" className={`auth-role-btn ${form.role === 'student' ? 'auth-role-active' : ''}`} onClick={() => setForm({ ...form, role: 'student' })}>
              🎓 Learn
            </button>
            <button type="button" className={`auth-role-btn ${form.role === 'instructor' ? 'auth-role-active' : ''}`} onClick={() => setForm({ ...form, role: 'instructor' })}>
              📚 Teach
            </button>
          </div>
        </div>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
