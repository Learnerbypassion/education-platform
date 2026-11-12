import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import BrandLogo from './BrandLogo';
import './Footer.css';

const Footer = () => (
  <footer className="footer" id="main-footer">
    <div className="container">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandLogo size="md" />
            <p className="footer-desc">
              Structured course delivery, timed examination management, and verifiable digital academic credentials.
            </p>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Platform</h4>
            <div className="footer-links-list">
              <Link to="/courses">Explore Courses</Link>
              <Link to="/verify">Verify Certificate</Link>
              <Link to="/register">Register Account</Link>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Academic</h4>
            <div className="footer-links-list">
              <Link to="/courses?category=web-development">Web Engineering</Link>
              <Link to="/courses?category=data-science">Data Science</Link>
              <Link to="/verify">Credential Registry</Link>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>System</h4>
            <div className="footer-links-list">
              <Link to="/login">Sign In</Link>
              <Link to="/dashboard">Workspace</Link>
              <Link to="/verify">Public Verification</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Standard Academic Edition</span>
      </div>
    </div>
  </footer>
);

export default Footer;
