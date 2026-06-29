import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>
      {children || <Outlet />}
    </main>
    <Footer />
  </>
);

export default MainLayout;
