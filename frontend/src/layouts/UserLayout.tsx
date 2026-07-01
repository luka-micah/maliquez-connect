import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { FiUser, FiHeart, FiStar, FiThumbsUp } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface SidebarLink {
  to: string;
  label: string;
  icon: IconType;
}

const sidebarLinks: SidebarLink[] = [
  { to: '/dashboard', label: 'Profile', icon: FiUser },
  { to: '/favorites', label: 'Favorites', icon: FiHeart },
  { to: '/my-reviews', label: 'My Reviews', icon: FiStar },
  { to: '/recommendations', label: 'Recommendations', icon: FiThumbsUp },
];

const UserLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <div className="flex-1 flex">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <nav className="p-4 space-y-1">
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
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

export default UserLayout;
