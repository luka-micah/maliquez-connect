import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiSearch, FiBell, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import type { User } from '../../types';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, logout } = useAuth() as { user: User | null; isAuthenticated: boolean; logout: () => void };
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'PROVIDER': return '/provider/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-primary-700">
              Maliquez<span className="text-primary-500">Connect</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/search" className="text-gray-600 hover:text-primary-600">Search</Link>
              <Link to="/categories" className="text-gray-600 hover:text-primary-600">Categories</Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schools, hospitals, hotels..."
                className="input-field pl-10"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="relative text-gray-600 hover:text-primary-600">
                  <FiBell className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium">{user?.firstName}</span>
                    <FiChevronDown className="w-4 h-4" />
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <Link to={getDashboardLink()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setShowDropdown(false)}>
                        Dashboard
                      </Link>
                      <button
                        onClick={() => { setShowDropdown(false); logout(); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-600">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          <button className="md:hidden text-gray-600" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="input-field"
              />
            </form>
            <Link to="/search" className="block text-gray-600 py-2">Search</Link>
            <Link to="/categories" className="block text-gray-600 py-2">Categories</Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block text-gray-600 py-2">Dashboard</Link>
                <button onClick={logout} className="block text-red-600 py-2">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 py-2">Login</Link>
                <Link to="/register" className="block text-primary-600 py-2">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
