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
            <BrandLogo size="lg" />
            <p className="footer-desc">Simple learning tools for creating courses, managing exams, and issuing certificates without the clutter.</p>
            <div className="footer-socials">
              <a href="#" aria-label="GitHub"><FaGithub /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Platform</h4>
            <div className="footer-links-list">
              <Link to="/courses">Explore Courses</Link>
              <Link to="/verify">Verify Certificate</Link>
              <Link to="/register">Become an Instructor</Link>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Resources</h4>
            <div className="footer-links-list">
              <a href="#">Documentation</a>
              <a href="#">API Reference</a>
              <a href="#">Help Center</a>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Legal</h4>
            <div className="footer-links-list">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
        <span className="footer-bottom-badge">Secure Platform ✓</span>
      </div>
    </div>
  </footer>
);

export default Footer;
