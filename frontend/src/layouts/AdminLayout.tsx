import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiGrid, FiUsers, FiBriefcase, FiList, FiFolder, FiStar, FiBarChart2, FiImage, FiCalendar, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import type { IconType } from 'react-icons';

interface SidebarLink {
  to: string;
  label: string;
  icon: IconType;
}

const sidebarLinks: SidebarLink[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/providers', label: 'Providers', icon: FiBriefcase },
  { to: '/admin/listings', label: 'Listings', icon: FiList },
  { to: '/admin/categories', label: 'Categories', icon: FiFolder },
  { to: '/admin/ads', label: 'Ads', icon: FiImage },
  { to: '/admin/events', label: 'Events', icon: FiCalendar },
  { to: '/admin/reviews', label: 'Reviews', icon: FiStar },
  { to: '/admin/reports', label: 'Reports', icon: FiBarChart2 },
];

const AdminLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex overflow-x-auto">
        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-primary-600 text-white rounded-xl shadow-lg hover:bg-primary-500 flex items-center justify-center"
          aria-label="Toggle navigation"
        >
          {mobileSidebarOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        <aside className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl transition-transform duration-300 md:hidden ${mobileSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex items-center justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <nav className="grid grid-cols-4 gap-1 pb-6 px-3 max-h-[50vh] overflow-y-auto">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileSidebarOpen(false)}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex flex-col items-center gap-1 px-1 py-3 rounded-lg transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium truncate w-full text-center">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Desktop sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:block min-w-0">
          <nav className="p-4 space-y-1 sticky top-16">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
