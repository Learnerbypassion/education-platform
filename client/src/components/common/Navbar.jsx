import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch, HiMoon, HiSun, HiOutlineX } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';
import { getInitials } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';

const Navbar = ({ showSidebarToggle = false }) => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

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
        // Silently fail — bell icon just won't show a count
      }
    };
    fetchNotifications();
    // Poll every 60 seconds
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
    <nav className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80" id="main-navbar">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {isAuthenticated && showSidebarToggle && (
            <button
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:block hidden"
              onClick={() => dispatch(toggleSidebar())}
              aria-label="Toggle sidebar"
            >
              <HiOutlineMenu size={20} />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <span className="rounded-2xl bg-brand-600 p-2 text-white">
              <FaGraduationCap size={16} />
            </span>
            <span>
              Edu<span className="text-brand-600">Platform</span>
            </span>
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/courses" className="text-sm font-medium text-slate-600 transition hover:text-brand-600 dark:text-slate-300">Explore</Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 transition hover:text-brand-600 dark:text-slate-300">Dashboard</Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <HiMoon size={18} /> : <HiSun size={18} />}
          </button>
          <button className="hidden sm:flex rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" onClick={() => navigate('/courses')} aria-label="Search">
            <HiOutlineSearch size={18} />
          </button>

          {isAuthenticated ? (
            <>
              {/* Notification Bell with Dropdown */}
              <div className="relative hidden sm:block" ref={notifRef}>
                <button
                  className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
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
                  <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" style={{ maxHeight: '420px' }}>
                    <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-700">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700 transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 20).map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotifClick(notif)}
                            className={`flex w-full text-left gap-3 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 ${
                              !notif.isRead ? 'bg-brand-50/40 dark:bg-brand-950/20' : ''
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                  {notif.title}
                                </span>
                                {!notif.isRead && (
                                  <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0" />
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

              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent font-bold text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)] select-none">
                  {user?.profileImage ? <img src={user.profileImage} alt={user.name} className="h-full w-full rounded-full object-cover" /> : getInitials(user?.name)}
                </div>
                <button onClick={handleLogout} className="px-2 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 transition">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="rounded-2xl px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 dark:text-slate-300 transition">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
          <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
            Explore Courses
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Dashboard
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Profile
              </Link>
              {showSidebarToggle && (
                <button
                  onClick={() => { setMobileMenuOpen(false); dispatch(toggleSidebar()); }}
                  className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sidebar Menu
                </button>
              )}
              <div className="border-t border-slate-200/70 pt-2 dark:border-slate-800">
                <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  Logout
                </button>
              </div>
            </>
          )}
          {!isAuthenticated && (
            <div className="flex gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-outline flex-1 text-center">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary flex-1 text-center">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
