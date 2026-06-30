import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => (
  <div className="notfound-page">
    <div className="notfound-content animate-scale-in">
      <span className="notfound-code gradient-text">404</span>
      <h1 className="notfound-title">Page Not Found</h1>
      <p className="notfound-desc">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
