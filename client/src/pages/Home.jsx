import { Link } from 'react-router-dom';
import { FaGraduationCap, FaRobot, FaShieldAlt, FaCertificate, FaChalkboardTeacher, FaUserGraduate, FaBookOpen } from 'react-icons/fa';
import { HiOutlineArrowRight } from 'react-icons/hi';
import './Home.css';

const features = [
  { icon: <FaChalkboardTeacher />, title: 'Dynamic Course Creation', desc: 'Create week-based, day-based, or topic-based courses with rich multimedia content.' },
  { icon: <FaRobot />, title: 'Automated Assessment', desc: 'MCQ auto-grading, coding challenges, and GitHub-based project evaluation.' },
  { icon: <FaShieldAlt />, title: 'AI Proctoring', desc: 'Webcam monitoring, tab-switch detection, and fullscreen lock for exam integrity.' },
  { icon: <FaCertificate />, title: 'Instant Certificates', desc: 'Auto-generated PDF certificates with QR code verification upon course completion.' },
  { icon: <FaUserGraduate />, title: 'Progress Tracking', desc: 'Track video watch time, lesson completion, and overall learning progress.' },
  { icon: <FaBookOpen />, title: 'Rich Content Support', desc: 'YouTube, Vimeo, self-hosted videos, PDFs, documents, and presentations.' },
];

const stats = [
  { value: '10K+', label: 'Courses' },
  { value: '100K+', label: 'Learners' },
  { value: '50K+', label: 'Certificates' },
  { value: '5K+', label: 'Instructors' },
];

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content animate-fade-in-up">
            <span className="hero-badge badge badge-primary">🚀 The Future of Online Learning</span>
            <h1 className="hero-title">
              Learn. Assess.<br />
              <span className="gradient-text">Get Certified.</span>
            </h1>
            <p className="hero-subtitle">
              A fully automated learning ecosystem with dynamic courses, AI-powered assessments, 
              proctored exams, and instant certificate generation.
            </p>
            <div className="hero-actions">
              <Link to="/courses" className="btn btn-primary btn-lg">
                Explore Courses <HiOutlineArrowRight />
              </Link>
              <Link to="/register" className="btn btn-outline btn-lg">
                Become an Instructor
              </Link>
            </div>
          </div>
          <div className="hero-visual animate-fade-in">
            <div className="hero-glow hero-glow-1" />
            <div className="hero-glow hero-glow-2" />
            <div className="hero-card hero-card-1 glass-card animate-float">
              <FaGraduationCap /> <span>Certificate Issued</span>
            </div>
            <div className="hero-card hero-card-2 glass-card" style={{ animationDelay: '1s', animation: 'float 4s ease-in-out infinite' }}>
              <span className="badge badge-success">✓ Exam Passed — 92%</span>
            </div>
            <div className="hero-card hero-card-3 glass-card" style={{ animationDelay: '2s', animation: 'float 5s ease-in-out infinite' }}>
              <span>📊 Progress: 78%</span>
              <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '9999px', marginTop: '8px' }}>
                <div style={{ width: '78%', height: '100%', background: 'var(--color-success)', borderRadius: '9999px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-row">
            {stats.map((s, i) => (
              <div key={i} className="stat-item animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="stat-value gradient-text">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            Everything You Need, <span className="gradient-text">Automated</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto var(--space-2xl)' }}>
            From course creation to certification — zero manual intervention required.
          </p>
          <div className="grid grid-3">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section section">
        <div className="container">
          <div className="cta-card glass-card">
            <h2 className="cta-title">Ready to Start Your Learning Journey?</h2>
            <p className="cta-desc">Join thousands of learners and instructors on the most automated LMS platform.</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-accent btn-lg">Get Started Free <HiOutlineArrowRight /></Link>
              <Link to="/verify" className="btn btn-outline btn-lg">Verify Certificate</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
