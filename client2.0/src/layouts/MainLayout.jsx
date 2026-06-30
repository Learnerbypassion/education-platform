import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => (
  <div className="min-h-screen bg-transparent">
    <Navbar />
    <main className="min-h-[calc(100vh-5rem)] animate-page-enter">
      {children || <Outlet />}
    </main>
    <Footer />
  </div>
);

export default MainLayout;
