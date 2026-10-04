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
  HiOutlineDocumentText, 
  HiOutlineCog, 
  HiOutlineChartBar, 
  HiOutlinePlus, 
  HiOutlineX, 
  HiOutlineUsers,
  HiOutlineUser,
  HiOutlineLogout,
  HiOutlineLogin,
  HiOutlineUserAdd
} from 'react-icons/hi';
import BrandLogo from './BrandLogo';

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
    { to: '/', icon: <HiOutlineHome />, label: 'Home' },
    { to: '/courses', icon: <HiOutlineBookOpen />, label: 'Explore Courses' },
    ...(isAuthenticated ? [{ to: '/dashboard', icon: <HiOutlineChartBar />, label: 'Dashboard' }] : []),
    ...(isAuthenticated ? [{ to: '/dashboard?tab=enrolled', icon: <HiOutlineClipboardList />, label: 'My Courses' }] : []),
    ...(isAuthenticated ? [{ to: '/profile', icon: <HiOutlineUser />, label: 'My Profile' }] : []),
    { to: '/verify', icon: <HiOutlineAcademicCap />, label: 'Certificates' },
  ];

  if (isInstructor || isAdmin) {
    navLinks.push({ to: '/course/create', icon: <HiOutlinePlus />, label: 'Create Course' });
  }

  if (isAdmin) {
    navLinks.push({ to: '/admin', icon: <HiOutlineCog />, label: 'Admin Panel' });
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
        className={`fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={close}
      />
      <aside
        className={`
          fixed left-0 top-0 z-50 h-full w-72 border-r border-slate-200/80 bg-white/95 p-5 backdrop-blur-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform dark:border-white/10 dark:bg-slate-950/95 shadow-2xl flex flex-col justify-between
          ${sidebarOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'}
        `}
        id="main-sidebar"
      >
        <div>
          <div className="mb-6 flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <BrandLogo size="md" />
            <button
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-transform duration-150 active:scale-90 touch-manipulation cursor-pointer"
              onClick={close}
              aria-label="Close sidebar"
            >
              <HiOutlineX size={20} />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] touch-manipulation ${
                      active 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25' 
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white'
                    }`
                  }
                  onClick={close}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-xs border border-rose-500/20 hover:bg-rose-500/20 active:scale-95 touch-manipulation transition-all cursor-pointer"
            >
              <HiOutlineLogout size={16} />
              <span>Logout Account</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <NavLink
                to="/login"
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-center font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-1.5"
                onClick={close}
              >
                <HiOutlineLogin size={15} />
                <span>Login</span>
              </NavLink>
              <NavLink
                to="/register"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-center font-bold text-xs text-white shadow-md active:scale-95 touch-manipulation transition-all flex items-center justify-center gap-1.5"
                onClick={close}
              >
                <HiOutlineUserAdd size={15} />
                <span>Sign Up</span>
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
