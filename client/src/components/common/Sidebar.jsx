import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { 
  HiOutlineHome, 
  HiOutlineBookOpen, 
  HiOutlineClipboardList, 
  HiOutlineAcademicCap, 
  HiOutlineCog, 
  HiOutlineChartBar, 
  HiOutlinePlus, 
  HiOutlineX, 
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineLogin,
  HiOutlineUserAdd
} from 'react-icons/hi';
import BrandLogo from './BrandLogo';
import './Sidebar.css';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user, isAuthenticated, isInstructor, isAdmin } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();

  const close = () => dispatch(setSidebarOpen(false));

  const handleLogout = () => {
    dispatch(logout());
    close();
  };

  const navLinks = [
    { to: '/', icon: <HiOutlineHome size={18} />, label: 'Home' },
    { to: '/courses', icon: <HiOutlineBookOpen size={18} />, label: 'Explore Courses' },
    ...(isAuthenticated ? [{ to: '/dashboard', icon: <HiOutlineChartBar size={18} />, label: 'Dashboard' }] : []),
    ...(isAuthenticated ? [{ to: '/dashboard?tab=enrolled', icon: <HiOutlineClipboardList size={18} />, label: 'My Courses' }] : []),
    ...(isAuthenticated ? [{ to: '/profile', icon: <HiOutlineUser size={18} />, label: 'My Profile' }] : []),
    { to: '/verify', icon: <HiOutlineAcademicCap size={18} />, label: 'Verify Credentials' },
  ];

  if (isInstructor || isAdmin) {
    navLinks.push({ to: '/course/create', icon: <HiOutlinePlus size={18} />, label: 'Create Course' });
  }

  if (isAdmin) {
    navLinks.push({ to: '/admin', icon: <HiOutlineCog size={18} />, label: 'Admin Panel' });
  }

  const currentPathWithSearch = location.pathname + location.search;

  const isLinkActive = (to) => {
    if (to === '/dashboard') {
      return location.pathname === '/dashboard' && (!location.search || location.search === '?tab=overview');
    }
    return currentPathWithSearch === to || (to !== '/' && location.pathname === to && !to.includes('?'));
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200 bg-white p-5 transition-transform duration-250 ease-out will-change-transform dark:border-slate-800 dark:bg-[#0c0e17] shadow-lg flex flex-col justify-between
          ${sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
        `}
        id="main-sidebar"
      >
        <div>
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <BrandLogo size="md" />
            <button
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={close}
              aria-label="Close sidebar"
            >
              <HiOutlineX size={18} />
            </button>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`sidebar-nav-link ${active ? 'sidebar-nav-link-active' : ''}`}
                  onClick={close}
                >
                  <span className="shrink-0">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="sidebar-btn-logout"
            >
              <HiOutlineLogout size={15} />
              <span>Sign Out</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <NavLink
                to="/login"
                className="sidebar-btn-login"
                onClick={close}
              >
                <HiOutlineLogin size={14} />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                className="sidebar-btn-register"
                onClick={close}
              >
                <HiOutlineUserAdd size={14} />
                <span>Register</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
