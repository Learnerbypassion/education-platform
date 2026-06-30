import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { HiOutlineMenu, HiOutlineBell, HiOutlineSearch, HiMoon, HiSun, HiOutlineX } from 'react-icons/hi';
import { FaGraduationCap } from 'react-icons/fa';
import { getInitials } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';

const Navbar = ({ showSidebarToggle = false }) => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
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
              <button className="hidden sm:flex rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" aria-label="Notifications">
                <HiOutlineBell size={18} />
              </button>
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
