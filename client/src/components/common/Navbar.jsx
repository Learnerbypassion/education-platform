import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch, HiMoon, HiSun } from 'react-icons/hi';
import { getInitials, getMediaUrl } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';
import BrandLogo from './BrandLogo';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [navImgError, setNavImgError] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    setNavImgError(false);
  }, [user?.profileImage]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Fetch notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.data?.notifications || []);
      } catch {
        // Silently fail
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotifClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      }
      if (notif.link) {
        setNotifOpen(false);
        navigate(notif.link);
      }
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Silently fail
    }
  };

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <button
            className="navbar-sidebar-toggle-btn cursor-pointer"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle Navigation Sidebar"
            title="Navigation Sidebar"
          >
            <HiOutlineMenu size={20} />
          </button>
          <BrandLogo size="md" />
        </div>

        <div className="navbar-center">
          <Link to="/courses" className={`navbar-link ${location.pathname === '/courses' ? 'navbar-link-active' : ''}`}>Explore</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className={`navbar-link ${location.pathname === '/dashboard' ? 'navbar-link-active' : ''}`}>Dashboard</Link>
          )}
        </div>

        <div className="navbar-right">
          <button
            onClick={toggleTheme}
            className="btn-icon-nav"
            aria-label="Toggle theme"
            id="theme-toggle-btn"
          >
            {theme === 'light' ? <HiMoon size={18} /> : <HiSun size={18} />}
          </button>
          <button className="btn-icon-nav navbar-search-btn" onClick={() => navigate('/courses')} aria-label="Search">
            <HiOutlineSearch size={18} />
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  className="btn-icon-nav"
                  aria-label="Notifications"
                  onClick={() => setNotifOpen(!notifOpen)}
                >
                  <HiOutlineBell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="navbar-notif-dropdown">
                    <div className="navbar-notif-header">
                      <h4>Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="navbar-notif-btn-read"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="navbar-notif-list">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 20).map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`navbar-notif-item ${
                              !notif.isRead ? 'navbar-notif-item-unread' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="navbar-notif-dot" />
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="mt-1 text-[10px] text-slate-400">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="navbar-user-pill">
                <div className="navbar-avatar-circle">
                  {user?.profileImage && !navImgError ? <img src={getMediaUrl(user.profileImage)} alt="" onError={() => setNavImgError(true)} className="h-full w-full rounded-full object-cover" /> : getInitials(user?.name)}
                </div>
                <button onClick={handleLogout} className="navbar-user-btn-logout">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth-btns">
              <Link to="/login" className="navbar-btn-login">Login</Link>
              <Link to="/register" className="navbar-btn-signup">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
