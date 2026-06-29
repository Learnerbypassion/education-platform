import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';
import { getInitials } from '../../utils/helpers';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {isAuthenticated && (
            <button className="btn-icon navbar-menu-btn" onClick={() => dispatch(toggleSidebar())} aria-label="Toggle menu">
              <HiOutlineMenu size={22} />
            </button>
          )}
          <Link to="/" className="navbar-logo">
            <FaGraduationCap className="navbar-logo-icon" />
            <span className="navbar-logo-text">Edu<span className="gradient-text">Platform</span></span>
          </Link>
        </div>

        <div className="navbar-center">
          <Link to="/courses" className="navbar-link">Explore</Link>
          {isAuthenticated && <Link to="/dashboard" className="navbar-link">Dashboard</Link>}
        </div>

        <div className="navbar-right">
          <button className="btn-icon" onClick={() => navigate('/courses')} aria-label="Search">
            <HiOutlineSearch size={20} />
          </button>

          {isAuthenticated ? (
            <>
              <button className="btn-icon" aria-label="Notifications">
                <HiOutlineBell size={20} />
              </button>
              <div className="navbar-profile-dropdown">
                <button className="navbar-avatar-btn" id="profile-menu-btn">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="avatar avatar-sm" />
                  ) : (
                    <div className="avatar avatar-sm avatar-placeholder">{getInitials(user?.name)}</div>
                  )}
                </button>
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{user?.name}</span>
                    <span className="navbar-dropdown-role badge badge-primary">{user?.role}</span>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/dashboard" className="navbar-dropdown-item">Dashboard</Link>
                  <Link to="/profile" className="navbar-dropdown-item">Profile</Link>
                  <Link to="/certificates" className="navbar-dropdown-item">Certificates</Link>
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item navbar-logout" onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
