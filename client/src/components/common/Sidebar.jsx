import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebarOpen } from '../../store/slices/uiSlice';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineHome, HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineAcademicCap, HiOutlineDocumentText, HiOutlineCog, HiOutlineChartBar, HiOutlinePlus, HiOutlineX, HiOutlineUsers } from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = () => {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { isInstructor, isAdmin } = useAuth();
  const dispatch = useDispatch();

  const close = () => dispatch(setSidebarOpen(false));

  const studentLinks = [
    { to: '/dashboard', icon: <HiOutlineHome />, label: 'Dashboard' },
    { to: '/courses', icon: <HiOutlineBookOpen />, label: 'Explore Courses' },
    { to: '/dashboard?tab=enrolled', icon: <HiOutlineClipboardList />, label: 'My Courses' },
    { to: '/certificates', icon: <HiOutlineAcademicCap />, label: 'Certificates' },
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
      {sidebarOpen && <div className="sidebar-overlay" onClick={close} />}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} id="main-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">Navigation</span>
          <button className="btn-icon sidebar-close" onClick={close}><HiOutlineX size={20} /></button>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`} onClick={close}>
              <span className="sidebar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/verify" className="sidebar-link" onClick={close}>
            <span className="sidebar-link-icon"><HiOutlineDocumentText /></span>
            <span>Verify Certificate</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
