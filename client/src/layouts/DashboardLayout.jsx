import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const DashboardLayout = () => (
  <div className="min-h-screen bg-transparent">
    <Navbar showSidebarToggle={true} />
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar />
      <main className="min-w-0 flex-1 animate-page-enter">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
