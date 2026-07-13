import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 min-h-0 overflow-x-auto">
      <div className="min-w-0">
        <Outlet />
      </div>
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
