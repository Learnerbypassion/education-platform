import { Link } from 'react-router-dom';
import { FaGraduationCap, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => (
  <footer className="footer" id="main-footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <FaGraduationCap className="footer-logo-icon" />
            <span>Edu<span className="gradient-text">Platform</span></span>
          </Link>
          <p className="footer-desc">Automated Online Course Management, Assessment & Certification Platform. Learn, teach, and earn certificates.</p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub"><FaGithub /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
          </div>
        </div>
        <div className="footer-links-group">
          <h4>Platform</h4>
          <Link to="/courses">Explore Courses</Link>
          <Link to="/verify">Verify Certificate</Link>
          <Link to="/register">Become an Instructor</Link>
        </div>
        <div className="footer-links-group">
          <h4>Resources</h4>
          <a href="#">Documentation</a>
          <a href="#">API Reference</a>
          <a href="#">Help Center</a>
        </div>
        <div className="footer-links-group">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} EduPlatform. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
