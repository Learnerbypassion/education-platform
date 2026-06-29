import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => (
  <>
    <Navbar />
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  </>
);

export default DashboardLayout;
