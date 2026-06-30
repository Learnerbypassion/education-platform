import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineHome, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineCog, HiOutlineChartBar, HiOutlinePlus, HiOutlineX, HiOutlineUsers } from 'react-icons/hi';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { isInstructor, isAdmin } = useAuth();
  const dispatch = useDispatch();

  const close = () => dispatch(setSidebarOpen(false));

  const studentLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/courses', icon: <HiOutlineBookOpen />, label: 'Explore Courses' },
    { to: '/dashboard?tab=enrolled', icon: <HiOutlineClipboardList />, label: 'My Courses' },
    { to: '/verify', icon: <HiOutlineAcademicCap />, label: 'Certificates' },
  ];

  const instructorLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/course/create', icon: <HiOutlinePlus />, label: 'Create Course' },
    { to: '/dashboard?tab=courses', icon: <HiOutlineBookOpen />, label: 'My Courses' },
    { to: '/dashboard?tab=analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/admin', icon: <HiOutlineCog />, label: 'Admin Panel' },
    { to: '/admin?tab=users', icon: <HiOutlineUsers />, label: 'Users' },
    { to: '/admin?tab=courses', icon: <HiOutlineBookOpen />, label: 'All Courses' },
    { to: '/dashboard?tab=analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
  ];

  const links = isAdmin ? adminLinks : isInstructor ? instructorLinks : studentLinks;

  return (
    <>
      {/* Overlay with fade transition */}
      <div
        className={`fixed inset-0 z-20 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />
      <aside
        className={`fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 border-r border-slate-200/70 bg-white/95 p-4 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-slate-800 dark:bg-slate-950/95 lg:sticky lg:top-20 lg:h-auto lg:w-72 lg:rounded-3xl lg:border lg:bg-white lg:p-4 dark:lg:bg-slate-900/70 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        id="main-sidebar"
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Navigation</span>
          <button className="rounded-2xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" onClick={close}>
            <HiOutlineX size={18} />
          </button>
        </div>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
              }
              onClick={close}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 transition hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
          <NavLink to="/verify" className="flex items-center gap-3" onClick={close}>
            <HiOutlineDocumentText />
            <span>Verify Certificate</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
