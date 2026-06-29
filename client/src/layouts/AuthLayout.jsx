import { Outlet } from 'react-router-dom';
import { FaGraduationCap } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => (
  <div className="auth-layout">
    <div className="auth-layout-left">
      <div className="auth-layout-brand">
        <Link to="/" className="auth-logo">
          <FaGraduationCap />
          <span>Edu<span className="gradient-text">Platform</span></span>
        </Link>
        <h1 className="auth-headline">Learn. Assess.<br /><span className="gradient-text">Certify.</span></h1>
        <p className="auth-tagline">The fully automated learning platform for courses, assessments, and certifications.</p>
      </div>
      <div className="auth-layout-dots">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="auth-dot" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
    <div className="auth-layout-right">
      <div className="auth-form-container">
        <Outlet />
      </div>
    </div>
  </div>
);

export default AuthLayout;
