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
    { to: '/dashboard?tab=exam-requests', icon: <HiOutlineClipboardList />, label: 'Attempt Requests' },
    { to: '/dashboard?tab=analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
  ];

  const adminLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/admin', icon: <HiOutlineCog />, label: 'Admin Panel' },
    { to: '/admin?tab=users', icon: <HiOutlineUsers />, label: 'Users' },
    { to: '/admin?tab=courses', icon: <HiOutlineBookOpen />, label: 'All Courses' },
    { to: '/dashboard?tab=exam-requests', icon: <HiOutlineClipboardList />, label: 'Attempt Requests' },
    { to: '/dashboard?tab=analytics', icon: <HiOutlineChartBar />, label: 'Analytics' },
  ];

  const links = isAdmin ? adminLinks : isInstructor ? instructorLinks : studentLinks;

  return (
    <>
      {/* Overlay with fade transition */}
      <div
        className={`fixed inset-0 z-20 bg-slate-950/20 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={close}
      />
      <aside
        className={`
          fixed left-0 top-[72px] z-50 h-[calc(100vh-72px)] w-72 border-r border-slate-200/50 bg-white/60 p-4 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] dark:border-white/[0.04] dark:bg-slate-950/40
          lg:sticky lg:top-[96px] lg:h-[calc(100vh-120px)] lg:rounded-3xl lg:border lg:bg-white/40 lg:dark:bg-slate-900/30 lg:shadow-sm
          ${sidebarOpen 
            ? 'translate-x-0 lg:w-72 lg:opacity-100 lg:px-4 lg:ml-0' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden lg:px-0 lg:border-none lg:-ml-6'
          }
        `}
        id="main-sidebar"
      >
        <div className="w-[254px] lg:w-64">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Navigation</span>
            <button className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.04] transition-colors" onClick={close}>
              <HiOutlineX size={18} />
            </button>
          </div>
          <nav className="space-y-1.5">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/80 dark:hover:text-white'
                  }`
                }
                onClick={close}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="mt-6 rounded-xl border border-slate-200/90 bg-white/70 p-4 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-indigo-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 shadow-sm backdrop-blur-md">
            <NavLink to="/verify" className="flex items-center gap-3 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors" onClick={close}>
              <HiOutlineDocumentText size={18} className="text-indigo-500" />
              <span>Verify Certificate</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
